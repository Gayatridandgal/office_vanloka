import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import multer from "multer";
import pool from "./lib/db";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "dummy-secret-for-now";
const DUMMY_ORG_ID = "00000000-0000-0000-0000-000000000001";
const ROLE_TABLE = 'schemaa."officeRoles"';
const PERMISSION_TABLE = 'schemaa."officePermissions"';
const ROLE_PERMISSION_MAP_TABLE = 'schemaa."officeRolePermissions"';
const EMPLOYEE_TABLE = 'schemaa."officeEmployees"';
const VEHICLE_TABLE = 'schemaa."officeVehicles"';
const DRIVER_TABLE = 'schemaa."officeDrivers"';
const upload = multer({ storage: multer.memoryStorage() });
const tableColumnCache = new Map<string, Set<string>>();

const stateDistrictSeed = [
  { id: 1, state: "Tamil Nadu", district: "Chennai", city: "Chennai", pincode: "600001" },
  { id: 2, state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore", pincode: "641001" },
  { id: 3, state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", pincode: "560001" },
  { id: 4, state: "Telangana", district: "Hyderabad", city: "Hyderabad", pincode: "500001" },
  { id: 5, state: "Maharashtra", district: "Pune", city: "Pune", pincode: "411001" },
];

const dropdownValues: Record<string, string[]> = {
  "vehicle:vehicle_type": ["Bus", "Van", "Car", "Mini Bus"],
  "vehicle:fuel_type": ["Diesel", "Petrol", "CNG", "Electric"],
  "vehicle:permit_type": ["School", "Private", "Tourist", "State"],
  "vehicle:ownership_type": ["Owned", "Contract"],
  "common:gender": ["Male", "Female", "Other"],
  "common:blood_group": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "common:marital_status": ["Single", "Married", "Divorced", "Widowed"],
  "common:employment_type": ["Permanent", "Contract", "Part Time"],
  "common:status": ["active", "inactive", "maintenance"],
  "driver:file_type": [
    "driving_license",
    "aadhaar_card",
    "pan_card",
    "police_verification",
    "medical_fitness",
    "training_certificate",
  ],
};

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

import path from "path";
import fs from "fs";
const STORAGE_DIR = path.join(process.cwd(), "storage");
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

app.use("/tenancy/assets", express.static(STORAGE_DIR));
app.use("/storage", express.static(STORAGE_DIR));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

function getOrgIdFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;

  try {
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { org_id?: string };
    return decoded.org_id || null;
  } catch {
    return null;
  }
}

function getPagination(req: Request) {
  const page = Math.max(Number(req.query.page ?? 1) || 1, 1);
  const perPage = Math.min(Math.max(Number(req.query.per_page ?? 10) || 10, 1), 100);
  const offset = (page - 1) * perPage;
  return { page, perPage, offset };
}

function paginatedPayload<T>(rows: T[], page: number, perPage: number, total: number) {
  const from = total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = total > 0 ? Math.min((page - 1) * perPage + rows.length, total) : 0;
  return {
    success: true,
    data: {
      data: rows,
      current_page: page,
      last_page: Math.max(Math.ceil(total / perPage), 1),
      per_page: perPage,
      total,
      from,
      to,
    },
  };
}

async function fetchRowsWithOrgFallback(table: string, orgId: string) {
  const columns = await getTableColumns(table);
  if (columns.has("org_id")) {
    const scoped = await pool.query(`SELECT * FROM ${table} WHERE org_id = $1 ORDER BY id DESC`, [orgId]);
    if (scoped.rows.length > 0) return scoped.rows;
  }

  const all = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
  return all.rows;
}

function parseQualifiedTableName(table: string) {
  const parts = table.split(".");
  const schema = (parts[0] || "public").replace(/"/g, "");
  const name = (parts[1] || parts[0] || "").replace(/"/g, "");
  return { schema, name };
}

async function getTableColumns(table: string): Promise<Set<string>> {
  const cached = tableColumnCache.get(table);
  if (cached) return cached;

  const { schema, name } = parseQualifiedTableName(table);
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
    [schema, name]
  );

  const cols = new Set(result.rows.map((row: any) => String(row.column_name)));
  tableColumnCache.set(table, cols);
  return cols;
}

function normalizeVehicleRow(row: any) {
  return {
    ...row,
    vehicle_name: row.vehicle_name || row.vehicle_number || "-",
    make: row.make || row.manufacturer || "",
    model: row.model || row.vehicle_model || "",
    capacity: row.capacity ?? row.seating_capacity ?? null,
    lastGpsUpdate: row.lastGpsUpdate || row.last_gps_update || null,
  };
}

function toVehiclePayload(body: Record<string, unknown>, allowed: Set<string>) {
  const payload: Record<string, unknown> = {};
  const keys = [
    "vehicle_name",
    "vehicle_number",
    "model",
    "make",
    "capacity",
    "status",
    "gps_device_id",
    "battery",
    "lat",
    "lng",
    "speed",
    "last_gps_update",
    "vehicle_type",
    "rc_number",
    "rc_isued_date",
    "rc_expiry_date",
    "manufacturer",
    "vehicle_model",
    "manufacturing_year",
    "fuel_type",
    "seating_capacity",
    "vehicle_color",
    "kilometers_driven",
    "driver",
    "route",
    "gps_device",
    "gps_installation_date",
    "permit_type",
    "permit_number",
    "permit_issue_date",
    "permit_expiry_date",
    "ownership_type",
    "vendor_name",
    "vendor_aadhar_number",
    "vendor_pan_number",
    "vendor_contact_number",
    "vendor_organization_name",
    "insurance_provider_name",
    "insurance_policy_number",
    "insurance_issued_date",
    "insurance_expiry_date",
    "fitness_certificate_number",
    "fitness_issued_date",
    "fitness_expiry_date",
    "pollution_certificate_number",
    "pollution_issued_date",
    "pollution_expiry_date",
    "tax_renewable_date",
    "last_service_date",
    "next_service_due_date",
    "tyre_replacement_due_date",
    "battery_replacement_due_date",
    "fire_extinguisher",
    "first_aid_kit",
    "cctv_installed",
    "panic_button_installed",
    "remarks",
    "vehicle_remarks",
    "insurance_doc",
    "rc_book_doc",
    "puc_doc",
    "fitness_certificate",
    "permit_copy",
    "gps_installation_proof",
    "saftey_certificate",
    "vendor_pan",
    "vendor_adhaar",
    "vendor_bank_proof",
    "vendor_contract_proof",
    "vedor_company_registration_doc",
  ];

  for (const key of keys) {
    if (!allowed.has(key)) continue;
    const value = body[key];
    if (value === undefined || value === null || value === "") continue;
    payload[key] = value;
  }

  if (allowed.has("vehicle_name") && !payload.vehicle_name && typeof payload.vehicle_number === "string") {
    payload.vehicle_name = payload.vehicle_number;
  }

  return payload;
}

function normalizeDriverRow(row: any) {
  if (row.license_insurance && typeof row.license_insurance === "string") {
    try {
      row.license_insurance = JSON.parse(row.license_insurance);
    } catch {
      row.license_insurance = [];
    }
  }
  return row;
}

function normalizeEmployeeRow(row: any) {
  if (row.roles && typeof row.roles === "string") {
    try {
      row.roles = JSON.parse(row.roles);
    } catch {
      row.roles = [];
    }
  }
  if (row.dependants && typeof row.dependants === "string") {
    try {
      row.dependants = JSON.parse(row.dependants);
    } catch {
      row.dependants = [];
    }
  }
  return row;
}

function toEmployeePayload(body: Record<string, unknown>, allowed: Set<string>) {
  const payload: Record<string, unknown> = {};
  const keys = [
    "employee_id", "photo", "employment_type", "designation", "joining_date",
    "first_name", "last_name", "gender", "marital_status", "date_of_birth", "email", "phone",
    "dependants", "address_line_1", "address_line_2", "landmark", "state", "district", "city", "pin_code",
    "primary_person_name", "primary_person_email", "primary_person_phone_1", "primary_person_phone_2",
    "secondary_person_name", "secondary_person_email", "secondary_person_phone_1", "secondary_person_phone_2",
    "account_holder_name", "account_number", "ifsc_code", "bank_name",
    "aadhaar_card", "pan_card", "bank_proof", "status", "remarks", "roles"
  ];

  for (const key of keys) {
    if (!allowed.has(key)) continue;
    let value = body[key];
    
    // Handle roles[] from FormData
    if (key === "roles" && body["roles[]"]) {
      value = body["roles[]"];
    }

    if (value === undefined || value === null || value === "") continue;
    
    // Stringify JSON fields if they are objects
    if (["dependants", "roles"].includes(key) && typeof value === "object") {
      payload[key] = JSON.stringify(value);
    } else {
      payload[key] = value;
    }
  }
  return payload;
}

function toDriverPayload(body: Record<string, unknown>, allowed: Set<string>) {
  const payload: Record<string, unknown> = {};
  const keys = [
    "first_name", "last_name", "gender", "date_of_birth", "email", "mobile_number",
    "blood_group", "marital_status", "number_of_dependents", "profile_photo",
    "primary_person_name", "primary_person_email", "primary_person_phone_1", "primary_person_phone_2",
    "secondary_person_name", "secondary_person_email", "secondary_person_phone_1", "secondary_person_phone_2",
    "address_line_1", "address_line_2", "landmark", "city", "district", "state", "pin_code",
    "employment_type", "employee_id", "safety_training_completion", "safety_training_completion_date",
    "medical_fitness", "medical_fitness_exp_date", "driving_experience", "police_verification", "police_verification_date",
    "bank_name", "account_holder_name", "account_number", "ifsc_code",
    "license_insurance", "beacon_id", "vehicle", "driving_license", "aadhaar_card", "pan_card",
    "police_verification_doc", "medical_fitness_certificate", "address_proof_doc", "training_certificate_doc",
    "status", "remarks"
  ];

  for (const key of keys) {
    if (!allowed.has(key)) continue;
    const value = body[key];
    if (value === undefined || value === null || value === "") continue;
    payload[key] = value;
  }
  return payload;
}

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const conn = await pool.connect();
    conn.release();
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.json({ status: "ok", db: "disconnected", timestamp: new Date().toISOString() });
  }
});

