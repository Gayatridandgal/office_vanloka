# VanLoka Office Admin — Backend Technical Specification

> **Purpose**: Replicate the MDS API (`/api` folder) architecture, conventions and standards for the VanLoka Office Admin Panel, targeting **Azure Functions v4 + Azure PostgreSQL** with full **org_id multi-tenant isolation**.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Mapping — Your Backend vs Friend's Standard](#2-api-mapping)
3. [Database Setup — Azure PostgreSQL](#3-database-setup)
4. [Implementation Steps](#4-implementation-steps)
5. [Core Modules](#5-core-modules)
6. [Azure Deployment](#6-azure-deployment)
7. [Code Snippets](#7-code-snippets)
8. [Complete API List for Office Admin Panel](#8-complete-api-list)
9. [Gap Analysis](#9-gap-analysis)
10. [Production Checklist](#10-production-checklist)

---

## 1. Architecture Overview

### 1.1 Friend's `/api` Folder Structure

```
api/
├── package.json              # Dependencies: @azure/functions, pg, bcryptjs, jsonwebtoken
├── host.json                 # Azure Functions v4 host config, extension bundle
├── tsconfig.json             # CommonJS, ES2020, strict: false
├── local.settings.json       # Env vars: PG_*, JWT_SECRET, ALLOWED_ORIGIN
├── dist-package.json         # Dist entry point for Azure deployment
├── index.ts                  # Root (unused, Bun init placeholder)
│
├── shared/                   # ━━ SHARED UTILITIES (3 files) ━━
│   ├── db.ts                 # Pool singleton + withTenant() helper
│   ├── auth.ts               # MdsToken interface, signToken(), requireAuth()
│   └── response.ts           # ok(), err(), preflight() — standard envelope
│
└── functions/                # ━━ AZURE FUNCTIONS (per-module folders) ━━
    ├── index.ts              # Master import file — registers ALL functions
    │
    ├── auth/
    │   ├── login.ts          # POST /auth/login
    │   └── refresh.ts        # POST /auth/refresh
    │
    ├── dashboard/
    │   └── stats.ts          # GET /dashboard/stats
    │
    ├── fees/
    │   ├── index.ts          # GET+POST /fees (merged handler)
    │   ├── list.ts           # GET /fees (standalone — duplicate reference)
    │   └── create.ts         # POST /fees (standalone — duplicate reference)
    │
    ├── instructors/
    │   ├── index.ts          # GET+POST /instructors
    │   └── byId.ts           # PUT+DELETE /instructors/{id}
    │
    ├── roles/
    │   ├── index.ts          # GET+POST /roles
    │   └── byId.ts           # PUT+DELETE /roles/{id}
    │
    ├── sessions/
    │   ├── index.ts          # GET+POST /sessions + GET+POST /sessions/templates
    │   └── updateStatus.ts   # PUT /sessions/{id}/status
    │
    ├── staff/
    │   ├── index.ts          # GET+POST /staff
    │   └── byId.ts           # PUT+DELETE /staff/{id}
    │
    ├── trainees/
    │   ├── index.ts          # GET+POST /trainees
    │   └── byId.ts           # PUT+DELETE /trainees/{id}
    │
    └── vehicles/
        ├── index.ts          # GET+POST /vehicles
        ├── byId.ts           # PUT+DELETE /vehicles/{id}
        └── live.ts           # GET /vehicles/live (telemetry)
```

### 1.2 Layer Separation Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  Azure Functions v4 Programmatic Model (app.http)               │
├─────────────────────────────────────────────────────────────────┤
│  Request → OPTIONS preflight check                              │
│         → requireAuth(req) — JWT verification                   │
│         → getPool().connect() — acquire client                  │
│         → withTenant(client, org_id) — SET LOCAL app.current_   │
│         → SQL query with org_id WHERE clause                    │
│         → ok(data, meta) or err(status, message)                │
│         → client.release() in finally block                     │
└─────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **No controllers, no services, no routes layer.** Each Azure Function IS the handler — flat, self-contained. This is the key architectural difference from your current Express backend.

### 1.3 Naming Conventions

| Convention | Friend's API | Your Current Backend |
|---|---|---|
| **Runtime** | Azure Functions v4 | Express.js |
| **Function names** | `camelCase` (`authLogin`, `vehiclesById`) | N/A (inline routes) |
| **Route paths** | `kebab-case` plural (`/vehicles`, `/staff`) | `/api/vehicles`, `/api/employees` |
| **DB table prefix** | `mds_` (`mds_vehicles`, `mds_roles`) | `schemaa."officeVehicles"` |
| **ID type** | UUID | SERIAL integer |
| **org_id type** | `integer` (number) | `TEXT` (string UUID) |
| **Body fields** | `camelCase` (`firstName`, `vehicleNumber`) | `snake_case` (`first_name`, `vehicle_number`) |
| **DB columns** | `snake_case` (`first_name`, `vehicle_number`) | `snake_case` |
| **Response envelope** | `{ success, data, meta, error }` | `{ success, data, message }` |
| **Pagination** | `{ page, pageSize, total }` in `meta` | `{ current_page, last_page, per_page, total, from, to }` |
| **Error format** | `{ success: false, data: null, error: { message } }` | `{ success: false, message }` |
| **Auth token** | `MdsToken` with permissions array | Simple `{ id, email, role, org_id }` |
| **CORS** | Manual headers in `response.ts` | `cors()` middleware |
| **Password handling** | `bcryptjs` with `$2` check | `bcryptjs` with `$2` regex |
| **Connection pooling** | `max: 5`, singleton | Configurable Pool |

### 1.4 Response Envelope Standard (Friend's Pattern)

```typescript
// SUCCESS
{ success: true, data: { ... }, meta: { page, pageSize, total } | null, error: null }

// ERROR
{ success: false, data: null, error: { message: "..." } }

// PREFLIGHT (OPTIONS)
status: 204, body: ""
```

---

## 2. API Mapping

### 2.1 Your Current APIs vs Friend's Structure

| # | Your Current Route | Method | Friend's Equivalent | Status | Action Required |
|---|---|---|---|---|---|
| 1 | `POST /api/tenant-login` | POST | `POST /auth/login` | ⚠️ Mismatch | Rename route, adopt `MdsToken` payload |
| 2 | `GET /api/refreshMe` | GET | `POST /auth/refresh` | ⚠️ Mismatch | Change to POST, return fresh JWT |
| 3 | `GET /api/stats/summary` | GET | `GET /dashboard/stats` | ⚠️ Partial | Add instructors/trainees/sessions/fees stats |
| 4 | `GET /api/vehicles` | GET | `GET /vehicles` | ✅ Similar | Add pagination `meta`, adopt camelCase body |
| 5 | `POST /api/vehicles` | POST | `POST /vehicles` | ✅ Similar | Adopt camelCase body fields |
| 6 | `GET /api/vehicles/:id` | GET | — | ❌ Missing in friend | Keep (Friend has no GET by ID) |
| 7 | `PUT /api/vehicles/:id` | PUT | `PUT /vehicles/{id}` | ✅ Similar | Adopt COALESCE pattern |
| 8 | `DELETE /api/vehicles/:id` | DELETE | `DELETE /vehicles/{id}` | ✅ Match | Adopt `{ deleted: true }` response |
| 9 | `GET /api/employees` | GET | `GET /staff` | ⚠️ Rename | Rename to `staff`, add pagination meta |
| 10 | `POST /api/employees` | POST | `POST /staff` | ⚠️ Rename | Rename, adopt camelCase |
| 11 | `GET /api/employees/:id` | GET | — | ❌ Missing in friend | Keep |
| 12 | `PUT /api/employees/:id` | PUT | `PUT /staff/{id}` | ⚠️ Rename | Adopt COALESCE pattern |
| 13 | `DELETE /api/employees/:id` | DELETE | `DELETE /staff/{id}` | ⚠️ Rename | Adopt pattern |
| 14 | `GET /api/drivers` | GET | `GET /instructors` | ⚠️ Different entity | Keep as `/drivers`, follow pattern |
| 15 | `POST /api/drivers` | POST | `POST /instructors` | ⚠️ Different entity | Follow pattern |
| 16 | `PUT /api/drivers/:id` | PUT | `PUT /instructors/{id}` | ⚠️ Different entity | Adopt COALESCE |
| 17 | `DELETE /api/drivers/:id` | DELETE | `DELETE /instructors/{id}` | ✅ Pattern match | Adopt pattern |
| 18 | `GET /api/roles` | GET | `GET /roles` | ✅ Match | Add `withTenant()` |
| 19 | `POST /api/roles` | POST | `POST /roles` | ✅ Match | Add bcrypt password hashing |
| 20 | `PUT /api/roles/:id` | PUT | `PUT /roles/{id}` | ✅ Match | Adopt pattern |
| 21 | `DELETE /api/roles/:id` | DELETE | `DELETE /roles/{id}` | ✅ Match | Adopt pattern |
| 22 | `GET /api/permissions` | GET | — | ❌ Missing in friend | Keep (friend embeds in roles) |
| 23 | `POST /api/permissions` | POST | — | ❌ Missing in friend | Keep |
| 24 | `GET /api/masters/forms/dropdowns/*` | GET | — | ❌ Missing in friend | Keep (form helpers) |
| 25 | `GET /health` | GET | — | ❌ Missing in friend | Keep |
| 26 | — | — | `GET /vehicles/live` | ❌ Missing in yours | **ADD** telemetry endpoint |
| 27 | — | — | `GET /fees` | ❌ Missing in yours | **ADD** fee transactions |
| 28 | — | — | `POST /fees` | ❌ Missing in yours | **ADD** fee recording |
| 29 | — | — | `GET /sessions` | ❌ Missing in yours | **ADD** sessions |
| 30 | — | — | `POST /sessions` | ❌ Missing in yours | **ADD** sessions |
| 31 | — | — | `GET /sessions/templates` | ❌ Missing in yours | **ADD** session templates |
| 32 | — | — | `GET /trainees` | ❌ Missing in yours | Mapped to Travellers |
| 33 | — | — | `POST /trainees` | ❌ Missing in yours | Mapped to Travellers |

### 2.2 Missing APIs You Must Add (Not in friend's API either)

| # | Module | Endpoint | Method | Purpose |
|---|---|---|---|---|
| 1 | Notifications | `GET /notifications` | GET | List notifications with filters |
| 2 | Notifications | `GET /notifications/unread-count` | GET | Badge count for header bell |
| 3 | Notifications | `PUT /notifications/{id}/read` | PUT | Mark single as read |
| 4 | Notifications | `PUT /notifications/read-all` | PUT | Mark all as read |
| 5 | Compliance | `GET /compliance` | GET | List compliance items |
| 6 | Compliance | `POST /compliance` | POST | Create compliance record |
| 7 | Compliance | `PUT /compliance/{id}` | PUT | Update compliance record |
| 8 | Compliance | `GET /compliance/report` | GET | Compliance report/export |
| 9 | Devices | `GET /devices` | GET | List GPS/BLE devices |
| 10 | Devices | `POST /devices` | POST | Provision device |
| 11 | Devices | `PUT /devices/{id}` | PUT | Update device assignment |
| 12 | Devices | `DELETE /devices/{id}` | DELETE | Decommission device |
| 13 | App Users | `GET /app-users` | GET | List app users |
| 14 | App Users | `PUT /app-users/{id}` | PUT | Update user status |
| 15 | Travellers | `GET /travellers` | GET | List travellers |
| 16 | Travellers | `POST /travellers` | POST | Create traveller |
| 17 | Travellers | `PUT /travellers/{id}` | PUT | Update traveller |
| 18 | Travellers | `DELETE /travellers/{id}` | DELETE | Remove traveller |
| 19 | Bookings | `GET /bookings` | GET | List bookings |
| 20 | Bookings | `POST /bookings` | POST | Create booking |
| 21 | Bookings | `PUT /bookings/{id}` | PUT | Update booking |
| 22 | Bookings | `PUT /bookings/{id}/status` | PUT | Confirm/cancel booking |
| 23 | Vendors | `GET /vendors` | GET | List vendors |
| 24 | Vendors | `POST /vendors` | POST | Create vendor |
| 25 | Vendors | `PUT /vendors/{id}` | PUT | Update vendor |
| 26 | Vendors | `DELETE /vendors/{id}` | DELETE | Remove vendor |
| 27 | Feedbacks | `GET /feedbacks` | GET | List feedback entries |
| 28 | Feedbacks | `PUT /feedbacks/{id}` | PUT | Respond / resolve |
| 29 | Reports | `GET /reports/{type}` | GET | Generate report data |
| 30 | Reports | `GET /reports/{type}/export` | GET | Export as PDF/CSV |
| 31 | Settings | `GET /settings` | GET | Get org settings |
| 32 | Settings | `PUT /settings` | PUT | Update org settings |

---

## 3. Database Setup — Azure PostgreSQL

### 3.1 Azure PostgreSQL Flexible Server Setup

```bash
# 1. Create Resource Group
az group create --name rg-vanloka --location centralindia

# 2. Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group rg-vanloka \
  --name vanloka-postgres \
  --admin-user vanloka_admin \
  --admin-password "YourSecurePassword@2026" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0

# 3. Configure Firewall (Allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group rg-vanloka \
  --name vanloka-postgres \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 4. Enable SSL enforcement
az postgres flexible-server parameter set \
  --resource-group rg-vanloka \
  --server-name vanloka-postgres \
  --name require_secure_transport \
  --value ON
```

### 3.2 Connection Pooling Config (Friend's Pattern)

```typescript
// shared/db.ts — Singleton pool with connection limits
import { Pool, PoolClient } from "pg";

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.PG_HOST,               // vanloka-postgres.postgres.database.azure.com
      port: parseInt(process.env.PG_PORT || "5432"),
      user: process.env.PG_USER,               // vanloka_admin
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,        // postgres
      ssl: { rejectUnauthorized: false },       // Required for Azure PG
      max: 5,                                   // Connection pool limit
      idleTimeoutMillis: 30000,                 // Close idle connections after 30s
      connectionTimeoutMillis: 10000,           // Fail fast if can't connect in 10s
    });
  }
  return _pool;
}

// Set org_id for RLS within a transaction
export async function withTenant(client: PoolClient, orgId: number) {
  await client.query(`SET LOCAL app.current_org_id = ${orgId}`);
}
```

> [!WARNING]
> Azure PostgreSQL enforces SSL. Always set `ssl: { rejectUnauthorized: false }` or provide the DigiCert CA certificate. The friend's API uses `rejectUnauthorized: false` — acceptable for Azure-managed SSL but consider setting `rejectUnauthorized: true` with the Azure CA cert for production.

### 3.3 Multi-Tenant org_id Schema

Every table MUST have an `org_id` column. This is the #1 rule from the friend's architecture.

```sql
-- =============================================
-- MIGRATION: Create tables with org_id isolation
-- =============================================

-- Use the 'public' schema (friend uses no custom schema — simplify from your schemaa)
-- All tables prefixed with 'vl_' for VanLoka

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

-- 2. Roles (auth source — like friend's mds_roles)
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

-- 4. Vehicles (like friend's mds_vehicles)
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

-- 5. Drivers (your custom — friend has instructors)
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

-- 6. Vehicle Telemetry (from friend's mds_vehicle_telemetry)
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
CREATE INDEX idx_vl_notifications_unread ON vl_notifications(org_id, is_read) WHERE is_read = FALSE;

-- 8. Compliance Items
CREATE TABLE IF NOT EXISTS vl_compliance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  entity_type VARCHAR(30) NOT NULL,  -- 'vehicle', 'driver'
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

-- 9. Devices (GPS/BLE)
CREATE TABLE IF NOT EXISTS vl_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id INTEGER NOT NULL,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  device_type VARCHAR(20) NOT NULL,  -- 'GPS', 'BLE'
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

### 3.4 Row-Level Security (RLS) Setup

```sql
-- Enable RLS on every table
ALTER TABLE vl_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_travellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vl_app_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (same pattern for each table)
CREATE POLICY tenant_isolation_vl_roles ON vl_roles
  USING (org_id = current_setting('app.current_org_id')::INTEGER);

CREATE POLICY tenant_isolation_vl_staff ON vl_staff_members
  USING (org_id = current_setting('app.current_org_id')::INTEGER);

CREATE POLICY tenant_isolation_vl_vehicles ON vl_vehicles
  USING (org_id = current_setting('app.current_org_id')::INTEGER);

-- ... repeat for all tables
```

### 3.5 Critical Indexes for Performance

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_vl_vehicles_org_status ON vl_vehicles(org_id, status);
CREATE INDEX idx_vl_drivers_org_status ON vl_drivers(org_id, current_status);
CREATE INDEX idx_vl_staff_org_status ON vl_staff_members(org_id, status);
CREATE INDEX idx_vl_bookings_org_date ON vl_bookings(org_id, booking_date DESC);
CREATE INDEX idx_vl_compliance_org_expiry ON vl_compliance(org_id, expiry_date);
CREATE INDEX idx_vl_notifications_org_read ON vl_notifications(org_id, is_read, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_vl_drivers_search ON vl_drivers
  USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(employee_id, '')));
```

---

## 4. Implementation Steps

### Phase 1: Project Scaffold (Day 1)

```bash
# In office_vanloka root, create the new API folder
mkdir -p api-office/shared api-office/functions

# Initialize
cd api-office
npm init -y
npm install @azure/functions@^4 pg jsonwebtoken bcryptjs
npm install -D typescript @types/node @types/pg @types/jsonwebtoken @types/bcryptjs

# Copy friend's config files (adapt naming)
# - host.json (exact copy)
# - tsconfig.json (exact copy)
# - local.settings.json (update with your Azure PG credentials)
# - dist-package.json (update name to "vanloka-office-api")
```

**tsconfig.json** (exact match to friend):
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

### Phase 2: Shared Utilities (Day 1)

Create the 3 shared files — **exact copies** from friend's API with VanLoka-specific token fields:

1. `shared/db.ts` — Pool singleton + `withTenant()`
2. `shared/auth.ts` — `VlToken` interface, `signToken()`, `requireAuth()`
3. `shared/response.ts` — `ok()`, `err()`, `preflight()`

### Phase 3: Auth Functions (Day 1-2)

1. `functions/auth/login.ts` — POST /auth/login
2. `functions/auth/refresh.ts` — POST /auth/refresh

### Phase 4: Dashboard + Core CRUD (Day 2-3)

1. `functions/dashboard/stats.ts`
2. `functions/roles/index.ts` + `functions/roles/byId.ts`
3. `functions/staff/index.ts` + `functions/staff/byId.ts`
4. `functions/vehicles/index.ts` + `functions/vehicles/byId.ts` + `functions/vehicles/live.ts`
5. `functions/drivers/index.ts` + `functions/drivers/byId.ts`

### Phase 5: Remaining CRUD Modules (Day 3-4)

1. `functions/travellers/index.ts` + `byId.ts`
2. `functions/bookings/index.ts` + `byId.ts` + `updateStatus.ts`
3. `functions/vendors/index.ts` + `byId.ts`
4. `functions/feedbacks/index.ts` + `byId.ts`
5. `functions/devices/index.ts` + `byId.ts`
6. `functions/app-users/index.ts` + `byId.ts`

### Phase 6: Supporting Functions (Day 4-5)

1. `functions/compliance/index.ts` + `byId.ts` + `report.ts`
2. `functions/notifications/index.ts` + `unreadCount.ts` + `markRead.ts`
3. `functions/masters/dropdowns.ts`
4. `functions/reports/generate.ts` + `export.ts`
5. `functions/settings/index.ts`

### Phase 7: Frontend API Migration (Day 5-6)

Update `frontend/src/Services/ApiService.ts` to point to Azure Functions:
```typescript
// Change from Express to Azure Functions URL
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://your-func-app.azurewebsites.net/api'
  : 'http://localhost:7071/api';
```

### Phase 8: Testing + Deploy (Day 6-7)

1. Run Azure Functions locally with `func start`
2. Test all endpoints against Azure PostgreSQL
3. Deploy to Azure

---

## 5. Core Modules

### 5.1 Auth Module

**Token Interface (adapted from friend's `MdsToken`):**

```typescript
// shared/auth.ts
export interface VlToken {
  sub: string;          // User/Role ID (UUID)
  email: string;
  org_id: number;       // Organization ID
  role_name: string;    // "Admin", "Manager", etc.
  permissions: string[];// ["*"] for owner, or specific list
  access_level: string; // "Root Access", "Full Access", "Partial Access"
  is_owner: boolean;
}
```

**Login Flow (exact friend's pattern):**
```
1. Receive { email, password }
2. Query vl_roles WHERE login_email = email AND status = 'Active'
3. bcrypt.compare(password, login_password) — or plain-text fallback
4. Build VlToken with permissions from role
5. jwt.sign(token, JWT_SECRET, { algorithm: "HS256", expiresIn: 86400 })
6. Return ok({ token, user: { name, email, orgId, permissions, accessLevel, isOwner } })
```

### 5.2 RBAC (Role-Based Access Control)

The friend's pattern embeds permissions in the JWT token. Every request carries:
- `permissions: string[]` — specific module permissions
- `is_owner: boolean` — if true, `permissions = ["*"]` (bypass all checks)

**Permission check helper (ADD to shared/auth.ts):**

```typescript
export function requirePermission(user: VlToken, permission: string): boolean {
  if (user.is_owner) return true;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
}
```

### 5.3 Standard CRUD Pattern

Every module follows this exact template from the friend's code:

**index.ts** — Handles `GET` (list) + `POST` (create) on `/{resource}`:
```
1. OPTIONS → preflight()
2. requireAuth(req) → err(401) if invalid
3. getPool().connect() → acquire DB client
4. withTenant(client, org_id) → set RLS context
5. GET → SELECT with pagination (page, pageSize, status filter)
   → Return ok(rows, { page, pageSize, total })
6. POST → Validate required fields → INSERT with org_id
   → Return ok(newRow)
7. catch → Handle PG errors (23505 = duplicate, 23503 = FK violation)
8. finally → client.release()
```

**byId.ts** — Handles `PUT` (update) + `DELETE` on `/{resource}/{id}`:
```
1. OPTIONS → preflight()
2. requireAuth(req) → err(401) if invalid
3. DELETE → DELETE ... WHERE id=$1 AND org_id=$2
   → if !rowCount → err(404)
   → ok({ deleted: true })
4. PUT → UPDATE SET col=COALESCE($n, col) ... WHERE id=$x AND org_id=$y
   → if !rows[0] → err(404)
   → ok(rows[0])
5. catch → err(500)
6. finally → client.release()
```

### 5.4 Error Handling

Friend's error pattern (replace your Express AppError pattern):

```typescript
// Standard PostgreSQL error codes handled inline
catch (e: any) {
  ctx.error("functionName:", e);
  if (e.code === "23505") return err(409, "Duplicate record");     // UNIQUE violation
  if (e.code === "23503") return err(404, "Referenced record not found"); // FK violation
  if (e.code === "23502") return err(400, "Required field missing");     // NOT NULL violation
  return err(500, "Server error");
}
```

### 5.5 Logging

Friend uses `InvocationContext` for structured logging:

```typescript
handler: async (req: HttpRequest, ctx: InvocationContext) => {
  // Info-level logging
  ctx.log("Processing request for vehicles");
  
  // Error-level logging (caught errors)
  ctx.error("vehicles:", e);
  
  // The function name appears as prefix in Azure Application Insights
}
```

### 5.6 Validation

Friend uses **inline validation** (no Zod, no middleware):

```typescript
const body: any = await req.json().catch(() => null);
if (!body) return err(400, "Invalid request body");
if (!body.firstName) return err(400, "firstName is required");
if (!body.lastName) return err(400, "lastName is required");
```

> [!TIP]
> Your current backend has a Zod validation middleware (`middleware/validation.ts`). You can optionally add Zod schemas as a `shared/validators/` folder in the Azure Functions project for stronger type safety, but keep the pattern consistent — validate early and return `err()` immediately.

### 5.7 Middleware Flow Comparison

| Step | Friend's API (Azure Functions) | Your Current Backend (Express) |
|---|---|---|
| CORS | Manual `preflight()` + response headers | `cors()` middleware |
| Auth | `requireAuth(req)` inline in each handler | `authMiddleware` global/per-route |
| Validation | Inline field checks | Zod `validateBody()` middleware |
| Tenant | `withTenant(client, org_id)` per handler | `getOrgIdFromRequest()` helper |
| Error | Inline `catch` → `err()` | Global `errorHandler` middleware |
| Logging | `ctx.error()` / `ctx.log()` | `console.log()` + request logger |

---

## 6. Azure Deployment

### 6.1 Hosting Options

| Option | Pros | Cons | Recommended For |
|---|---|---|---|
| **Azure Functions** ✅ | Identical to friend's API, serverless, auto-scale, pay-per-use | Cold starts, 5-min timeout | **Best match** — same architecture |
| Azure App Service | Always-on, simple deployment | Fixed cost, manual scaling | If you want Express |
| Azure Container Apps | Docker, full control | More complex setup | Microservices architecture |

> [!IMPORTANT]
> **Recommended: Azure Functions** — matches the friend's architecture exactly. Your existing Express backend would require significant rearchitecting for App Service, while Azure Functions is a 1:1 port.

### 6.2 Azure Functions Deployment

```bash
# 1. Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# 2. Create Function App in Azure
az functionapp create \
  --resource-group rg-vanloka \
  --name vanloka-office-api \
  --consumption-plan-location centralindia \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --storage-account vanlokastorage \
  --os-type Linux

# 3. Set Application Settings (Environment Variables)
az functionapp config appsettings set \
  --resource-group rg-vanloka \
  --name vanloka-office-api \
  --settings \
    PG_HOST="vanloka-postgres.postgres.database.azure.com" \
    PG_PORT="5432" \
    PG_USER="vanloka_admin" \
    PG_PASSWORD="@Microsoft.KeyVault(VaultName=vanloka-kv;SecretName=pg-password)" \
    PG_DATABASE="postgres" \
    JWT_SECRET="@Microsoft.KeyVault(VaultName=vanloka-kv;SecretName=jwt-secret)" \
    JWT_EXPIRES_IN="86400" \
    ALLOWED_ORIGIN="https://office.vanloka.com"
```

### 6.3 Secrets Management with Azure Key Vault

```bash
# Create Key Vault
az keyvault create \
  --resource-group rg-vanloka \
  --name vanloka-kv \
  --location centralindia

# Store secrets
az keyvault secret set --vault-name vanloka-kv --name pg-password --value "YourSecurePassword@2026"
az keyvault secret set --vault-name vanloka-kv --name jwt-secret --value "$(openssl rand -hex 64)"

# Grant Function App access to Key Vault
az functionapp identity assign --resource-group rg-vanloka --name vanloka-office-api
PRINCIPAL_ID=$(az functionapp identity show --resource-group rg-vanloka --name vanloka-office-api --query principalId -o tsv)
az keyvault set-policy --name vanloka-kv --object-id $PRINCIPAL_ID --secret-permissions get list
```

### 6.4 CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy-api.yml
name: Deploy Azure Functions

on:
  push:
    branches: [main]
    paths: ['api-office/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and Build
        working-directory: api-office
        run: |
          npm ci
          npm run build
          cp host.json dist/
          cp dist-package.json dist/package.json

      - name: Deploy to Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: vanloka-office-api
          package: api-office/dist
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

### 6.5 Local Development

```bash
cd api-office

# Build TypeScript
npm run build

# Start Azure Functions locally (port 7071)
npm run start
# → Runs: func start --script-root dist

# Update frontend to point to local Functions
# In frontend/src/Services/ApiService.ts:
# const baseURL = 'http://localhost:7071/api'
```

---

## 7. Code Snippets

### 7.1 Complete Function: GET+POST /drivers

```typescript
// functions/drivers/index.ts
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("drivers", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "drivers",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      /* ── GET ── */
      if (req.method === "GET") {
        const page = parseInt(req.query.get("page") ?? "1");
        const pageSize = Math.min(
          parseInt(req.query.get("pageSize") ?? "50"),
          100,
        );
        const status = req.query.get("status");
        const search = req.query.get("search");
        const city = req.query.get("city");

        const { rows } = await client.query(
          `SELECT id, first_name, last_name, gender, email, mobile_number,
                  dl_number, dl_expiry_date, license_type,
                  current_status, assigned_vehicle_id, vehicle_reg,
                  operational_base, profile_photo_url, created_at
           FROM vl_drivers
           WHERE org_id = $1
             AND ($2::text IS NULL OR current_status = $2)
             AND ($3::text IS NULL OR operational_base = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  employee_id ILIKE '%' || $4 || '%' OR
                  mobile_number ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%')
           ORDER BY created_at DESC
           LIMIT $5 OFFSET $6`,
          [
            auth.user.org_id,
            status ?? null,
            city ?? null,
            search ?? null,
            pageSize,
            (page - 1) * pageSize,
          ],
        );

        const { rows: count } = await client.query(
          `SELECT COUNT(*) FROM vl_drivers
           WHERE org_id = $1
             AND ($2::text IS NULL OR current_status = $2)
             AND ($3::text IS NULL OR operational_base = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%')`,
          [auth.user.org_id, status ?? null, city ?? null, search ?? null],
        );

        return ok(rows, {
          page,
          pageSize,
          total: parseInt(count[0].count),
        });
      }

      /* ── POST ── */
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.firstName) return err(400, "firstName is required");
      if (!body.lastName) return err(400, "lastName is required");

      const { rows } = await client.query(
        `INSERT INTO vl_drivers (
           org_id, first_name, last_name, gender, dob, email, mobile_number,
           blood_group, marital_status, profile_photo_url, employment_type,
           employee_id, dl_number, dl_issue_date, dl_expiry_date, license_type,
           driving_experience, address, city, district, state, pin_code,
           assigned_vehicle_id, vehicle_reg, beacon_id, operational_base,
           current_status, status, remarks
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
         RETURNING id, first_name, last_name, current_status, created_at`,
        [
          auth.user.org_id,
          body.firstName, body.lastName, body.gender ?? null,
          body.dob ?? null, body.email ?? null, body.mobileNumber ?? null,
          body.bloodGroup ?? null, body.maritalStatus ?? null,
          body.profilePhotoUrl ?? null, body.employmentType ?? null,
          body.employeeId ?? null, body.dlNumber ?? null,
          body.dlIssueDate ?? null, body.dlExpiryDate ?? null,
          body.licenseType ?? null, body.drivingExperience ?? null,
          body.address ?? null, body.city ?? null, body.district ?? null,
          body.state ?? null, body.pinCode ?? null,
          body.assignedVehicleId ?? null, body.vehicleReg ?? null,
          body.beaconId ?? null, body.operationalBase ?? null,
          body.currentStatus ?? "Active", body.status ?? "Active",
          body.remarks ?? null,
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("drivers:", e);
      if (e.code === "23505") return err(409, "Driver already exists");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
```

### 7.2 Complete Function: PUT+DELETE /drivers/{id}

```typescript
// functions/drivers/byId.ts
import {
  app, HttpRequest, HttpResponseInit, InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("driversById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "drivers/{id}",
  handler: async (
    req: HttpRequest, ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      if (req.method === "DELETE") {
        const { rowCount } = await client.query(
          `DELETE FROM vl_drivers WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (!rowCount) return err(404, "Driver not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_drivers SET
           first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           gender = COALESCE($3, gender),
           email = COALESCE($4, email),
           mobile_number = COALESCE($5, mobile_number),
           dl_number = COALESCE($6, dl_number),
           dl_expiry_date = COALESCE($7, dl_expiry_date),
           current_status = COALESCE($8, current_status),
           assigned_vehicle_id = COALESCE($9, assigned_vehicle_id),
           vehicle_reg = COALESCE($10, vehicle_reg),
           operational_base = COALESCE($11, operational_base),
           remarks = COALESCE($12, remarks),
           status = COALESCE($13, status),
           updated_at = now()
         WHERE id = $14 AND org_id = $15
         RETURNING id, first_name, last_name, current_status, updated_at`,
        [
          body.firstName ?? null, body.lastName ?? null,
          body.gender ?? null, body.email ?? null,
          body.mobileNumber ?? null, body.dlNumber ?? null,
          body.dlExpiryDate ?? null, body.currentStatus ?? null,
          body.assignedVehicleId ?? null, body.vehicleReg ?? null,
          body.operationalBase ?? null, body.remarks ?? null,
          body.status ?? null, id, auth.user.org_id,
        ],
      );
      if (!rows[0]) return err(404, "Driver not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("driversById:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
```

### 7.3 Dashboard Stats (org_id scoped)

```typescript
// functions/dashboard/stats.ts
app.http("dashboardStats", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "dashboard/stats",
  handler: async (req, ctx): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();
    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const [vehicles, drivers, staff, bookings] = await Promise.all([
        client.query(
          `SELECT
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status='Active') AS active,
             COUNT(*) FILTER (WHERE status='Maintenance') AS maintenance
           FROM vl_vehicles WHERE org_id = $1`, [auth.user.org_id]),
        client.query(
          `SELECT
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE current_status='On Duty') AS on_duty,
             COUNT(*) FILTER (WHERE current_status='On Break') AS on_break,
             COUNT(*) FILTER (WHERE current_status='Offline') AS offline
           FROM vl_drivers WHERE org_id = $1`, [auth.user.org_id]),
        client.query(
          `SELECT COUNT(*) AS total FROM vl_staff_members WHERE org_id = $1`,
          [auth.user.org_id]),
        client.query(
          `SELECT
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status='Confirmed') AS confirmed,
             COUNT(*) FILTER (WHERE status='Pending') AS pending,
             COUNT(*) FILTER (WHERE status='Cancelled') AS cancelled
           FROM vl_bookings WHERE org_id = $1`, [auth.user.org_id]),
      ]);

      return ok({
        vehicles: vehicles.rows[0],
        drivers: drivers.rows[0],
        staff: staff.rows[0],
        bookings: bookings.rows[0],
      });
    } catch (e) {
      ctx.error("dashboardStats:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
```

### 7.4 Notification Unread Count

```typescript
// functions/notifications/unreadCount.ts
app.http("notificationsUnreadCount", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "notifications/unread-count",
  handler: async (req, ctx): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();
    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const client = await getPool().connect();
    try {
      const { rows } = await client.query(
        `SELECT COUNT(*) AS count FROM vl_notifications
         WHERE org_id = $1 AND is_read = FALSE`,
        [auth.user.org_id],
      );
      return ok({ unreadCount: parseInt(rows[0].count) });
    } catch (e) {
      ctx.error("notificationsUnreadCount:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
```

### 7.5 Functions Registry (Master Import)

```typescript
// functions/index.ts
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

// Vehicles
import "./vehicles/index";
import "./vehicles/byId";
import "./vehicles/live";

// Drivers
import "./drivers/index";
import "./drivers/byId";

// Compliance
import "./compliance/index";
import "./compliance/byId";
import "./compliance/report";

// Devices
import "./devices/index";
import "./devices/byId";

// App Users
import "./app-users/index";
import "./app-users/byId";

// Travellers
import "./travellers/index";
import "./travellers/byId";

// Bookings
import "./bookings/index";
import "./bookings/byId";
import "./bookings/updateStatus";

// Vendors
import "./vendors/index";
import "./vendors/byId";

// Feedbacks
import "./feedbacks/index";
import "./feedbacks/byId";

// Notifications
import "./notifications/index";
import "./notifications/unreadCount";
import "./notifications/markRead";

// Masters / Dropdowns
import "./masters/dropdowns";

// Reports
import "./reports/generate";

// Settings
import "./settings/index";
```

---

## 8. Complete API List for Office Admin Panel

### Organized by sidebar module, following friend's conventions exactly.

| # | Module | Feature | Method | Route | Query/Body | Response | Maps To |
|---|---|---|---|---|---|---|---|
| 1 | Auth | Login | POST | `/auth/login` | `{ email, password }` | `{ token, user }` | ✅ `authLogin` |
| 2 | Auth | Refresh | POST | `/auth/refresh` | Bearer token | `{ token }` | ✅ `authRefresh` |
| 3 | Dashboard | Stats | GET | `/dashboard/stats` | — | `{ vehicles, drivers, staff, bookings }` | 🔄 Extend `dashboardStats` |
| 4 | Roles | List | GET | `/roles` | — | `[{ id, role_name, ... }]` | ✅ `roles` |
| 5 | Roles | Create | POST | `/roles` | `{ roleName, permissions, ... }` | `{ id, role_name }` | ✅ `roles` |
| 6 | Roles | Update | PUT | `/roles/{id}` | `{ roleName, ... }` | `{ id, role_name }` | ✅ `rolesById` |
| 7 | Roles | Delete | DELETE | `/roles/{id}` | — | `{ deleted: true }` | ✅ `rolesById` |
| 8 | Staff | List | GET | `/staff` | `?page&pageSize&status&search` | `[rows], meta` | ✅ `staff` |
| 9 | Staff | Create | POST | `/staff` | `{ firstName, lastName, ... }` | `{ id, ... }` | ✅ `staff` |
| 10 | Staff | Update | PUT | `/staff/{id}` | `{ firstName, ... }` | `{ id, ... }` | ✅ `staffById` |
| 11 | Staff | Delete | DELETE | `/staff/{id}` | — | `{ deleted: true }` | ✅ `staffById` |
| 12 | Vehicles | List | GET | `/vehicles` | `?page&pageSize&status` | `[rows], meta` | ✅ `vehicles` |
| 13 | Vehicles | Create | POST | `/vehicles` | `{ vehicleNumber, ... }` | `{ id, ... }` | ✅ `vehicles` |
| 14 | Vehicles | Update | PUT | `/vehicles/{id}` | `{ vehicleNumber, ... }` | `{ id, ... }` | ✅ `vehiclesById` |
| 15 | Vehicles | Delete | DELETE | `/vehicles/{id}` | — | `{ deleted: true }` | ✅ `vehiclesById` |
| 16 | Vehicles | Live GPS | GET | `/vehicles/live` | — | `[{ vehicleId, lat, lng, speed }]` | ✅ `vehiclesLive` |
| 17 | Drivers | List | GET | `/drivers` | `?page&pageSize&status&city&search` | `[rows], meta` | 🆕 New |
| 18 | Drivers | Create | POST | `/drivers` | `{ firstName, lastName, ... }` | `{ id, ... }` | 🆕 New |
| 19 | Drivers | Update | PUT | `/drivers/{id}` | `{ firstName, ... }` | `{ id, ... }` | 🆕 New |
| 20 | Drivers | Delete | DELETE | `/drivers/{id}` | — | `{ deleted: true }` | 🆕 New |
| 21 | Compliance | List | GET | `/compliance` | `?entityType&status` | `[rows], meta` | 🆕 New |
| 22 | Compliance | Create | POST | `/compliance` | `{ entityType, entityId, ... }` | `{ id, ... }` | 🆕 New |
| 23 | Compliance | Update | PUT | `/compliance/{id}` | `{ status, ... }` | `{ id, ... }` | 🆕 New |
| 24 | Compliance | Report | GET | `/compliance/report` | `?format` | File/JSON | 🆕 New |
| 25 | Devices | List | GET | `/devices` | `?type&status` | `[rows], meta` | 🆕 New |
| 26 | Devices | Provision | POST | `/devices` | `{ deviceId, type, ... }` | `{ id, ... }` | 🆕 New |
| 27 | Devices | Update | PUT | `/devices/{id}` | `{ assignedVehicleId, ... }` | `{ id, ... }` | 🆕 New |
| 28 | Devices | Remove | DELETE | `/devices/{id}` | — | `{ deleted: true }` | 🆕 New |
| 29 | App Users | List | GET | `/app-users` | `?role&status` | `[rows], meta` | 🆕 New |
| 30 | App Users | Update | PUT | `/app-users/{id}` | `{ status, ... }` | `{ id, ... }` | 🆕 New |
| 31 | Travellers | List | GET | `/travellers` | `?status&route&search` | `[rows], meta` | 🔄 Like `trainees` |
| 32 | Travellers | Create | POST | `/travellers` | `{ firstName, lastName, ... }` | `{ id, ... }` | 🔄 Like `trainees` |
| 33 | Travellers | Update | PUT | `/travellers/{id}` | `{ firstName, ... }` | `{ id, ... }` | 🔄 Like `traineesById` |
| 34 | Travellers | Delete | DELETE | `/travellers/{id}` | — | `{ deleted: true }` | 🔄 Like `traineesById` |
| 35 | Bookings | List | GET | `/bookings` | `?status&dateFrom&dateTo` | `[rows], meta` | 🆕 New |
| 36 | Bookings | Create | POST | `/bookings` | `{ travellerId, route, ... }` | `{ id, ... }` | 🆕 New |
| 37 | Bookings | Update | PUT | `/bookings/{id}` | `{ route, ... }` | `{ id, ... }` | 🆕 New |
| 38 | Bookings | Status | PUT | `/bookings/{id}/status` | `{ status }` | `{ id, status }` | 🔄 Like `sessionsUpdateStatus` |
| 39 | Vendors | List | GET | `/vendors` | `?status&type` | `[rows], meta` | 🆕 New |
| 40 | Vendors | Create | POST | `/vendors` | `{ name, type, ... }` | `{ id, ... }` | 🆕 New |
| 41 | Vendors | Update | PUT | `/vendors/{id}` | `{ name, ... }` | `{ id, ... }` | 🆕 New |
| 42 | Vendors | Delete | DELETE | `/vendors/{id}` | — | `{ deleted: true }` | 🆕 New |
| 43 | Feedbacks | List | GET | `/feedbacks` | `?status&rating&type` | `[rows], meta` | 🆕 New |
| 44 | Feedbacks | Respond | PUT | `/feedbacks/{id}` | `{ adminReply, status }` | `{ id, ... }` | 🆕 New |
| 45 | Notifications | List | GET | `/notifications` | `?type&isRead` | `[rows], meta` | 🆕 New |
| 46 | Notifications | Unread | GET | `/notifications/unread-count` | — | `{ unreadCount }` | 🆕 New |
| 47 | Notifications | Read One | PUT | `/notifications/{id}/read` | — | `{ id, is_read }` | 🆕 New |
| 48 | Notifications | Read All | PUT | `/notifications/read-all` | — | `{ updated }` | 🆕 New |
| 49 | Masters | Dropdowns | GET | `/masters/dropdowns` | `?type&field` | `[values]` | 🆕 Port from Express |
| 50 | Masters | States | GET | `/masters/states` | — | `[states]` | 🆕 Port from Express |
| 51 | Masters | Districts | GET | `/masters/districts/{state}` | — | `[districts]` | 🆕 Port from Express |
| 52 | Reports | Generate | GET | `/reports/{type}` | `?dateFrom&dateTo&entity` | Report data | 🆕 New |
| 53 | Settings | Get | GET | `/settings` | — | `{ org settings }` | 🆕 New |
| 54 | Settings | Update | PUT | `/settings` | `{ name, logo, ... }` | `{ updated }` | 🆕 New |

---

## 9. Gap Analysis

### 9.1 Net-New APIs (No match in friend's `/api`)

| # | Function | Route | Reason |
|---|---|---|---|
| 1 | `drivers` | `/drivers` | Office has Drivers, friend has Instructors |
| 2 | `compliance` | `/compliance` | Office-specific compliance tracking |
| 3 | `devices` | `/devices` | GPS/BLE device management |
| 4 | `appUsers` | `/app-users` | Mobile app user management |
| 5 | `travellers` | `/travellers` | Office traveller management |
| 6 | `bookings` | `/bookings` | Booking/trip management |
| 7 | `vendors` | `/vendors` | Vendor management |
| 8 | `feedbacks` | `/feedbacks` | Feedback collection |
| 9 | `notifications` | `/notifications` | In-app notification system |
| 10 | `reports` | `/reports/{type}` | Report generation/export |
| 11 | `settings` | `/settings` | Organization settings |
| 12 | `masters` | `/masters/*` | Form dropdown data |

### 9.2 Existing Functions Not Needed by Office Panel

| Friend's Function | Route | Reason |
|---|---|---|
| `instructors` | `/instructors` | Office uses Drivers, not Instructors |
| `trainees` | `/trainees` | Office uses Travellers (different schema) |
| `sessions` | `/sessions` | Training sessions — not needed in Office |
| `sessionsTemplates` | `/sessions/templates` | Training templates — not in Office |
| `fees` | `/fees` | Fee transactions — not in Office |

### 9.3 Response Shape Mismatches

| Area | Friend's API | Your Current API | Fix Required |
|---|---|---|---|
| **Envelope** | `{ success, data, meta, error }` | `{ success, data, message }` | Adopt friend's 4-field envelope |
| **Pagination** | `meta: { page, pageSize, total }` | Nested `data.data`, `current_page`, etc. | Simplify to friend's flat meta |
| **Error** | `{ error: { message } }` | `{ message }` or `{ error }` | Wrap in `error` object |
| **Body fields** | `camelCase` (firstName) | `snake_case` (first_name) | Standardize to camelCase |
| **Delete response** | `{ deleted: true }` | `{ message: "...deleted..." }` | Adopt friend's pattern |

### 9.4 Real-Time Gaps

| Feature | Current State | Required | Solution |
|---|---|---|---|
| Driver status counts | Static query | Live On Duty/On Break/Offline | Poll `GET /dashboard/stats` every 30s |
| Notification badge | Not implemented | Live unread count (badge=3) | Poll `GET /notifications/unread-count` every 15s |
| Vehicle live GPS | Not implemented | Real-time map positions | Poll `GET /vehicles/live` every 10s |
| Device health | Not implemented | Battery %, connectivity | Poll `GET /devices?status=low-battery` |

> [!NOTE]
> Friend's API has no WebSocket support. Use **HTTP polling** at appropriate intervals. Azure Functions are stateless and don't natively support WebSockets — if you need real-time later, add Azure SignalR Service.

### 9.5 Shared APIs (Office + Institute + Mobile)

| Endpoint | Used By | Duplication Risk |
|---|---|---|
| `/vehicles` | Office Admin + Institute Admin | **Share** — same table, org_id scoped |
| `/vehicles/live` | Office Admin + Institute Admin | **Share** — same telemetry |
| `/roles` | Office Admin + Institute Admin | **Share** — same roles table |
| `/auth/login` | All apps | **Share** — same auth flow |
| `/dashboard/stats` | Office (custom), Institute (custom) | **Separate** — different stats |

---

## 10. Production Checklist

### Security
- [ ] All env vars stored in Azure Key Vault (not in code)
- [ ] JWT_SECRET is a strong 256-bit random string
- [ ] SSL/TLS enforced on Azure PostgreSQL (`require_secure_transport = ON`)
- [ ] CORS ALLOWED_ORIGIN set to exact production domain (not `*`)
- [ ] Password hashing uses bcrypt with cost factor ≥ 10
- [ ] All queries use parameterized `$1, $2` — no string interpolation
- [ ] Auth token checked on EVERY protected endpoint
- [ ] org_id enforced in ALL queries (WHERE + INSERT)

### Database
- [ ] All tables have `org_id` column with NOT NULL constraint
- [ ] Indexes on `org_id` for every table
- [ ] Composite indexes for common filter patterns (`org_id, status`)
- [ ] UUID primary keys (not sequential integers)
- [ ] RLS policies created and tested
- [ ] Connection pool `max: 5` (Azure Functions shared pool)
- [ ] `client.release()` in `finally` block — no connection leaks
- [ ] Database backups configured (Azure auto-backup)

### API Standards (Friend's Pattern)
- [ ] Every function uses `app.http()` with explicit methods
- [ ] Every function handles `OPTIONS` → `preflight()`
- [ ] Every function calls `requireAuth(req)` first
- [ ] Every function acquires client via `getPool().connect()`
- [ ] Every function calls `withTenant(client, org_id)`
- [ ] Every function uses `ok()` and `err()` response helpers
- [ ] Every function releases client in `finally` block
- [ ] Every function logs errors via `ctx.error()`
- [ ] Pagination uses `page` + `pageSize` query params
- [ ] Updates use `COALESCE($n, column)` pattern
- [ ] Deletes check `rowCount` and return 404 if 0
- [ ] Duplicate key errors (23505) return 409
- [ ] FK violations (23503) return 404

### Deployment
- [ ] `host.json` configured with extension bundle v4
- [ ] `tsconfig.json` matches friend's config exactly
- [ ] `dist-package.json` has correct entry point
- [ ] `functions/index.ts` imports ALL function files
- [ ] Build output to `dist/` directory
- [ ] GitHub Actions CI/CD pipeline configured
- [ ] Azure Function App created with Node.js 20 runtime
- [ ] Application Insights enabled for monitoring
- [ ] Custom domain + HTTPS configured

### Frontend Integration
- [ ] `ApiService.ts` baseURL points to Azure Functions URL
- [ ] Token stored in `localStorage` under key `"token"`
- [ ] 401 responses trigger redirect to login
- [ ] All API calls use `camelCase` body fields
- [ ] Pagination uses `meta.page`, `meta.pageSize`, `meta.total`
- [ ] Error messages displayed from `response.error.message`

### Testing
- [ ] Login flow works end-to-end
- [ ] Each CRUD module tested: list, create, update, delete
- [ ] Pagination works with page/pageSize params
- [ ] Status filters work correctly
- [ ] Search works across name/ID/email/phone fields
- [ ] org_id isolation verified (Org A can't see Org B data)
- [ ] Token expiry handled gracefully (refresh or re-login)
- [ ] 404 returned for non-existent resources
- [ ] 409 returned for duplicate records
- [ ] Production build deploys and runs on Azure

---

> [!CAUTION]
> **Your current backend is a 1,687-line monolithic Express `server.ts` file.** The friend's architecture is the opposite — each function is isolated in its own file (50-120 lines each). You CANNOT incrementally refactor; this requires a full rewrite into Azure Functions. Plan for 5-7 days of focused work.
