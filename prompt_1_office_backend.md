# PROMPT 1 — VanLoka Office Admin Panel: New Azure Functions Backend
## (Express.js Monolith → React + Azure Functions + Azure PostgreSQL Migration)

---

## CONTEXT — READ THIS FIRST BEFORE ANYTHING ELSE

This project has a specific and important history that shapes every decision you make.

The **VanLoka Office Admin Panel** was originally a **monolithic Express.js backend** — a single `server.ts` file (1,687 lines) handling all routes using Express middleware, Zod validation, a global error handler, and `pg` Pool connected to an existing Azure PostgreSQL database under the schema `schemaa`. The frontend is a React + Vite + TypeScript app that currently calls this Express backend.

The goal is a **full rewrite** of the backend into **Azure Functions v4 (Node.js 20, TypeScript)**, targeting **Azure PostgreSQL**, maintaining **full org_id multi-tenant isolation**, and following a specific architectural standard defined by a colleague's existing `/api` folder (the MDS/Instructor app).

Key facts that shape every decision:

1. **There is a colleague's Azure Functions project (`/api` folder)** that serves the MDS/Instructor app. You MUST read it completely for all architectural conventions — the Azure Functions v4 programmatic model, shared utilities (`shared/db.ts`, `shared/auth.ts`, `shared/response.ts`), the `withTenant()` RLS pattern, JWT auth, error handling, `ok()`/`err()`/`preflight()` helpers. Every function you write follows the same architecture.

2. **The new Office backend is a greenfield Azure Functions project** called `api-office/`. You are NOT modifying the colleague's `/api` folder. You are creating a parallel, separate functions app that follows the same conventions.

3. **The database is new** — all tables are new, prefixed `vl_` (for VanLoka), under the `public` schema (no custom schema prefix). Tables use UUID primary keys, integer `org_id`, and snake_case column names.

4. **The React frontend sends `camelCase` JSON bodies** for all create/update requests — e.g. `{ firstName, vehicleNumber, mobileNumber }`. The backend must accept camelCase body fields and map them to snake_case DB columns.

5. **The response envelope is the colleague's standard** — `{ success, data, meta, error }` — NOT the old Express pattern of `{ success, data, message }`. Pagination is `meta: { page, pageSize, total }` — NOT the old Laravel-style paginator.

6. **No multipart/FormData** — unlike the Institute app, the Office admin panel sends JSON bodies. File uploads (profile photos, documents) are out of scope for the initial build. All endpoints receive and return `application/json`.

7. **This is an Azure Functions v4 project** — Node.js 20, TypeScript, CommonJS output, flat function-per-file architecture. No Express, no controllers, no service layers. Each Azure Function IS the handler.

---

## PART 0 — READ EVERY FILE IN /api BEFORE WRITING ANY CODE (MANDATORY)

Open and read every single file in the `/api` folder completely. Do not skip any file.

```
/api/
├── package.json
├── host.json
├── tsconfig.json
├── local.settings.json
├── shared/
│   ├── db.ts           ← Pool singleton, getPool(), withTenant(client, orgId)
│   ├── auth.ts         ← MdsToken interface, requireAuth(req), signToken()
│   └── response.ts     ← ok(data, meta?), err(status, message), preflight()
└── functions/
    ├── index.ts        ← Master import — how all functions are registered
    ├── auth/login.ts
    ├── auth/refresh.ts
    ├── roles/index.ts
    ├── roles/byId.ts
    ├── staff/index.ts
    ├── staff/byId.ts
    ├── vehicles/index.ts
    ├── vehicles/byId.ts
    ├── vehicles/live.ts
    ├── dashboard/stats.ts
    ├── sessions/index.ts
    ├── sessions/updateStatus.ts
    ├── instructors/index.ts
    ├── instructors/byId.ts
    ├── trainees/index.ts
    ├── trainees/byId.ts
    └── fees/index.ts
```

From reading these files, internalize and note down:

- The exact signature of `app.http(name, { route, methods, authLevel, handler })`
- The exact flow: OPTIONS check → `requireAuth(req)` → `getPool().connect()` → `withTenant(client, orgId)` → SQL → `ok()`/`err()` → `finally { client.release() }`
- The `MdsToken` interface fields: `sub`, `org_id`, `permissions`
- How `ok(data, meta)` constructs `{ success: true, data, meta, error: null }`
- How `err(status, message)` constructs `{ success: false, data: null, error: { message } }`
- How PostgreSQL error codes `23505` (duplicate) and `23503` (FK violation) are caught
- How `result.rowCount === 0` triggers a 404 on DELETE
- The `COALESCE($n, column)` pattern in UPDATE queries
- How `host.json` is configured (extension bundle v4)
- How `tsconfig.json` is set (CommonJS, ES2020, strict: false)
- How `functions/index.ts` imports every function file

This is your **single architectural source of truth**. Every new function you write must be structurally identical.

---

## PART 1 — THE DATABASE SCHEMA

The following tables must be created in Azure PostgreSQL under the `public` schema. All tables use the `vl_` prefix. Primary keys are UUIDs. `org_id` is INTEGER (not TEXT). Write all SQL queries targeting these tables exactly as defined.