// Auth endpoints
app.post("/api/tenant-login", (req: Request, res: Response) => {
  const email = String(req.body?.email || "");
  console.log(`[AUTH] Dummy login attempt for: ${email}`);

  const token = jwt.sign(
    {
      id: "user-123",
      email,
      role: "admin",
      org_id: DUMMY_ORG_ID,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: "user-123",
        name: "Dummy Administrator",
        email,
        role: "admin",
        org_id: DUMMY_ORG_ID,
      },
    },
  });
});

app.get("/api/refreshMe", (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({
    id: "user-123",
    name: "Dummy Administrator",
    email: "admin@admin.com",
    roles: ["admin"],
    tenant_id: orgId,
    permissions: ["manage_fleet", "view_reports"],
  });
});

// Employees
app.get("/api/employees", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { page, perPage, offset } = getPagination(req);
  const search = String(req.query.search || "").trim().toLowerCase();
  const status = String(req.query.status || "").trim().toLowerCase();
  const role = String(req.query.role || "").trim().toLowerCase();

  try {
    let rows = await fetchRowsWithOrgFallback(EMPLOYEE_TABLE, orgId);

    rows = rows.filter((row: any) => {
      const roleList = Array.isArray(row.roles) ? row.roles : [];
      const matchesSearch =
        !search ||
        [row.employee_id, row.first_name, row.last_name, row.email, row.phone, row.designation]
          .some((v) => String(v || "").toLowerCase().includes(search));
      const matchesStatus = !status || String(row.status || "").toLowerCase() === status;
      const matchesRole = !role || roleList.some((r: any) => String(r || "").toLowerCase().includes(role));
      return matchesSearch && matchesStatus && matchesRole;
    });

    const total = rows.length;
    const paged = rows.slice(offset, offset + perPage).map(r => normalizeEmployeeRow(r));
    res.json(paginatedPayload(paged, page, perPage, total));
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to fetch employees" });
  }
});