```sql
-- 1. Organizations
CREATE TABLE IF NOT EXISTS vl_organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Roles (auth source — login credentials live here)
CREATE TABLE IF NOT EXISTS vl_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES vl_organizations(id),
  role_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  access_level VARCHAR(50) DEFAULT 'Partial Access',
  description TEXT,
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'Active',
  login_email VARCHAR(255),
  login_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, login_email)
);
CREATE INDEX idx_vl_roles_org ON vl_roles(org_id);
CREATE INDEX idx_vl_roles_email ON vl_roles(login_email);

-- 3. Staff / Employees
CREATE TABLE IF NOT EXISTS vl_staff_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES vl_organizations(id),
  role_id UUID REFERENCES vl_roles(id),
  employee_id VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  designation VARCHAR(100),
  department VARCHAR(100),
  employment_type VARCHAR(50),
  joining_date DATE,
  marital_status VARCHAR(20),
  dob DATE,
  address TEXT,
  address2 TEXT,
  landmark TEXT,
  state VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100),
  pin_code VARCHAR(10),
  emergency_name VARCHAR(100),
  emergency_phone VARCHAR(20),
  emergency_email VARCHAR(255),
  bank_name VARCHAR(100),
  account_holder VARCHAR(100),
  account_number VARCHAR(50),
  ifsc VARCHAR(20),
  profile_photo_url TEXT,
  roles JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'Active',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_staff_org ON vl_staff_members(org_id);
CREATE INDEX idx_vl_staff_org_status ON vl_staff_members(org_id, status);

-- 4. Vehicles
CREATE TABLE IF NOT EXISTS vl_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES vl_organizations(id),
  vehicle_number VARCHAR(50) NOT NULL,
  model VARCHAR(100),
  manufacturer VARCHAR(100),
  vehicle_type VARCHAR(50),
  year INTEGER,
  fuel_type VARCHAR(30),
  seating_capacity INTEGER,
  colour VARCHAR(30),
  status VARCHAR(20) DEFAULT 'Active',
  gps_device_id VARCHAR(100),
  sim_number VARCHAR(20),
  gps_install_date DATE,
  assigned_driver VARCHAR(100),
  ownership_type VARCHAR(30),
  owner_name VARCHAR(100),
  owner_contact VARCHAR(20),
  insurance_provider VARCHAR(100),
  insurance_policy_no VARCHAR(50),
  insurance_expiry DATE,
  permit_type VARCHAR(30),
  permit_number VARCHAR(50),
  permit_issue DATE,
  permit_expiry DATE,
  fitness_cert_no VARCHAR(50),
  fitness_expiry DATE,
  pollution_cert_no VARCHAR(50),
  pollution_expiry DATE,
  last_service DATE,
  next_service DATE,
  km_driven INTEGER,
  fire_extinguisher BOOLEAN DEFAULT FALSE,
  first_aid_kit BOOLEAN DEFAULT FALSE,
  cctv BOOLEAN DEFAULT FALSE,
  panic_button BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, vehicle_number)
);
CREATE INDEX idx_vl_vehicles_org ON vl_vehicles(org_id);
CREATE INDEX idx_vl_vehicles_org_status ON vl_vehicles(org_id, status);

-- 5. Drivers
CREATE TABLE IF NOT EXISTS vl_drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES vl_organizations(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20),
  dob DATE,
  email VARCHAR(255),
  mobile_number VARCHAR(20),
  blood_group VARCHAR(10),
  marital_status VARCHAR(20),
  profile_photo_url TEXT,
  employment_type VARCHAR(50),
  employee_id VARCHAR(50),
  dl_number VARCHAR(50),
  dl_issue_date DATE,
  dl_expiry_date DATE,
  license_type VARCHAR(50),
  driving_experience INTEGER,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  assigned_vehicle_id UUID,
  vehicle_reg VARCHAR(50),
  beacon_id VARCHAR(100),
  operational_base VARCHAR(100),
  current_status VARCHAR(20) DEFAULT 'Active',
  status VARCHAR(20) DEFAULT 'Active',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_drivers_org ON vl_drivers(org_id);
CREATE INDEX idx_vl_drivers_org_status ON vl_drivers(org_id, current_status);

-- 6. Vehicle Telemetry (live GPS)
CREATE TABLE IF NOT EXISTS vl_vehicle_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vl_vehicles(id),
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  speed DECIMAL(6, 2),
  heading INTEGER,
  status VARCHAR(30),
  driver_name VARCHAR(100),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_telemetry_org ON vl_vehicle_telemetry(org_id);
CREATE INDEX idx_vl_telemetry_vehicle ON vl_vehicle_telemetry(vehicle_id);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS vl_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_notifications_org ON vl_notifications(org_id);
CREATE INDEX idx_vl_notifications_org_read ON vl_notifications(org_id, is_read, created_at DESC);

-- 8. Compliance
CREATE TABLE IF NOT EXISTS vl_compliance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  entity_type VARCHAR(30) NOT NULL,  -- 'vehicle' or 'driver'
  entity_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'Valid',
  document_url TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_compliance_org ON vl_compliance(org_id);
CREATE INDEX idx_vl_compliance_org_expiry ON vl_compliance(org_id, expiry_date);

-- 9. Devices (GPS/BLE)
CREATE TABLE IF NOT EXISTS vl_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  device_type VARCHAR(20) NOT NULL,  -- 'GPS' or 'BLE'
  serial_number VARCHAR(100),
  assigned_vehicle_id UUID REFERENCES vl_vehicles(id),
  battery_percent INTEGER,
  last_seen TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_devices_org ON vl_devices(org_id);

-- 10. Travellers
CREATE TABLE IF NOT EXISTS vl_travellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  profile_photo TEXT,
  route VARCHAR(255),
  boarding_point VARCHAR(255),
  beacon_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_travellers_org ON vl_travellers(org_id);

-- 11. Bookings
CREATE TABLE IF NOT EXISTS vl_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  traveller_id UUID REFERENCES vl_travellers(id),
  vehicle_id UUID REFERENCES vl_vehicles(id),
  driver_id UUID REFERENCES vl_drivers(id),
  route VARCHAR(255),
  booking_date DATE,
  pickup_point VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Pending',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_bookings_org ON vl_bookings(org_id);
CREATE INDEX idx_vl_bookings_org_date ON vl_bookings(org_id, booking_date DESC);

-- 12. Vendors
CREATE TABLE IF NOT EXISTS vl_vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100),
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  contract_status VARCHAR(20) DEFAULT 'Active',
  contract_start DATE,
  contract_end DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_vendors_org ON vl_vendors(org_id);

-- 13. Feedbacks
CREATE TABLE IF NOT EXISTS vl_feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  submitted_by VARCHAR(255),
  type VARCHAR(50),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  message TEXT,
  admin_reply TEXT,
  status VARCHAR(20) DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_feedbacks_org ON vl_feedbacks(org_id);

-- 14. App Users
CREATE TABLE IF NOT EXISTS vl_app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  role VARCHAR(50),  -- 'driver_app', 'traveller_app', 'admin'
  linked_entity_type VARCHAR(50),
  linked_entity_id UUID,
  last_active TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vl_app_users_org ON vl_app_users(org_id);
```

---

## PART 2 — SHARED UTILITIES

Create these 3 files. They are adapted from the colleague's `/api/shared/` but use the `VlToken` interface instead of `MdsToken`.

### `shared/db.ts`

Exact copy from friend's `shared/db.ts`. The `getPool()` function reads from env vars `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`. The `withTenant(client, orgId)` function executes `SET LOCAL app.current_org_id = ${orgId}`. Pool `max: 5`. SSL `rejectUnauthorized: false`.

### `shared/auth.ts`

Replace `MdsToken` with `VlToken`:

```typescript
export interface VlToken {
  sub: string;           // Role UUID
  email: string;
  org_id: number;        // INTEGER — not string
  role_name: string;
  permissions: string[]; // ["*"] for owner, or specific list
  access_level: string;  // "Root Access", "Full Access", "Partial Access"
  is_owner: boolean;
}
```

- `requireAuth(req)`: extracts `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, returns `{ user: VlToken }` or `{ error: string }`
- `signToken(payload: VlToken)`: signs with `HS256`, expires in `86400` seconds

Also add a permission helper:
```typescript
export function hasPermission(user: VlToken, permission: string): boolean {
  if (user.is_owner) return true;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
}
```

### `shared/response.ts`

Exact copy from friend's `shared/response.ts`.
- `ok(data, meta?)` → `{ success: true, data, meta: meta ?? null, error: null }`, status 200
- `err(status, message)` → `{ success: false, data: null, error: { message } }`, status as given
- `preflight()` → status 204, CORS headers

CORS headers to set on every response:
```
Access-Control-Allow-Origin: process.env.ALLOWED_ORIGIN || "*"
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## PART 3 — AUTH FUNCTIONS

### `functions/auth/login.ts` — POST /auth/login

**Flow:**
1. Parse body: `{ email, password }`
2. Validate: both required
3. Query:
```sql
SELECT id, org_id, role_name, login_email, login_password,
       access_level, permissions, status
FROM vl_roles
WHERE login_email = $1 AND status = 'Active'
```
4. If no row → `err(401, "Invalid credentials")`
5. `bcrypt.compare(password, row.login_password)` — if false → `err(401, "Invalid credentials")`
6. Build `VlToken`:
   - `sub`: row.id
   - `email`: row.login_email
   - `org_id`: row.org_id
   - `role_name`: row.role_name
   - `permissions`: row.permissions (JSONB array)
   - `access_level`: row.access_level
   - `is_owner`: row.access_level === "Root Access"
7. `signToken(payload)` → JWT
8. Return `ok({ token, user: { id, email, orgId, roleName, permissions, accessLevel, isOwner } })`

### `functions/auth/refresh.ts` — POST /auth/refresh

1. `requireAuth(req)` — verify existing JWT
2. Re-sign the same payload with fresh expiry
3. Return `ok({ token })`

---

## PART 4 — FUNCTION MODULES