app.post("/api/employees", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const columns = await getTableColumns(EMPLOYEE_TABLE);
    const payload = toEmployeePayload(req.body as Record<string, unknown>, columns);
    
    if (columns.has("org_id")) payload.org_id = orgId;
    if (columns.has("status") && !payload.status) payload.status = "active";
    if (columns.has("created_at")) payload.created_at = new Date().toISOString();
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const insertColumns = Object.keys(payload);
    if (!insertColumns.length) {
      res.status(400).json({ success: false, message: "No valid employee fields to save" });
      return;
    }

    const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(", ");
    const values = insertColumns.map((key) => payload[key]);

    const result = await pool.query(
      `INSERT INTO ${EMPLOYEE_TABLE} (${insertColumns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    res.status(201).json({ success: true, data: normalizeEmployeeRow(result.rows[0]), message: "Employee created successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to create employee" });
  }
});

app.get("/api/employees/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  try {
    const columns = await getTableColumns(EMPLOYEE_TABLE);
    let row;
    if (columns.has("org_id")) {
      const scoped = await pool.query(`SELECT * FROM ${EMPLOYEE_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`, [orgId, id]);
      row = scoped.rows[0];
    } else {
      const all = await pool.query(`SELECT * FROM ${EMPLOYEE_TABLE} WHERE id = $1 LIMIT 1`, [id]);
      row = all.rows[0];
    }

    if (!row) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    res.json({ success: true, data: normalizeEmployeeRow(row) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: "Failed to fetch employee" });
  }
});

app.put("/api/employees/:id", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  const id = Number(req.params.id);
  if (!orgId || !id) {
    res.status(401).json({ message: "Unauthorized or invalid ID" });
    return;
  }

  try {
    const columns = await getTableColumns(EMPLOYEE_TABLE);
    const payload = toEmployeePayload(req.body as Record<string, unknown>, columns);
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const updateKeys = Object.keys(payload);
    if (!updateKeys.length) {
      res.json({ success: true, message: "No fields to update" });
      return;
    }

    const setClause = updateKeys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const whereClause = columns.has("org_id") ? `WHERE id = $${updateKeys.length + 1} AND org_id = $${updateKeys.length + 2}` : `WHERE id = $${updateKeys.length + 1}`;
    const params = columns.has("org_id") ? [...updateKeys.map(k => payload[k]), id, orgId] : [...updateKeys.map(k => payload[k]), id];

    const result = await pool.query(
      `UPDATE ${EMPLOYEE_TABLE} SET ${setClause} ${whereClause} RETURNING *`,
      params
    );

    if (!result.rows.length) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    res.json({ success: true, data: normalizeEmployeeRow(result.rows[0]), message: "Employee updated successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to update employee" });
  }
});

app.delete("/api/employees/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  const id = Number(req.params.id);
  if (!orgId || !id) {
    res.status(401).json({ message: "Unauthorized or invalid ID" });
    return;
  }

  try {
    const columns = await getTableColumns(EMPLOYEE_TABLE);
    const whereClause = columns.has("org_id") ? `WHERE id = $1 AND org_id = $2` : `WHERE id = $1`;
    const params = columns.has("org_id") ? [id, orgId] : [id];
    
    const result = await pool.query(`DELETE FROM ${EMPLOYEE_TABLE} ${whereClause}`, params);
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete employee" });
  }
});

// Vehicles
app.get("/api/vehicles", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { page, perPage, offset } = getPagination(req);

  try {
    const rows = await fetchRowsWithOrgFallback(VEHICLE_TABLE, orgId);
    const total = rows.length;
    const paged = rows.slice(offset, offset + perPage).map((row: any) => normalizeVehicleRow(row));
    res.json(paginatedPayload(paged, page, perPage, total));
  } catch {
    res.json(paginatedPayload([], page, perPage, 0));
  }
});

app.get("/api/vehicles/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Invalid vehicle id" });
    return;
  }

  try {
    const columns = await getTableColumns(VEHICLE_TABLE);
    if (columns.has("org_id")) {
      const scoped = await pool.query(`SELECT * FROM ${VEHICLE_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`, [orgId, id]);
      if (scoped.rows.length) {
        res.json({ success: true, data: normalizeVehicleRow(scoped.rows[0]) });
        return;
      }
    }

    const all = await pool.query(`SELECT * FROM ${VEHICLE_TABLE} WHERE id = $1 LIMIT 1`, [id]);
    if (!all.rows.length) {
      res.status(404).json({ success: false, message: "Vehicle not found" });
      return;
    }

    res.json({ success: true, data: normalizeVehicleRow(all.rows[0]) });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch vehicle" });
  }
});

app.post("/api/vehicles", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const vehicleNumber = String(req.body?.vehicle_number || "").trim();
  if (!vehicleNumber) {
    res.status(400).json({ success: false, message: "vehicle_number is required" });
    return;
  }

  try {
    const columns = await getTableColumns(VEHICLE_TABLE);
    const payload = toVehiclePayload(req.body as Record<string, unknown>, columns);
    if (columns.has("vehicle_number")) payload.vehicle_number = vehicleNumber;
    if (columns.has("org_id")) payload.org_id = orgId;
    if (columns.has("status") && !payload.status) payload.status = "active";
    if (columns.has("created_at")) payload.created_at = new Date().toISOString();
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const insertColumns = Object.keys(payload);
    if (!insertColumns.length) {
      res.status(400).json({ success: false, message: "No valid vehicle fields to save" });
      return;
    }

    const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(", ");
    const values = insertColumns.map((key) => payload[key]);

    const result = await pool.query(
      `INSERT INTO ${VEHICLE_TABLE} (${insertColumns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    res.status(201).json({ success: true, data: normalizeVehicleRow(result.rows[0]), message: "Vehicle created successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to create vehicle" });
  }
});

app.put("/api/vehicles/:id", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Invalid vehicle id" });
    return;
  }

  try {
    const columns = await getTableColumns(VEHICLE_TABLE);
    const payload = toVehiclePayload(req.body as Record<string, unknown>, columns);
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const updates = Object.keys(payload);
    if (!updates.length) {
      res.status(400).json({ success: false, message: "No fields provided for update" });
      return;
    }

    const setClause = updates.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = updates.map((key) => payload[key]);

    const whereClause = columns.has("org_id")
      ? `id = $${values.length + 1} AND org_id = $${values.length + 2}`
      : `id = $${values.length + 1}`;

    const params = columns.has("org_id")
      ? [...values, id, orgId]
      : [...values, id];

    const result = await pool.query(
      `UPDATE ${VEHICLE_TABLE}
       SET ${setClause}
       WHERE ${whereClause}
       RETURNING *`,
      params
    );

    if (!result.rows.length) {
      res.status(404).json({ success: false, message: "Vehicle not found" });
      return;
    }

    res.json({ success: true, data: normalizeVehicleRow(result.rows[0]), message: "Vehicle updated successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to update vehicle" });
  }
});

app.delete("/api/vehicles/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Invalid vehicle id" });
    return;
  }

  try {
    const columns = await getTableColumns(VEHICLE_TABLE);
    const result = columns.has("org_id")
      ? await pool.query(`DELETE FROM ${VEHICLE_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, id])
      : await pool.query(`DELETE FROM ${VEHICLE_TABLE} WHERE id = $1`, [id]);
    if (!result.rowCount) {
      res.status(404).json({ success: false, message: "Vehicle not found" });
      return;
    }
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete vehicle" });
  }
});

// Drivers
app.get("/api/drivers", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { page, perPage, offset } = getPagination(req);

  try {
    const rows = await fetchRowsWithOrgFallback(DRIVER_TABLE, orgId);
    const total = rows.length;
    const paged = rows.slice(offset, offset + perPage).map(r => normalizeDriverRow(r));
    res.json(paginatedPayload(paged, page, perPage, total));
  } catch {
    res.json(paginatedPayload([], page, perPage, 0));
  }
});

app.get("/api/drivers/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Invalid driver id" });
    return;
  }

  try {
    const columns = await getTableColumns(DRIVER_TABLE);
    if (columns.has("org_id")) {
      const scoped = await pool.query(`SELECT * FROM ${DRIVER_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`, [orgId, id]);
      if (scoped.rows.length) {
        res.json({ success: true, data: normalizeDriverRow(scoped.rows[0]) });
        return;
      }
    }

    const all = await pool.query(`SELECT * FROM ${DRIVER_TABLE} WHERE id = $1 LIMIT 1`, [id]);
    if (!all.rows.length) {
      res.status(404).json({ success: false, message: "Driver not found" });
      return;
    }

    res.json({ success: true, data: normalizeDriverRow(all.rows[0]) });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch driver" });
  }
});

app.post("/api/drivers", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const columns = await getTableColumns(DRIVER_TABLE);
    const payload = toDriverPayload(req.body as Record<string, unknown>, columns);
    
    if (columns.has("org_id")) payload.org_id = orgId;
    if (columns.has("status") && !payload.status) payload.status = "active";
    if (columns.has("created_at")) payload.created_at = new Date().toISOString();
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const insertColumns = Object.keys(payload);
    if (!insertColumns.length) {
      res.status(400).json({ success: false, message: "No valid driver fields to save" });
      return;
    }

    const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(", ");
    const values = insertColumns.map((key) => payload[key]);

    const result = await pool.query(
      `INSERT INTO ${DRIVER_TABLE} (${insertColumns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    res.status(201).json({ success: true, data: normalizeDriverRow(result.rows[0]), message: "Driver created successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to create driver" });
  }
});

app.post("/api/drivers/:id", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Invalid driver id" });
    return;
  }

  try {
    const columns = await getTableColumns(DRIVER_TABLE);
    const payload = toDriverPayload(req.body as Record<string, unknown>, columns);
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const updates = Object.keys(payload);
    if (!updates.length) {
      res.status(400).json({ success: false, message: "No fields provided for update" });
      return;
    }

    const setClause = updates.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = updates.map((key) => payload[key]);

    const whereClause = columns.has("org_id")
      ? `id = $${values.length + 1} AND org_id = $${values.length + 2}`
      : `id = $${values.length + 1}`;

    const params = columns.has("org_id")
      ? [...values, id, orgId]
      : [...values, id];

    const result = await pool.query(
      `UPDATE ${DRIVER_TABLE}
       SET ${setClause}
       WHERE ${whereClause}
       RETURNING *`,
      params
    );

    if (!result.rows.length) {
      res.status(404).json({ success: false, message: "Driver not found" });
      return;
    }

    res.json({ success: true, data: normalizeDriverRow(result.rows[0]), message: "Driver updated successfully" });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to update driver" });
  }
});