Every function MUST follow this exact pattern (adapted from colleague's code):

```
1. if (req.method === "OPTIONS") return preflight();
2. const auth = requireAuth(req);
   if ("error" in auth) return err(401, auth.error);
3. const client = await getPool().connect();
4. try {
     await withTenant(client, auth.user.org_id);
     // ... GET or POST or PUT or DELETE logic
   } catch (e: any) {
     ctx.error("functionName:", e);
     if (e.code === "23505") return err(409, "Record already exists");
     if (e.code === "23503") return err(404, "Related record not found");
     if (e.code === "23502") return err(400, "Required field missing");
     return err(500, "Server error");
   } finally {
     client.release();
   }
```

---

### 4.1 — `functions/dashboard/stats.ts`

**GET /dashboard/stats**

Run these 4 queries in `Promise.all`:

```sql
-- Vehicles
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status='Active') AS active,
       COUNT(*) FILTER (WHERE status='Maintenance') AS maintenance,
       COUNT(*) FILTER (WHERE status='Inactive') AS inactive
FROM vl_vehicles WHERE org_id = $1

-- Drivers
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE current_status='On Duty') AS on_duty,
       COUNT(*) FILTER (WHERE current_status='On Break') AS on_break,
       COUNT(*) FILTER (WHERE current_status='Offline') AS offline
FROM vl_drivers WHERE org_id = $1

-- Staff
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status='Active') AS active
FROM vl_staff_members WHERE org_id = $1

-- Bookings
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status='Confirmed') AS confirmed,
       COUNT(*) FILTER (WHERE status='Pending') AS pending,
       COUNT(*) FILTER (WHERE status='Cancelled') AS cancelled
FROM vl_bookings WHERE org_id = $1
```

Return: `ok({ vehicles, drivers, staff, bookings })` — each is `rows[0]` from respective query.

---

### 4.2 — `functions/roles/index.ts` + `functions/roles/byId.ts`

**GET /roles** — list all roles for org
```sql
SELECT id, role_name, department, access_level, description, permissions, status, login_email, created_at
FROM vl_roles
WHERE org_id = $1 AND ($2::text IS NULL OR status = $2)
ORDER BY role_name ASC
```
Query params: `status`. No pagination needed (roles lists are small). Return `ok(rows)`.

**POST /roles**
- Required: `roleName`
- Optional: `department, accessLevel, description, permissions, status, loginEmail, loginPassword`
- If `loginPassword` provided: hash with `bcrypt.hash(loginPassword, 10)`
- INSERT into `vl_roles`
- Return `ok(newRow)`

**PUT /roles/{id}**
- COALESCE update on: `role_name, department, access_level, description, permissions, status, login_email`
- If `loginPassword` in body: hash and update `login_password` separately
- Return updated row or `err(404)`

**DELETE /roles/{id}**
- DELETE WHERE id = $1 AND org_id = $2
- Check rowCount → `err(404)` if 0
- Return `ok({ deleted: true })`

---

### 4.3 — `functions/staff/index.ts` + `functions/staff/byId.ts`

**GET /staff**
Query params: `page` (default 1), `pageSize` (default 50, max 100), `status`, `search`, `department`

```sql
SELECT id, employee_id, first_name, last_name, gender, email, phone,
       designation, department, employment_type, joining_date, status,
       profile_photo_url, role_id, created_at
FROM vl_staff_members
WHERE org_id = $1
  AND ($2::text IS NULL OR status = $2)
  AND ($3::text IS NULL OR department = $3)
  AND ($4::text IS NULL OR
       first_name ILIKE '%' || $4 || '%' OR
       last_name ILIKE '%' || $4 || '%' OR
       email ILIKE '%' || $4 || '%' OR
       employee_id ILIKE '%' || $4 || '%' OR
       phone ILIKE '%' || $4 || '%')
ORDER BY created_at DESC
LIMIT $5 OFFSET $6
```

Run a COUNT query with same WHERE (minus LIMIT/OFFSET). Return `ok(rows, { page, pageSize, total })`.

**POST /staff**
Required: `firstName`, `lastName`
Map camelCase body → snake_case INSERT:
`firstName→first_name, lastName→last_name, employeeId→employee_id, roleId→role_id, joinDate→joining_date, profilePhotoUrl→profile_photo_url`, etc.
INSERT all fields. Return `ok(newRow)`.

**PUT /staff/{id}**
COALESCE update for all fields. WHERE id = $n AND org_id = $m. Return updated row or `err(404)`.

**DELETE /staff/{id}**
DELETE WHERE id AND org_id. Return `ok({ deleted: true })` or `err(404)`.

---

### 4.4 — `functions/vehicles/index.ts`, `byId.ts`, `live.ts`

**GET /vehicles**
Query params: `page`, `pageSize`, `status`, `vehicleType`, `search`

```sql
SELECT id, vehicle_number, model, manufacturer, vehicle_type, year, fuel_type,
       seating_capacity, colour, status, gps_device_id, assigned_driver,
       insurance_expiry, fitness_expiry, pollution_expiry, permit_expiry,
       created_at
FROM vl_vehicles
WHERE org_id = $1
  AND ($2::text IS NULL OR status = $2)
  AND ($3::text IS NULL OR vehicle_type = $3)
  AND ($4::text IS NULL OR
       vehicle_number ILIKE '%' || $4 || '%' OR
       model ILIKE '%' || $4 || '%' OR
       assigned_driver ILIKE '%' || $4 || '%')
ORDER BY created_at DESC
LIMIT $5 OFFSET $6
```

Return `ok(rows, { page, pageSize, total })`.

**POST /vehicles**
Required: `vehicleNumber`
Map camelCase → snake_case. INSERT. Return `ok(newRow)`.

**PUT /vehicles/{id}**
COALESCE update. Boolean fields (`fireExtinguisher→fire_extinguisher, firstAidKit→first_aid_kit, cctv, panicButton→panic_button`) must be handled as boolean: `COALESCE($n::boolean, fire_extinguisher)`.
Return updated row or `err(404)`.

**DELETE /vehicles/{id}**
Return `ok({ deleted: true })` or `err(404)`.

**GET /vehicles/live**

> ⚠️ Register this route BEFORE `vehicles/{id}` in `functions/index.ts` to prevent route conflict.

```sql
SELECT DISTINCT ON (t.vehicle_id)
  t.vehicle_id, t.lat, t.lng, t.speed, t.heading, t.status, t.driver_name,
  t.recorded_at, v.vehicle_number, v.model
FROM vl_vehicle_telemetry t
JOIN vl_vehicles v ON v.id = t.vehicle_id
WHERE t.org_id = $1
ORDER BY t.vehicle_id, t.recorded_at DESC
```

Return `ok(rows)`.

---

### 4.5 — `functions/drivers/index.ts` + `functions/drivers/byId.ts`

**GET /drivers**
Query params: `page`, `pageSize`, `status`, `city`, `search`

```sql
SELECT id, first_name, last_name, gender, email, mobile_number,
       dl_number, dl_expiry_date, license_type, current_status,
       assigned_vehicle_id, vehicle_reg, operational_base,
       profile_photo_url, employee_id, created_at
FROM vl_drivers
WHERE org_id = $1
  AND ($2::text IS NULL OR current_status = $2)
  AND ($3::text IS NULL OR operational_base = $3)
  AND ($4::text IS NULL OR
       first_name ILIKE '%' || $4 || '%' OR
       last_name ILIKE '%' || $4 || '%' OR
       mobile_number ILIKE '%' || $4 || '%' OR
       employee_id ILIKE '%' || $4 || '%' OR
       email ILIKE '%' || $4 || '%')
ORDER BY created_at DESC
LIMIT $5 OFFSET $6
```

Return `ok(rows, { page, pageSize, total })`.

**POST /drivers**
Required: `firstName`, `lastName`
Map: `firstName→first_name, lastName→last_name, mobileNumber→mobile_number, bloodGroup→blood_group, maritalStatus→marital_status, profilePhotoUrl→profile_photo_url, employmentType→employment_type, employeeId→employee_id, dlNumber→dl_number, dlIssueDate→dl_issue_date, dlExpiryDate→dl_expiry_date, licenseType→license_type, drivingExperience→driving_experience, pinCode→pin_code, assignedVehicleId→assigned_vehicle_id, vehicleReg→vehicle_reg, beaconId→beacon_id, operationalBase→operational_base, currentStatus→current_status`
INSERT. Return `ok(newRow)`.

**PUT /drivers/{id}**
COALESCE update for all above fields. Return updated row or `err(404)`.

**DELETE /drivers/{id}**
Return `ok({ deleted: true })` or `err(404)`.

---

### 4.6 — `functions/travellers/index.ts` + `byId.ts`

**GET /travellers**
Query params: `page`, `pageSize`, `status`, `route`, `search`

```sql
SELECT id, first_name, last_name, gender, email, phone,
       route, boarding_point, beacon_id, status, created_at
FROM vl_travellers
WHERE org_id = $1
  AND ($2::text IS NULL OR status = $2)
  AND ($3::text IS NULL OR route = $3)
  AND ($4::text IS NULL OR
       first_name ILIKE '%' || $4 || '%' OR
       last_name ILIKE '%' || $4 || '%' OR
       phone ILIKE '%' || $4 || '%' OR
       email ILIKE '%' || $4 || '%')
ORDER BY created_at DESC
LIMIT $5 OFFSET $6
```

**POST /travellers** — Required: `firstName`, `lastName`
Map: `firstName→first_name, lastName→last_name, boardingPoint→boarding_point, beaconId→beacon_id, profilePhoto→profile_photo`
INSERT. Return `ok(newRow)`.

**PUT /travellers/{id}** — COALESCE update. Return updated row or `err(404)`.

**DELETE /travellers/{id}** — Return `ok({ deleted: true })` or `err(404)`.

---

### 4.7 — `functions/bookings/index.ts`, `byId.ts`, `updateStatus.ts`

**GET /bookings**
Query params: `page`, `pageSize`, `status`, `dateFrom`, `dateTo`, `search`

```sql
SELECT b.id, b.route, b.booking_date, b.pickup_point, b.status, b.remarks,
       b.created_at,
       b.traveller_id, t.first_name || ' ' || t.last_name AS traveller_name,
       b.vehicle_id, v.vehicle_number,
       b.driver_id, d.first_name || ' ' || d.last_name AS driver_name
FROM vl_bookings b
LEFT JOIN vl_travellers t ON t.id = b.traveller_id
LEFT JOIN vl_vehicles v ON v.id = b.vehicle_id
LEFT JOIN vl_drivers d ON d.id = b.driver_id
WHERE b.org_id = $1
  AND ($2::text IS NULL OR b.status = $2)
  AND ($3::date IS NULL OR b.booking_date >= $3)
  AND ($4::date IS NULL OR b.booking_date <= $4)
  AND ($5::text IS NULL OR
       t.first_name ILIKE '%' || $5 || '%' OR
       t.last_name ILIKE '%' || $5 || '%' OR
       v.vehicle_number ILIKE '%' || $5 || '%')
ORDER BY b.booking_date DESC, b.created_at DESC
LIMIT $6 OFFSET $7
```

**POST /bookings**
Fields: `travellerId→traveller_id, vehicleId→vehicle_id, driverId→driver_id, route, bookingDate→booking_date, pickupPoint→pickup_point, status, remarks`
INSERT. Return `ok(newRow)`.

**PUT /bookings/{id}** — COALESCE update. Return updated row or `err(404)`.

**DELETE /bookings/{id}** — Return `ok({ deleted: true })` or `err(404)`.

**PUT /bookings/{id}/status** (separate file: `updateStatus.ts`)

> ⚠️ Register this route BEFORE `bookings/{id}` in `functions/index.ts`.

```
route: "bookings/{id}/status", methods: ["PUT", "OPTIONS"]
```

Body: `{ status }` — Required
```sql
UPDATE vl_bookings SET status = $1, updated_at = NOW()
WHERE id = $2 AND org_id = $3
RETURNING id, status, updated_at
```

Return `ok(rows[0])` or `err(404)`.

---

### 4.8 — `functions/vendors/index.ts` + `byId.ts`

**GET /vendors**
Query params: `page`, `pageSize`, `status`, `serviceType`, `search`

```sql
SELECT id, name, service_type, contact_name, contact_phone, contact_email,
       contract_status, contract_start, contract_end, remarks, created_at
FROM vl_vendors
WHERE org_id = $1
  AND ($2::text IS NULL OR contract_status = $2)
  AND ($3::text IS NULL OR service_type = $3)
  AND ($4::text IS NULL OR
       name ILIKE '%' || $4 || '%' OR
       contact_name ILIKE '%' || $4 || '%' OR
       contact_phone ILIKE '%' || $4 || '%')
ORDER BY created_at DESC
LIMIT $5 OFFSET $6
```

**POST /vendors** — Required: `name`
Map: `serviceType→service_type, contactName→contact_name, contactPhone→contact_phone, contactEmail→contact_email, contractStatus→contract_status, contractStart→contract_start, contractEnd→contract_end`

**PUT /vendors/{id}** — COALESCE update. Return updated row or `err(404)`.
**DELETE /vendors/{id}** — Return `ok({ deleted: true })` or `err(404)`.

---

### 4.9 — `functions/feedbacks/index.ts` + `byId.ts`

**GET /feedbacks**
Query params: `page`, `pageSize`, `status`, `type`, `rating`, `search`

```sql
SELECT id, submitted_by, type, rating, message, admin_reply, status, created_at, updated_at
FROM vl_feedbacks
WHERE org_id = $1
  AND ($2::text IS NULL OR status = $2)
  AND ($3::text IS NULL OR type = $3)
  AND ($4::integer IS NULL OR rating = $4)
  AND ($5::text IS NULL OR
       submitted_by ILIKE '%' || $5 || '%' OR
       message ILIKE '%' || $5 || '%')
ORDER BY created_at DESC
LIMIT $6 OFFSET $7
```

**PUT /feedbacks/{id}** — Only `adminReply→admin_reply` and `status` are updatable.
```sql
UPDATE vl_feedbacks
SET admin_reply = COALESCE($1, admin_reply),
    status = COALESCE($2, status),
    updated_at = NOW()
WHERE id = $3 AND org_id = $4
RETURNING *
```

---

### 4.10 — `functions/compliance/index.ts` + `byId.ts`

**GET /compliance**
Query params: `page`, `pageSize`, `entityType`, `status`, `search`

```sql
SELECT c.*,
  CASE c.entity_type
    WHEN 'vehicle' THEN (SELECT vehicle_number FROM vl_vehicles WHERE id = c.entity_id)
    WHEN 'driver' THEN (SELECT first_name || ' ' || last_name FROM vl_drivers WHERE id = c.entity_id)
  END AS entity_name,
  (c.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM vl_compliance c
WHERE c.org_id = $1
  AND ($2::text IS NULL OR c.entity_type = $2)
  AND ($3::text IS NULL OR c.status = $3)
  AND ($4::text IS NULL OR c.document_type ILIKE '%' || $4 || '%')
ORDER BY c.expiry_date ASC
LIMIT $5 OFFSET $6
```

**POST /compliance**
All JSON body. Fields: `entityType→entity_type, entityId→entity_id, documentType→document_type, documentNumber→document_number, issueDate→issue_date, expiryDate→expiry_date, status, documentUrl→document_url, remarks`
INSERT. Return `ok(newRow)`.

**PUT /compliance/{id}** — COALESCE update. Return updated row or `err(404)`.
**DELETE /compliance/{id}** — Return `ok({ deleted: true })` or `err(404)`.

---

### 4.11 — `functions/devices/index.ts` + `byId.ts`

**GET /devices**
Query params: `page`, `pageSize`, `deviceType`, `status`

```sql
SELECT d.*, v.vehicle_number AS assigned_vehicle_number
FROM vl_devices d
LEFT JOIN vl_vehicles v ON v.id = d.assigned_vehicle_id
WHERE d.org_id = $1
  AND ($2::text IS NULL OR d.device_type = $2)
  AND ($3::text IS NULL OR d.status = $3)
ORDER BY d.created_at DESC
LIMIT $4 OFFSET $5
```

**POST /devices** — Required: `deviceId`, `deviceType`
Map: `deviceId→device_id, deviceType→device_type, serialNumber→serial_number, assignedVehicleId→assigned_vehicle_id, batteryPercent→battery_percent`

**PUT /devices/{id}** — COALESCE update. Return updated row or `err(404)`.
**DELETE /devices/{id}** — Return `ok({ deleted: true })` or `err(404)`.

---

### 4.12 — `functions/app-users/index.ts` + `byId.ts`

**GET /app-users**
Query params: `page`, `pageSize`, `role`, `status`

```sql
SELECT id, name, phone, email, role, linked_entity_type,
       linked_entity_id, last_active, status, created_at
FROM vl_app_users
WHERE org_id = $1
  AND ($2::text IS NULL OR role = $2)
  AND ($3::text IS NULL OR status = $3)
ORDER BY created_at DESC
LIMIT $4 OFFSET $5
```

**PUT /app-users/{id}** — Only `status` and `lastActive→last_active` are updatable.

---

### 4.13 — `functions/notifications/index.ts`, `unreadCount.ts`, `markRead.ts`

**GET /notifications**
Query params: `page`, `pageSize`, `type`, `isRead`

```sql
SELECT id, type, title, message, entity_type, entity_id, is_read, created_at
FROM vl_notifications
WHERE org_id = $1
  AND ($2::text IS NULL OR type = $2)
  AND ($3::boolean IS NULL OR is_read = $3)
ORDER BY created_at DESC
LIMIT $4 OFFSET $5
```

**GET /notifications/unread-count** (separate file: `unreadCount.ts`)

> ⚠️ Register BEFORE `notifications/{id}/read` and notifications list route.

```sql
SELECT COUNT(*) AS count FROM vl_notifications
WHERE org_id = $1 AND is_read = FALSE
```

Return `ok({ unreadCount: parseInt(rows[0].count) })`.

**PUT /notifications/{id}/read** (in `markRead.ts`)

> ⚠️ Route: `notifications/{id}/read` — register BEFORE general notification routes.

```sql
UPDATE vl_notifications SET is_read = TRUE
WHERE id = $1 AND org_id = $2
RETURNING id, is_read
```

Return `ok(rows[0])` or `err(404)`.

**PUT /notifications/read-all** (also in `markRead.ts` or separate function)

```sql
UPDATE vl_notifications SET is_read = TRUE
WHERE org_id = $1 AND is_read = FALSE
```

Return `ok({ updated: result.rowCount })`.

---

### 4.14 — `functions/masters/dropdowns.ts`

**GET /masters/dropdowns**

Query param: `type` — determines which list to return.

Handle these `type` values by returning hardcoded arrays (no DB needed):

- `vehicleTypes` → `["Sedan", "SUV", "Van", "Bus", "Minibus", "Truck", "Auto"]`
- `fuelTypes` → `["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]`
- `employmentTypes` → `["Full-time", "Part-time", "Contract", "Temporary"]`
- `genders` → `["Male", "Female", "Other"]`
- `statusOptions` → `["Active", "Inactive", "Suspended"]`
- `driverStatuses` → `["On Duty", "On Break", "Offline", "Active", "Inactive"]`
- `complianceTypes` → `["Insurance", "Fitness Certificate", "Pollution Certificate", "Permit", "Driver License"]`
- `deviceTypes` → `["GPS", "BLE"]`
- `feedbackTypes` → `["Complaint", "Suggestion", "Compliment"]`
- `bookingStatuses` → `["Pending", "Confirmed", "Completed", "Cancelled"]`
- `ownershipTypes` → `["Owned", "Leased", "Rented"]`

For `type = states`: query a static in-memory list of Indian states.
For `type = districts/{state}`: return districts for that state (either hardcoded map or DB table if you add one).

If `type` is unrecognized → `err(400, "Unknown dropdown type")`.

---

### 4.15 — `functions/settings/index.ts`

**GET /settings**

```sql
SELECT * FROM vl_organizations WHERE id = $1
```

Use `auth.user.org_id` as `$1`. If no row → `err(404, "Organization not found")`. Return `ok(rows[0])`.

**PUT /settings**

Body fields: `name, logoUrl→logo_url, address, contactPhone→contact_phone, contactEmail→contact_email, settings` (JSONB)

```sql
UPDATE vl_organizations
SET name = COALESCE($1, name),
    logo_url = COALESCE($2, logo_url),
    address = COALESCE($3, address),
    contact_phone = COALESCE($4, contact_phone),
    contact_email = COALESCE($5, contact_email),
    settings = COALESCE($6::jsonb, settings),
    updated_at = NOW()
WHERE id = $7
RETURNING *
```

Return `ok(rows[0])` or `err(404)`.

---

## PART 5 — `functions/index.ts` — MASTER IMPORT ORDER

Route conflict resolution is critical. Register specific routes BEFORE parameterized routes.

```typescript
// Auth
import "./auth/login";
import "./auth/refresh";

// Dashboard
import "./dashboard/stats";

// Roles
import "./roles/index";
import "./roles/byId";

// Staff
import "./staff/index";
import "./staff/byId";

// Vehicles — live route MUST be before byId
import "./vehicles/live";           // GET /vehicles/live
import "./vehicles/index";          // GET+POST /vehicles
import "./vehicles/byId";           // PUT+DELETE /vehicles/{id}

// Drivers
import "./drivers/index";
import "./drivers/byId";

// Travellers
import "./travellers/index";
import "./travellers/byId";

// Bookings — updateStatus MUST be before byId
import "./bookings/updateStatus";   // PUT /bookings/{id}/status
import "./bookings/index";          // GET+POST /bookings
import "./bookings/byId";           // PUT+DELETE /bookings/{id}

// Vendors
import "./vendors/index";
import "./vendors/byId";

// Feedbacks
import "./feedbacks/index";
import "./feedbacks/byId";

// Compliance
import "./compliance/index";
import "./compliance/byId";

// Devices
import "./devices/index";
import "./devices/byId";

// App Users
import "./app-users/index";
import "./app-users/byId";

// Notifications — unread-count and read-all BEFORE parameterized routes
import "./notifications/unreadCount";   // GET /notifications/unread-count
import "./notifications/markRead";      // PUT /notifications/{id}/read + read-all
import "./notifications/index";         // GET /notifications

// Masters
import "./masters/dropdowns";

// Settings
import "./settings/index";
```

---

## PART 6 — PROJECT SCAFFOLD

### `api-office/package.json`

```json
{
  "name": "vanloka-office-api",
  "version": "1.0.0",
  "main": "dist/functions/index.js",
  "scripts": {
    "build": "tsc",
    "start": "func start --script-root dist",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.0.0",
    "@types/pg": "^8.11.0",
    "typescript": "^5.0.0"
  }
}
```

### `api-office/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": ".",
    "strict": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noUnusedLocals": false
  },
  "include": ["shared/**/*", "functions/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `api-office/host.json`

Exact copy from colleague's `/api/host.json`.

### `api-office/local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "PG_HOST": "vanloka-postgres.postgres.database.azure.com",
    "PG_PORT": "5432",
    "PG_USER": "vanloka_admin",
    "PG_PASSWORD": "MyNewPass@123",
    "PG_DATABASE": "postgres",
    "JWT_SECRET": "<strong-256-bit-random-string>",
    "JWT_EXPIRES_IN": "86400",
    "ALLOWED_ORIGIN": "http://localhost:5173"
  }
}
```

### `api-office/dist-package.json`

```json
{
  "name": "vanloka-office-api",
  "version": "1.0.0",
  "main": "functions/index.js"
}
```

---

## PART 7 — CROSS-CUTTING RULES (NEVER VIOLATE)

1. Every function: `if (req.method === "OPTIONS") return preflight();` is line 1 of the handler
2. Every function: `requireAuth(req)` called before any DB access
3. Every function: `withTenant(client, token.org_id)` called before any query
4. Every `WHERE` clause includes `org_id = $1` using `auth.user.org_id` from JWT — **never from URL params**
5. Every `INSERT` includes `org_id` from `auth.user.org_id`
6. Every `UPDATE` uses `COALESCE($n, column_name)` for every updatable field
7. Every `DELETE` checks `result.rowCount === 0` → `err(404, "Not found")`
8. PostgreSQL error code `23505` → `err(409, "Record already exists")`
9. PostgreSQL error code `23503` → `err(404, "Related record not found")`
10. All SQL uses parameterized `$1, $2, ...` — **zero string interpolation** — ever
11. All table references are unprefixed (public schema, no schema qualifier needed)
12. All list endpoints return `ok(rows, { page, pageSize, total })` with friend's meta shape
13. `client.release()` always in `finally` block — connection leaks are fatal in Azure Functions
14. Body field names are `camelCase` (frontend sends camelCase); DB columns are `snake_case`
15. All Azure Function names must be unique across the entire app (e.g. `driversIndex`, `driversById`, `vehiclesLive`)

---

## PART 8 — DELIVERY FORMAT

Output files in this exact order. Every file must be 100% complete, compilable TypeScript. No `// TODO`, no `// implement this`, no placeholders. Every SQL query written in full with all parameters.

1. `shared/db.ts`
2. `shared/auth.ts`
3. `shared/response.ts`
4. `functions/auth/login.ts`
5. `functions/auth/refresh.ts`
6. `functions/dashboard/stats.ts`
7. `functions/roles/index.ts`
8. `functions/roles/byId.ts`
9. `functions/staff/index.ts`
10. `functions/staff/byId.ts`
11. `functions/vehicles/live.ts`
12. `functions/vehicles/index.ts`
13. `functions/vehicles/byId.ts`
14. `functions/drivers/index.ts`
15. `functions/drivers/byId.ts`
16. `functions/travellers/index.ts`
17. `functions/travellers/byId.ts`
18. `functions/bookings/updateStatus.ts`
19. `functions/bookings/index.ts`
20. `functions/bookings/byId.ts`
21. `functions/vendors/index.ts`
22. `functions/vendors/byId.ts`
23. `functions/feedbacks/index.ts`
24. `functions/feedbacks/byId.ts`
25. `functions/compliance/index.ts`
26. `functions/compliance/byId.ts`
27. `functions/devices/index.ts`
28. `functions/devices/byId.ts`
29. `functions/app-users/index.ts`
30. `functions/app-users/byId.ts`
31. `functions/notifications/unreadCount.ts`
32. `functions/notifications/markRead.ts`
33. `functions/notifications/index.ts`
34. `functions/masters/dropdowns.ts`
35. `functions/settings/index.ts`
36. `functions/index.ts` (complete master import block)
37. `package.json`