app.get("/api/gps-device/for/dropdown", (_req: Request, res: Response) => {
  res.json([]);
});

app.get("/api/beacon-device/for/dropdown", (_req: Request, res: Response) => {
  res.json([]);
});

app.get("/api/active-vehicles/for/dropdown", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const rows = await fetchRowsWithOrgFallback(VEHICLE_TABLE, orgId);
    const active = rows
      .filter((row: any) => String(row.status || "active").toLowerCase() === "active")
      .map((row: any) => ({
        id: row.id,
        vehicle_number: row.vehicle_number,
        vehicle_name: row.vehicle_name || row.vehicle_number,
      }));
    res.json(active);
  } catch {
    res.json([]);
  }
});

app.delete("/api/drivers/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Invalid driver id" });
    return;
  }

  try {
    const result = await pool.query(`DELETE FROM ${DRIVER_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, id]);
    if (!result.rowCount) {
      res.status(404).json({ success: false, message: "Driver not found" });
      return;
    }
    res.json({ success: true, message: "Driver deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete driver" });
  }
});

// Roles & permissions endpoints (pre-refactor style, inline)
app.get("/api/roles", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, org_id, name, description, created_at, updated_at FROM ${ROLE_TABLE} WHERE org_id = $1 ORDER BY id DESC`,
      [orgId]
    );
    res.json({ success: true, data: result.rows });
  } catch {
    res.json({ success: true, data: [] });
  }
});

app.post("/api/roles", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const name = String(req.body?.name || "").trim();
  const description = req.body?.description ? String(req.body.description) : null;
  if (!name) {
    res.status(400).json({ success: false, message: "Role name is required" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO ${ROLE_TABLE} (org_id, name, description) VALUES ($1, $2, $3) RETURNING id, org_id, name, description, created_at, updated_at`,
      [orgId, name, description]
    );
    const newRole = result.rows[0];

    // Handle Permissions
    const permissionIds = Array.isArray(req.body?.permissions) ? req.body.permissions : [];
    if (permissionIds.length > 0) {
      for (const pId of permissionIds) {
        await pool.query(
          `INSERT INTO ${ROLE_PERMISSION_MAP_TABLE} (role_id, permission_id) VALUES ($1, $2)`,
          [newRole.id, pId]
        ).catch(e => console.error("Failed to map permission", e));
      }
    }

    res.status(201).json({ success: true, data: newRole, message: "Role created successfully" });
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ success: false, message: "Role already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Failed to create role" });
  }
});

app.get("/api/roles/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const roleId = Number(req.params.id);
  if (!Number.isFinite(roleId)) {
    res.status(400).json({ success: false, message: "Invalid role id" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, org_id, name, description, created_at, updated_at FROM ${ROLE_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`,
      [orgId, roleId]
    );

    if (!result.rows.length) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }

    const role = result.rows[0];
    const permsResult = await pool.query(
      `SELECT p.id, p.name FROM ${PERMISSION_TABLE} p 
       JOIN ${ROLE_PERMISSION_MAP_TABLE} rpm ON p.id = rpm.permission_id
       WHERE rpm.role_id = $1`,
      [roleId]
    );
    role.permissions = permsResult.rows;

    res.json({ success: true, data: role });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch role" });
  }
});

app.put("/api/roles/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const roleId = Number(req.params.id);
  const name = req.body?.name ? String(req.body.name).trim() : null;
  const description = req.body?.description !== undefined ? String(req.body.description || "") : null;

  if (!Number.isFinite(roleId)) {
    res.status(400).json({ success: false, message: "Invalid role id" });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE ${ROLE_TABLE}
       SET name = COALESCE($3, name), description = COALESCE($4, description), updated_at = NOW()
       WHERE org_id = $1 AND id = $2
       RETURNING id, org_id, name, description, created_at, updated_at`,
      [orgId, roleId, name, description]
    );

    if (!result.rows.length) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }

    // Update Permissions
    const permissionIds = Array.isArray(req.body?.permissions) ? req.body.permissions : null;
    if (permissionIds !== null) {
      // Sync logic: delete old, insert new (simple approach)
      await pool.query(`DELETE FROM ${ROLE_PERMISSION_MAP_TABLE} WHERE role_id = $1`, [roleId]);
      for (const pId of permissionIds) {
        await pool.query(
          `INSERT INTO ${ROLE_PERMISSION_MAP_TABLE} (role_id, permission_id) VALUES ($1, $2)`,
          [roleId, pId]
        ).catch(e => console.error("Failed to sync permission", e));
      }
    }

    res.json({ success: true, data: result.rows[0], message: "Role updated successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});

app.delete("/api/roles/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const roleId = Number(req.params.id);
  if (!Number.isFinite(roleId)) {
    res.status(400).json({ success: false, message: "Invalid role id" });
    return;
  }

  try {
    const result = await pool.query(`DELETE FROM ${ROLE_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, roleId]);
    if (!result.rowCount) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }
    res.json({ success: true, message: "Role deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete role" });
  }
});

app.get("/api/permissions", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(`SELECT id, name FROM ${PERMISSION_TABLE} ORDER BY id ASC`);
    res.json({ success: true, data: result.rows });
  } catch {
    res.json({ success: true, data: [] });
  }
});

app.post("/api/permissions", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const name = String(req.body?.name || "").trim();
  if (!name) {
    res.status(400).json({ success: false, message: "Permission name is required" });
    return;
  }

  try {
    const result = await pool.query(`INSERT INTO ${PERMISSION_TABLE} (name) VALUES ($1) RETURNING id, name`, [name]);
    res.status(201).json({ success: true, data: result.rows[0], message: "Permission created successfully" });
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ success: false, message: "Permission already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Failed to create permission" });
  }
});

app.delete("/api/permissions/:id", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const permissionId = Number(req.params.id);
  if (!Number.isFinite(permissionId)) {
    res.status(400).json({ success: false, message: "Invalid permission id" });
    return;
  }

  try {
    const result = await pool.query(`DELETE FROM ${PERMISSION_TABLE} WHERE id = $1`, [permissionId]);
    if (!result.rowCount) {
      res.status(404).json({ success: false, message: "Permission not found" });
      return;
    }
    res.json({ success: true, message: "Permission deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete permission" });
  }
});

// Master endpoints
app.get("/api/masters/forms/dropdowns/fields", (req: Request, res: Response) => {
  const type = String(req.query.type || "").toLowerCase();
  const field = String(req.query.field || "").toLowerCase();
  const key = `${type}:${field}`;
  const values = dropdownValues[key] || [];

  res.json(
    values.map((value, index) => ({
      id: index + 1,
      type,
      field,
      value,
    }))
  );
});

app.get("/api/masters/forms/dropdowns/states", (_req: Request, res: Response) => {
  res.json(stateDistrictSeed);
});

app.get("/api/masters/forms/dropdowns/districts/:state", (req: Request, res: Response) => {
  const state = String(req.params.state || "").toLowerCase();
  const districts = stateDistrictSeed.filter((item) => item.state.toLowerCase() === state);
  res.json(districts);
});

app.get("/api/stats/summary", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalVehicles: 0,
      activeVehicles: 0,
      totalStaff: 0,
      activeTrips: 0,
    },
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, async () => {
  let dbStatus = "disconnected";
  try {
    const conn = await pool.connect();
    conn.release();
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🚀 Institute Panel Backend (Pre-Refactor)          ║
║                                                            ║
║  Port: ${String(PORT).padEnd(52)}║
║  API URL: http://localhost:${PORT}/api${" ".repeat(40 - String(PORT).length)}║
║  DB: ${dbStatus.padEnd(54)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
