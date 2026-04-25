import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
const GPS_DEVICE_TABLE = 'schemaa."officeGpsDevices"';
const BEACON_DEVICE_TABLE = 'schemaa."officeBeaconDevices"';
const IOT_BASE_URL = process.env.IOT_BASE_URL || "https://vanloka-iot-function-a8eqh5b4euh6fxa2.southindia-01.azurewebsites.net/api";

// IoT read keys
const IOT_GET_AVAILABLE_GPS_KEY = process.env.IOT_GET_AVAILABLE_GPS_KEY || "";
const IOT_GET_AVAILABLE_BEACONS_KEY = process.env.IOT_GET_AVAILABLE_BEACONS_KEY || "";
const IOT_GET_BEACONS_KEY = process.env.IOT_GET_BEACONS_KEY || "";
const IOT_GET_ASSIGNMENTS_KEY = process.env.IOT_GET_ASSIGNMENTS_KEY || "";

// IoT write keys
const IOT_ASSIGN_GPS_TO_VEHICLE_KEY = process.env.IOT_ASSIGN_GPS_TO_VEHICLE_KEY || "";
const IOT_ASSIGN_BEACON_TO_DRIVER_KEY = process.env.IOT_ASSIGN_BEACON_TO_DRIVER_KEY || "";
const IOT_ALLOCATE_BEACON_TO_TENANT_KEY = process.env.IOT_ALLOCATE_BEACON_TO_TENANT_KEY || "";
const IOT_BULK_ALLOCATE_DEVICES_KEY = process.env.IOT_BULK_ALLOCATE_DEVICES_KEY || "";
const IOT_ASSIGN_BEACON_KEY = process.env.IOT_ASSIGN_BEACON_KEY || "";
const IOT_UNASSIGN_DEVICE_KEY = process.env.IOT_UNASSIGN_DEVICE_KEY || "";

type DeviceRecord = {
  id: string;
  source_id: number;
  device_type: "GPS" | "BEACON";
  sequnce_number: string | null;
  device_id: string | null;
  serial_number: string | null;
  imei_number: string | null;
  manufacture_date: string | null;
  status: string | null;
};
const USER_TABLE_CANDIDATES = [
  'schemaa."officeUsers"',
  "schemaa.users",
  "public.users",
  'public."officeUsers"',
];
const ORGANIZATION_TABLE_CANDIDATES = [
  'schemaa."officeOrganizations"',
  'schemaa."officeOrganization"',
  "schemaa.organizations",
  "schemaa.organisation",
  "schemaa.organisations",
  'public."officeOrganizations"',
  'public."officeOrganization"',
  "public.organizations",
  "public.organisation",
  "public.organisations",
];
const upload = multer({ storage: multer.memoryStorage() });
const tableColumnCache = new Map<string, Set<string>>();
let resolvedUserTable: string | null | undefined;
let resolvedUserColumns: Set<string> | null = null;
let resolvedOrganizationTable: string | null | undefined;
let resolvedOrganizationColumns: Set<string> | null = null;

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

function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

async function resolveUserAuthSource(): Promise<{ table: string; columns: Set<string> } | null> {
  if (resolvedUserTable !== undefined) {
    return resolvedUserTable && resolvedUserColumns
      ? { table: resolvedUserTable, columns: resolvedUserColumns }
      : null;
  }

  const hasCredentialColumns = (columns: Set<string>) => {
    const hasPassword =
      columns.has("password") || columns.has("password_hash") || columns.has("hashed_password");
    return columns.has("email") && hasPassword;
  };

  for (const table of USER_TABLE_CANDIDATES) {
    try {
      const columns = await getTableColumns(table);
      if (hasCredentialColumns(columns)) {
        resolvedUserTable = table;
        resolvedUserColumns = columns;
        return { table, columns };
      }
    } catch {
      // Ignore and continue probing candidates.
    }
  }

  try {
    const discovered = await pool.query(
      `
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        GROUP BY table_schema, table_name
        HAVING
          BOOL_OR(column_name = 'email')
          AND BOOL_OR(column_name IN ('password', 'password_hash', 'hashed_password'))
        ORDER BY
          CASE WHEN table_schema = 'schemaa' THEN 0 ELSE 1 END,
          CASE WHEN LOWER(table_name) LIKE $1 ESCAPE '\\\\' THEN 0 ELSE 1 END,
          table_schema,
          table_name
        LIMIT 1
      `,
      [`%${escapeLike("user")}%`]
    );

    const row = discovered.rows[0] as { table_schema: string; table_name: string } | undefined;
    if (row) {
      const table = `${quoteIdent(row.table_schema)}.${quoteIdent(row.table_name)}`;
      const columns = await getTableColumns(table);
      if (hasCredentialColumns(columns)) {
        resolvedUserTable = table;
        resolvedUserColumns = columns;
        return { table, columns };
      }
    }
  } catch {
    // Fall through to null.
  }

  resolvedUserTable = null;
  resolvedUserColumns = null;
  return null;
}

function getPasswordColumn(columns: Set<string>): string | null {
  if (columns.has("password_hash")) return "password_hash";
  if (columns.has("hashed_password")) return "hashed_password";
  if (columns.has("password")) return "password";
  return null;
}

function resolveUserName(row: Record<string, unknown>, email: string): string {
  const direct = ["name", "full_name", "display_name", "user_name"];
  for (const key of direct) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const first = typeof row.first_name === "string" ? row.first_name.trim() : "";
  const last = typeof row.last_name === "string" ? row.last_name.trim() : "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;

  return email.split("@")[0] || "User";
}

function getFirstDefined<T = unknown>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value as T;
    }
  }
  return undefined;
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore malformed JSON payload
  }
  return {};
}

function normalizeAssetUrl(relativePath: string): string {
  const safePath = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/storage/${safePath}`;
}

function saveUploadedOrganizationFile(orgId: string, key: string, file: Express.Multer.File): string {
  const ext = path.extname(file.originalname || "");
  const safeOrg = orgId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeKey}_${Date.now()}${ext}`;
  const relativeDir = path.join("org", safeOrg);
  const absoluteDir = path.join(STORAGE_DIR, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    fs.mkdirSync(absoluteDir, { recursive: true });
  }
  const absolutePath = path.join(absoluteDir, filename);
  fs.writeFileSync(absolutePath, file.buffer);
  return normalizeAssetUrl(path.join(relativeDir, filename));
}

function buildOrganizationScope(columns: Set<string>, orgId: string): { clause: string; params: unknown[]; key: string } | null {
  if (columns.has("org_id")) return { clause: `org_id = $1`, params: [orgId], key: "org_id" };
  if (columns.has("tenant_id")) return { clause: `tenant_id = $1`, params: [orgId], key: "tenant_id" };
  if (columns.has("id")) return { clause: `id = $1`, params: [orgId], key: "id" };
  return null;
}

function mapOrganizationResponse(
  orgId: string,
  orgRow: Record<string, unknown> | null,
  userRow: Record<string, unknown> | null,
  fallbackEmail: string,
): Record<string, unknown> {
  const source = orgRow || {};
  const user = userRow || {};

  const sourceAddress = parseJsonObject(source.address);
  const sourceContact = parseJsonObject(source.contact);
  const sourceInstitute = parseJsonObject(source.institute);
  const sourceDocuments = parseJsonObject(source.documents);

  return {
    id: getFirstDefined(source, ["id", "org_id", "tenant_id"]) || orgId,
    org_id: orgId,
    name:
      getFirstDefined<string>(source, ["name", "organization_name", "organisation_name", "legal_name"]) ||
      getFirstDefined<string>(user, ["name", "full_name", "display_name", "organization_name", "organisation_name"]) ||
      "",
    type: getFirstDefined<string>(source, ["type", "organization_type", "organisation_type"]) || "",
    registration_no: getFirstDefined<string>(source, ["registration_no", "registration_number", "reg_no"]) || "",
    gst_number: getFirstDefined<string>(source, ["gst_number", "gst_no"]) || "",
    pan_number: getFirstDefined<string>(source, ["pan_number", "pan_no"]) || "",
    website: getFirstDefined<string>(source, ["website", "website_url"]) || "",
    phone: getFirstDefined<string>(source, ["phone", "contact_number", "mobile_number"]) || "",
    email:
      getFirstDefined<string>(source, ["email", "contact_email"]) ||
      getFirstDefined<string>(user, ["email"]) ||
      fallbackEmail ||
      "",
    status: getFirstDefined<string>(source, ["status"]) || "active",
    subscription_plan: getFirstDefined<string>(source, ["subscription_plan", "plan", "subscription"]) || "",
    address: {
      address1:
        getFirstDefined<string>(sourceAddress, ["address1", "address_line_1"]) ||
        getFirstDefined<string>(source, ["address1", "address_line_1"]) ||
        "",
      address2:
        getFirstDefined<string>(sourceAddress, ["address2", "address_line_2", "locality"]) ||
        getFirstDefined<string>(source, ["address2", "address_line_2", "locality"]) ||
        "",
      city: getFirstDefined<string>(sourceAddress, ["city"]) || getFirstDefined<string>(source, ["city"]) || "",
      district:
        getFirstDefined<string>(sourceAddress, ["district"]) || getFirstDefined<string>(source, ["district"]) || "",
      state: getFirstDefined<string>(sourceAddress, ["state"]) || getFirstDefined<string>(source, ["state"]) || "",
      pincode:
        getFirstDefined<string>(sourceAddress, ["pincode", "pin_code"]) ||
        getFirstDefined<string>(source, ["pincode", "pin_code"]) ||
        "",
    },
    contact: {
      primary_name:
        getFirstDefined<string>(sourceContact, ["primary_name", "name"]) ||
        getFirstDefined<string>(source, ["contact_name", "primary_name"]) ||
        "",
      primary_phone:
        getFirstDefined<string>(sourceContact, ["primary_phone", "phone"]) ||
        getFirstDefined<string>(source, ["contact_phone", "primary_phone"]) ||
        "",
      primary_email:
        getFirstDefined<string>(sourceContact, ["primary_email", "email"]) ||
        getFirstDefined<string>(source, ["contact_email", "primary_email", "email"]) ||
        fallbackEmail ||
        "",
    },
    institute: {
      affiliation_board:
        getFirstDefined<string>(sourceInstitute, ["affiliation_board"]) ||
        getFirstDefined<string>(source, ["affiliation_board"]) ||
        "",
      udise_code:
        getFirstDefined<string>(sourceInstitute, ["udise_code"]) || getFirstDefined<string>(source, ["udise_code"]) || "",
      institution_type:
        getFirstDefined<string>(sourceInstitute, ["institution_type"]) ||
        getFirstDefined<string>(source, ["institution_type"]) ||
        "",
      safety_officer_name:
        getFirstDefined<string>(sourceInstitute, ["safety_officer_name"]) ||
        getFirstDefined<string>(source, ["safety_officer_name"]) ||
        "",
      safety_officer_contact:
        getFirstDefined<string>(sourceInstitute, ["safety_officer_contact"]) ||
        getFirstDefined<string>(source, ["safety_officer_contact"]) ||
        "",
    },
    documents: {
      pan_card:
        getFirstDefined<string>(sourceDocuments, ["pan_card"]) || getFirstDefined<string>(source, ["pan_card"]) || "",
      gst_cert:
        getFirstDefined<string>(sourceDocuments, ["gst_cert"]) ||
        getFirstDefined<string>(source, ["gst_cert", "gst_certificate"]) ||
        "",
      registration_cert:
        getFirstDefined<string>(sourceDocuments, ["registration_cert"]) ||
        getFirstDefined<string>(source, ["registration_cert", "registration_certificate"]) ||
        "",
    },
  };
}

function toOrganizationUpdatePayload(
  body: Record<string, unknown>,
  columns: Set<string>,
  filesByField: Record<string, Express.Multer.File | undefined>,
  orgId: string,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const address = parseJsonObject(body.address);
  const contact = parseJsonObject(body.contact);
  const institute = parseJsonObject(body.institute);
  const documents = parseJsonObject(body.documents);

  const docKeys = ["pan_card", "gst_cert", "registration_cert"];
  for (const docKey of docKeys) {
    const file = filesByField[docKey];
    if (file) {
      documents[docKey] = saveUploadedOrganizationFile(orgId, docKey, file);
    }
  }

  const setIfColumn = (column: string, value: unknown) => {
    if (!columns.has(column)) return;
    if (value === undefined || value === null || value === "") return;
    payload[column] = value;
  };

  setIfColumn("name", body.name);
  setIfColumn("organization_name", body.name);
  setIfColumn("organisation_name", body.name);
  setIfColumn("legal_name", body.name);
  setIfColumn("website", body.website);
  setIfColumn("website_url", body.website);
  setIfColumn("phone", body.phone);
  setIfColumn("mobile_number", body.phone);
  setIfColumn("contact_number", body.phone);
  setIfColumn("email", body.email);
  setIfColumn("contact_email", body.email);
  setIfColumn("gst_number", body.gst_number);
  setIfColumn("gst_no", body.gst_number);
  setIfColumn("pan_number", body.pan_number);
  setIfColumn("pan_no", body.pan_number);

  setIfColumn("address1", address.address1);
  setIfColumn("address_line_1", address.address1);
  setIfColumn("address2", address.address2);
  setIfColumn("address_line_2", address.address2);
  setIfColumn("locality", address.address2);
  setIfColumn("city", address.city);
  setIfColumn("district", address.district);
  setIfColumn("state", address.state);
  setIfColumn("pincode", address.pincode);
  setIfColumn("pin_code", address.pincode);

  setIfColumn("contact_name", contact.primary_name);
  setIfColumn("primary_name", contact.primary_name);
  setIfColumn("contact_phone", contact.primary_phone);
  setIfColumn("primary_phone", contact.primary_phone);
  setIfColumn("primary_email", contact.primary_email);

  setIfColumn("affiliation_board", institute.affiliation_board);
  setIfColumn("udise_code", institute.udise_code);
  setIfColumn("institution_type", institute.institution_type);
  setIfColumn("safety_officer_name", institute.safety_officer_name);
  setIfColumn("safety_officer_contact", institute.safety_officer_contact);

  setIfColumn("pan_card", documents.pan_card);
  setIfColumn("gst_cert", documents.gst_cert);
  setIfColumn("gst_certificate", documents.gst_cert);
  setIfColumn("registration_cert", documents.registration_cert);
  setIfColumn("registration_certificate", documents.registration_cert);

  if (columns.has("address")) payload.address = JSON.stringify(address);
  if (columns.has("contact")) payload.contact = JSON.stringify(contact);
  if (columns.has("institute")) payload.institute = JSON.stringify(institute);
  if (columns.has("documents")) payload.documents = JSON.stringify(documents);
  if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

  return payload;
}

async function resolveOrganizationSource(): Promise<{ table: string; columns: Set<string> } | null> {
  if (resolvedOrganizationTable !== undefined) {
    return resolvedOrganizationTable && resolvedOrganizationColumns
      ? { table: resolvedOrganizationTable, columns: resolvedOrganizationColumns }
      : null;
  }

  const hasUsableColumns = (columns: Set<string>) => {
    const hasScope = columns.has("org_id") || columns.has("tenant_id") || columns.has("id");
    const hasIdentity =
      columns.has("name") ||
      columns.has("organization_name") ||
      columns.has("organisation_name") ||
      columns.has("legal_name");
    return hasScope && hasIdentity;
  };

  for (const table of ORGANIZATION_TABLE_CANDIDATES) {
    try {
      const columns = await getTableColumns(table);
      if (hasUsableColumns(columns)) {
        resolvedOrganizationTable = table;
        resolvedOrganizationColumns = columns;
        return { table, columns };
      }
    } catch {
      // Keep probing next candidate
    }
  }

  try {
    const discovered = await pool.query(
      `
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        GROUP BY table_schema, table_name
        HAVING
          BOOL_OR(column_name IN ('org_id', 'tenant_id'))
          AND BOOL_OR(column_name IN ('name', 'organization_name', 'organisation_name', 'legal_name'))
        ORDER BY
          CASE WHEN table_schema = 'schemaa' THEN 0 ELSE 1 END,
          CASE WHEN LOWER(table_name) LIKE $1 ESCAPE '\\\\' THEN 0 ELSE 1 END,
          table_schema,
          table_name
        LIMIT 1
      `,
      [`%${escapeLike("org")}%`],
    );

    const row = discovered.rows[0] as { table_schema: string; table_name: string } | undefined;
    if (row) {
      const table = `${quoteIdent(row.table_schema)}.${quoteIdent(row.table_name)}`;
      const columns = await getTableColumns(table);
      resolvedOrganizationTable = table;
      resolvedOrganizationColumns = columns;
      return { table, columns };
    }
  } catch {
    // Fall through to null.
  }

  resolvedOrganizationTable = null;
  resolvedOrganizationColumns = null;
  return null;
}

function isPasswordHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  if (!storedPassword) return false;
  if (isPasswordHash(storedPassword)) {
    return bcrypt.compare(inputPassword, storedPassword);
  }
  return inputPassword === storedPassword;
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
    console.log(`[TENANT] Scoping ${table} query to org_id: ${orgId}`);
    const result = await pool.query(`SELECT * FROM ${table} WHERE org_id = $1 ORDER BY id DESC`, [orgId]);
    return result.rows;
  }

  console.warn(`[TENANT] Table ${table} is missing "org_id" column! Blocking access.`);
  return [];
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

function extractArrayPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.devices)) return payload.devices;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

function toIotDeviceRecord(raw: Record<string, unknown>, type: "GPS" | "BEACON", index: number): DeviceRecord {
  const sourceIdRaw = raw.id ?? raw.device_id ?? raw.deviceId ?? raw.imei_number ?? raw.imeiNumber ?? index + 1;
  const sourceId = Number(sourceIdRaw);

  const isAllocated =
    raw.isAllocated === true ||
    String(raw.isAllocated ?? "").toLowerCase() === "true" ||
    String(raw.allocated ?? "").toLowerCase() === "true";

  const status = pickString(raw.status, raw.currentStatus) || (isAllocated ? "allocated" : "available");

  return {
    id: `${type.toLowerCase()}-iot-${String(sourceIdRaw)}`,
    source_id: Number.isFinite(sourceId) ? sourceId : index + 1,
    device_type: type,
    sequnce_number: pickString(raw.sequnce_number, raw.sequence_number, raw.sequenceNo),
    device_id: pickString(raw.device_id, raw.deviceId, raw.gpsId, raw.beaconId),
    serial_number: pickString(raw.serial_number, raw.serialNumber),
    imei_number: pickString(raw.imei_number, raw.imeiNumber, raw.imei),
    manufacture_date: pickString(raw.manufacture_date, raw.manufactureDate),
    status,
  };
}

async function fetchIotAvailableDevices(orgId: string, includeGps: boolean, includeBeacon: boolean): Promise<DeviceRecord[]> {
  if (typeof fetch !== "function") return [];

  const tasks: Array<Promise<DeviceRecord[]>> = [];

  if (includeGps && IOT_GET_AVAILABLE_GPS_KEY) {
    const gpsUrl = `${IOT_BASE_URL}/getAvailableGPS?code=${encodeURIComponent(IOT_GET_AVAILABLE_GPS_KEY)}`;
    tasks.push(
      fetch(gpsUrl)
        .then(async (response) => {
          console.log(`[IOT] getAvailableGPS → ${response.status}`);
          if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.error(`[IOT] getAvailableGPS error body: ${body.substring(0, 500)}`);
            return [];
          }
          const payload = await response.json().catch(() => null);
          console.log(`[IOT] getAvailableGPS payload keys:`, payload ? Object.keys(payload) : "null");
          return extractArrayPayload(payload).map((item, index) => toIotDeviceRecord(item, "GPS", index));
        })
        .catch((e) => { console.error(`[IOT] getAvailableGPS fetch error: ${e.message}`); return []; })
    );
  }

  if (includeBeacon) {
    // Fetch available beacons
    if (IOT_GET_AVAILABLE_BEACONS_KEY) {
      const beaconUrl = `${IOT_BASE_URL}/getAvailableBeacons?code=${encodeURIComponent(IOT_GET_AVAILABLE_BEACONS_KEY)}`;
      tasks.push(
        fetch(beaconUrl)
          .then(async (response) => {
            console.log(`[IOT] getAvailableBeacons → ${response.status}`);
            if (!response.ok) return [];
            const payload = await response.json().catch(() => null);
            console.log(`[IOT] getAvailableBeacons payload keys:`, payload ? Object.keys(payload) : "null");
            return extractArrayPayload(payload).map((item, index) => toIotDeviceRecord(item, "BEACON", index));
          })
          .catch((e) => { console.error(`[IOT] getAvailableBeacons error: ${e.message}`); return []; })
      );
    }

    // Fetch ALL beacons (includes assigned ones)
    if (IOT_GET_BEACONS_KEY) {
      const allBeaconUrl = `${IOT_BASE_URL}/getBeacons?code=${encodeURIComponent(IOT_GET_BEACONS_KEY)}`;
      tasks.push(
        fetch(allBeaconUrl)
          .then(async (response) => {
            console.log(`[IOT] getBeacons → ${response.status}`);
            if (!response.ok) return [];
            const payload = await response.json().catch(() => null);
            console.log(`[IOT] getBeacons payload keys:`, payload ? Object.keys(payload) : "null");
            const beaconRows = Array.isArray((payload as any)?.beacons) ? (payload as any).beacons : null;
            const rows = extractArrayPayload(beaconRows ? { devices: beaconRows } : payload);
            return rows.map((item, index) => toIotDeviceRecord(item, "BEACON", index));
          })
          .catch((e) => { console.error(`[IOT] getBeacons error: ${e.message}`); return []; })
      );
    }
  }

  if (!tasks.length) return [];
  const results = await Promise.all(tasks);
  const merged = results.flat();

  // Deduplicate by composite key
  const deduped = new Map<string, DeviceRecord>();
  for (const item of merged) {
    const key = `${item.device_type}:${item.device_id || ""}:${item.imei_number || ""}:${item.serial_number || ""}`;
    deduped.set(key, item);
  }

  return Array.from(deduped.values());
}

/**
 * Fetch current IoT assignments from the platform
 */
async function fetchIotAssignments(): Promise<any[]> {
  if (!IOT_GET_ASSIGNMENTS_KEY) return [];
  try {
    const url = `${IOT_BASE_URL}/getAssignments?code=${encodeURIComponent(IOT_GET_ASSIGNMENTS_KEY)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const payload = await response.json().catch(() => null);
    return extractArrayPayload(payload);
  } catch (e: any) {
    console.error(`[IOT] getAssignments error: ${e.message}`);
    return [];
  }
}

/**
 * Call an IoT write endpoint (POST with JSON body, code= auth)
 */
async function callIotPost(endpoint: string, key: string, body: Record<string, unknown>): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (!key) return { ok: false, error: "No API key configured for this endpoint" };
  try {
    const url = `${IOT_BASE_URL}/${endpoint}?code=${encodeURIComponent(key)}`;
    console.log(`[IOT] POST ${endpoint}`, JSON.stringify(body));
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    console.log(`[IOT] POST ${endpoint} → ${response.status}: ${text.substring(0, 300)}`);
    if (!response.ok) return { ok: false, error: `IoT API returned ${response.status}: ${text.substring(0, 200)}` };
    const data = text ? JSON.parse(text) : {};
    return { ok: true, data };
  } catch (e: any) {
    console.error(`[IOT] POST ${endpoint} error: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

/** Assign a GPS device to a vehicle via IoT platform */
async function iotAssignGpsToVehicle(gpsId: string, vehicleId: string) {
  return callIotPost("assignGPSToVehicle", IOT_ASSIGN_GPS_TO_VEHICLE_KEY, { gpsId, vehicleId });
}

/** Assign a Beacon to a driver via IoT platform */
async function iotAssignBeaconToDriver(beaconId: string, driverId: string) {
  return callIotPost("assignBeaconToDriver", IOT_ASSIGN_BEACON_TO_DRIVER_KEY, { beaconId, driverId });
}

/** Unassign a device via IoT platform */
async function iotUnassignDevice(deviceId: string) {
  return callIotPost("unassignDevice", IOT_UNASSIGN_DEVICE_KEY, { deviceId });
}

/** Assign a beacon generically */
async function iotAssignBeacon(beaconId: string, assignedTo: string, assignedType: string) {
  return callIotPost("assignBeacon", IOT_ASSIGN_BEACON_KEY, { beaconId, assignedTo, assignedType });
}

/** Allocate a beacon to a tenant org */
async function iotAllocateBeaconToTenant(beaconId: string, tenantId: string) {
  return callIotPost("allocateBeaconToTenant", IOT_ALLOCATE_BEACON_TO_TENANT_KEY, { beaconId, tenantId });
}

async function persistIotDevicesToDb(orgId: string, items: DeviceRecord[]): Promise<{ gpsUpserts: number; beaconUpserts: number }> {
  let gpsUpserts = 0;
  let beaconUpserts = 0;

  for (const item of items) {
    const hasIdentity = Boolean(item.device_id || item.imei_number);
    if (!hasIdentity) continue;

    if (item.device_type === "GPS") {
      if (item.device_id) {
        await pool.query(
          `INSERT INTO ${GPS_DEVICE_TABLE} (
             sequnce_number, serial_number, device_id, manufacture_date, imei_number, status, org_id
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (device_id)
           DO UPDATE SET
             sequnce_number = EXCLUDED.sequnce_number,
             serial_number = EXCLUDED.serial_number,
             manufacture_date = EXCLUDED.manufacture_date,
             imei_number = EXCLUDED.imei_number,
             status = EXCLUDED.status,
             org_id = EXCLUDED.org_id`,
          [
            item.sequnce_number,
            item.serial_number,
            item.device_id,
            item.manufacture_date,
            item.imei_number,
            item.status || "available",
            orgId,
          ],
        );
        gpsUpserts += 1;
      } else if (item.imei_number) {
        await pool.query(
          `INSERT INTO ${GPS_DEVICE_TABLE} (
             sequnce_number, serial_number, device_id, manufacture_date, imei_number, status, org_id
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (imei_number)
           DO UPDATE SET
             sequnce_number = EXCLUDED.sequnce_number,
             serial_number = EXCLUDED.serial_number,
             manufacture_date = EXCLUDED.manufacture_date,
             status = EXCLUDED.status,
             org_id = EXCLUDED.org_id`,
          [
            item.sequnce_number,
            item.serial_number,
            null,
            item.manufacture_date,
            item.imei_number,
            item.status || "available",
            orgId,
          ],
        );
        gpsUpserts += 1;
      }
    }

    if (item.device_type === "BEACON") {
      if (item.device_id) {
        await pool.query(
          `INSERT INTO ${BEACON_DEVICE_TABLE} (
             sequnce_number, serial_number, device_id, manufacture_date, imei_number, status
           ) VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (device_id)
           DO UPDATE SET
             sequnce_number = EXCLUDED.sequnce_number,
             serial_number = EXCLUDED.serial_number,
             manufacture_date = EXCLUDED.manufacture_date,
             imei_number = EXCLUDED.imei_number,
             status = EXCLUDED.status`,
          [
            item.sequnce_number,
            item.serial_number,
            item.device_id,
            item.manufacture_date,
            item.imei_number,
            item.status || "available",
          ],
        );
        beaconUpserts += 1;
      } else if (item.imei_number) {
        await pool.query(
          `INSERT INTO ${BEACON_DEVICE_TABLE} (
             sequnce_number, serial_number, device_id, manufacture_date, imei_number, status
           ) VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (imei_number)
           DO UPDATE SET
             sequnce_number = EXCLUDED.sequnce_number,
             serial_number = EXCLUDED.serial_number,
             manufacture_date = EXCLUDED.manufacture_date,
             status = EXCLUDED.status`,
          [
            item.sequnce_number,
            item.serial_number,
            null,
            item.manufacture_date,
            item.imei_number,
            item.status || "available",
          ],
        );
        beaconUpserts += 1;
      }
    }
  }

  return { gpsUpserts, beaconUpserts };
}

function matchesDeviceFilters(item: DeviceRecord, search: string, statusFilter: string): boolean {
  if (statusFilter && (item.status || "").toLowerCase() !== statusFilter) return false;

  if (!search) return true;
  const haystack = [item.device_id, item.serial_number, item.imei_number, item.sequnce_number, item.device_type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
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
app.post("/api/tenant-login", async (req: Request, res: Response) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  try {
    const source = await resolveUserAuthSource();
    if (!source) {
      console.error(`[AUTH] No user table found for ${email}`);
      res.status(500).json({ success: false, message: "Users table is not configured correctly. Checked: " + USER_TABLE_CANDIDATES.join(", ") });
      return;
    }
    console.log(`[AUTH] Found user table: ${source.table}`);

    const passwordColumn = getPasswordColumn(source.columns);
    if (!passwordColumn) {
      res.status(500).json({ success: false, message: "Users table missing password column" });
      return;
    }

    const selectedColumns = [
      "id",
      "name",
      "full_name",
      "display_name",
      "user_name",
      "first_name",
      "last_name",
      "email",
      "role",
      "user_role",
      "org_id",
      "tenant_id",
      "status",
      passwordColumn,
    ].filter((col, index, arr) => arr.indexOf(col) === index && source.columns.has(col));

    const userResult = await pool.query(
      `SELECT ${selectedColumns.map((col) => quoteIdent(col)).join(", ")} FROM ${source.table} WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const userRow = userResult.rows[0] as Record<string, unknown>;
    const storedPassword = String(userRow[passwordColumn] || "");
    const passwordValid = await verifyPassword(password, storedPassword);

    if (!passwordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (source.columns.has("status")) {
      const status = String(userRow.status || "").toLowerCase();
      if (status && ["inactive", "disabled", "blocked", "suspended"].includes(status)) {
        res.status(403).json({ success: false, message: "User account is inactive" });
        return;
      }
    }

    const orgId = String(userRow.org_id || userRow.tenant_id || "").trim();
    if (!orgId) {
      console.error(`[AUTH] User ${email} has no org_id or tenant_id. User record:`, { org_id: userRow.org_id, tenant_id: userRow.tenant_id });
      res.status(403).json({ success: false, message: "User is not mapped to any organization. Available columns: " + Object.keys(userRow).join(", ") });
      return;
    }
    console.log(`[AUTH] Login successful for ${email} with org_id=${orgId}`);
    const userId = String(userRow.id || email);
    const role = String(userRow.role || userRow.user_role || "admin");
    const name = resolveUserName(userRow, email);

    const token = jwt.sign(
      {
        id: userId,
        email,
        role,
        org_id: orgId,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          role,
          org_id: orgId,
        },
      },
    });
  } catch (error) {
    console.error("[AUTH] tenant-login failed", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.get("/api/refreshMe", (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = auth.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      email?: string;
      role?: string;
      org_id?: string;
    };

    const email = decoded.email || "";
    const role = decoded.role || "admin";
    const orgId = decoded.org_id || "";
    if (!orgId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.json({
      id: decoded.id || email,
      name: email.split("@")[0] || "User",
      email,
      roles: [role],
      tenant_id: orgId,
      permissions: ["manage_fleet", "view_reports"],
    });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.get("/api/organization/me", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  let email = "";
  let userId = "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string; id?: string };
    email = String(decoded.email || "");
    userId = String(decoded.id || "");
  } catch {
    // Ignore and use empty fallback values
  }

  try {
    const userSource = await resolveUserAuthSource();
    let userRow: Record<string, unknown> | null = null;
    if (userSource && (email || userId)) {
      const whereClauses: string[] = [];
      const params: unknown[] = [];

      if (email && userSource.columns.has("email")) {
        params.push(email);
        whereClauses.push(`LOWER(email) = LOWER($${params.length})`);
      }
      if (userId && userSource.columns.has("id")) {
        params.push(userId);
        whereClauses.push(`id = $${params.length}`);
      }

      if (whereClauses.length) {
        const selectedColumns = [
          "id",
          "email",
          "name",
          "full_name",
          "display_name",
          "organization_name",
          "organisation_name",
        ].filter((col, index, arr) => arr.indexOf(col) === index && userSource.columns.has(col));

        const selected = selectedColumns.length ? selectedColumns.map((col) => quoteIdent(col)).join(", ") : "*";
        const userResult = await pool.query(
          `SELECT ${selected} FROM ${userSource.table} WHERE ${whereClauses.join(" OR ")} LIMIT 1`,
          params,
        );
        userRow = (userResult.rows[0] as Record<string, unknown>) || null;
      }
    }

    const orgSource = await resolveOrganizationSource();
    let orgRow: Record<string, unknown> | null = null;
    if (orgSource) {
      const scope = buildOrganizationScope(orgSource.columns, orgId);
      if (scope) {
        const orgResult = await pool.query(
          `SELECT * FROM ${orgSource.table} WHERE ${scope.clause} LIMIT 1`,
          scope.params,
        );
        orgRow = (orgResult.rows[0] as Record<string, unknown>) || null;
      }
    }

    const data = mapOrganizationResponse(orgId, orgRow, userRow, email);
    res.json({ success: true, data });
  } catch (e: any) {
    console.error("[ORG] Failed to fetch organization settings", e);
    res.status(500).json({ success: false, message: e?.message || "Failed to fetch organization settings" });
  }
});

app.put("/api/organization/me", upload.any(), async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const filesByField = files.reduce<Record<string, Express.Multer.File>>((acc, file) => {
      if (file.fieldname) acc[file.fieldname] = file;
      return acc;
    }, {});

    const orgSource = await resolveOrganizationSource();
    if (orgSource) {
      const scope = buildOrganizationScope(orgSource.columns, orgId);
      if (!scope) {
        res.status(500).json({ success: false, message: "Organization table is missing org scope columns" });
        return;
      }

      const payload = toOrganizationUpdatePayload(req.body as Record<string, unknown>, orgSource.columns, filesByField, orgId);
      if (!Object.keys(payload).length) {
        res.status(400).json({ success: false, message: "No valid organization fields to update" });
        return;
      }

      const updateKeys = Object.keys(payload);
      const setClause = updateKeys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
      const params = [...updateKeys.map((key) => payload[key]), ...scope.params];

      const updateResult = await pool.query(
        `UPDATE ${orgSource.table} SET ${setClause} WHERE ${scope.clause.replace(/\$1/g, `$${updateKeys.length + 1}`)} RETURNING *`,
        params,
      );

      let finalRow = updateResult.rows[0] as Record<string, unknown> | undefined;
      if (!finalRow && (scope.key === "org_id" || scope.key === "tenant_id")) {
        const insertPayload: Record<string, unknown> = { ...payload, [scope.key]: orgId };
        if (orgSource.columns.has("created_at")) {
          insertPayload.created_at = new Date().toISOString();
        }

        const insertKeys = Object.keys(insertPayload).filter((key) => orgSource.columns.has(key));
        const insertValues = insertKeys.map((key) => insertPayload[key]);
        const placeholders = insertKeys.map((_, idx) => `$${idx + 1}`).join(", ");

        const insertResult = await pool.query(
          `INSERT INTO ${orgSource.table} (${insertKeys.join(", ")}) VALUES (${placeholders}) RETURNING *`,
          insertValues,
        );
        finalRow = insertResult.rows[0] as Record<string, unknown> | undefined;
      }

      const data = mapOrganizationResponse(orgId, finalRow || null, null, String(req.body?.email || ""));
      res.json({ success: true, data, message: "Organization settings updated successfully" });
      return;
    }

    const userSource = await resolveUserAuthSource();
    if (!userSource || (!userSource.columns.has("org_id") && !userSource.columns.has("tenant_id"))) {
      res.status(500).json({ success: false, message: "No organization table found and users table does not support org updates" });
      return;
    }

    const payload = toOrganizationUpdatePayload(req.body as Record<string, unknown>, userSource.columns, filesByField, orgId);
    if (!Object.keys(payload).length) {
      res.status(400).json({ success: false, message: "No valid organization fields to update" });
      return;
    }

    const userOrgColumn = userSource.columns.has("org_id") ? "org_id" : "tenant_id";
    const updateKeys = Object.keys(payload);
    const setClause = updateKeys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const params = [...updateKeys.map((key) => payload[key]), orgId];
    await pool.query(
      `UPDATE ${userSource.table} SET ${setClause} WHERE ${userOrgColumn} = $${updateKeys.length + 1}`,
      params,
    );

    res.json({ success: true, message: "Organization settings updated successfully" });
  } catch (e: any) {
    console.error("[ORG] Failed to update organization settings", e);
    res.status(500).json({ success: false, message: e?.message || "Failed to update organization settings" });
  }
});

// Debug endpoint - shows tenant isolation status
app.get("/api/debug/tenant", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const tables = [EMPLOYEE_TABLE, VEHICLE_TABLE, DRIVER_TABLE, ROLE_TABLE, PERMISSION_TABLE];
    const tableStatus: Record<string, any> = {};

    for (const table of tables) {
      try {
        const cols = await getTableColumns(table);
        const hasOrgId = cols.has("org_id");
        
        let rowCount = 0;
        let orgRowCount = 0;
        try {
          const allRows = await pool.query(`SELECT COUNT(*) as cnt FROM ${table}`);
          rowCount = allRows.rows[0]?.cnt || 0;
          
          if (hasOrgId) {
            const scopedRows = await pool.query(`SELECT COUNT(*) as cnt FROM ${table} WHERE org_id = $1`, [orgId]);
            orgRowCount = scopedRows.rows[0]?.cnt || 0;
          }
        } catch {
          rowCount = -1;
          orgRowCount = -1;
        }

        tableStatus[table] = {
          hasOrgIdColumn: hasOrgId,
          totalRows: rowCount,
          orgRows: hasOrgId ? orgRowCount : "N/A",
          columns: Array.from(cols).slice(0, 10), // First 10 columns
        };
      } catch (e: any) {
        tableStatus[table] = { error: e?.message || "Failed to check" };
      }
    }

    res.json({
      success: true,
      currentOrgId: orgId,
      tableStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message });
  }
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
    const columns = await getTableColumns(EMPLOYEE_TABLE);
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for employees table" });
      return;
    }

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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for employees table" });
      return;
    }

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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for employees table" });
      return;
    }

    const scoped = await pool.query(`SELECT * FROM ${EMPLOYEE_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`, [orgId, id]);
    const row = scoped.rows[0];

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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for employees table" });
      return;
    }

    const payload = toEmployeePayload(req.body as Record<string, unknown>, columns);
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const updateKeys = Object.keys(payload);
    if (!updateKeys.length) {
      res.json({ success: true, message: "No fields to update" });
      return;
    }

    const setClause = updateKeys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const whereClause = `WHERE id = $${updateKeys.length + 1} AND org_id = $${updateKeys.length + 2}`;
    const params = [...updateKeys.map(k => payload[k]), id, orgId];

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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for employees table" });
      return;
    }

    const whereClause = `WHERE id = $1 AND org_id = $2`;
    const params = [id, orgId];
    
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
    const columns = await getTableColumns(VEHICLE_TABLE);
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for vehicles table" });
      return;
    }

    const rows = await fetchRowsWithOrgFallback(VEHICLE_TABLE, orgId);
    const total = rows.length;
    const paged = rows.slice(offset, offset + perPage).map((row: any) => normalizeVehicleRow(row));
    res.json(paginatedPayload(paged, page, perPage, total));
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to fetch vehicles" });
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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for vehicles table" });
      return;
    }

    const scoped = await pool.query(`SELECT * FROM ${VEHICLE_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`, [orgId, id]);
    if (!scoped.rows.length) {
      res.status(404).json({ success: false, message: "Vehicle not found" });
      return;
    }

    res.json({ success: true, data: normalizeVehicleRow(scoped.rows[0]) });
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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for vehicles table" });
      return;
    }

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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for vehicles table" });
      return;
    }

    const payload = toVehiclePayload(req.body as Record<string, unknown>, columns);
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const updates = Object.keys(payload);
    if (!updates.length) {
      res.status(400).json({ success: false, message: "No fields provided for update" });
      return;
    }

    const setClause = updates.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = updates.map((key) => payload[key]);

    const whereClause = `id = $${values.length + 1} AND org_id = $${values.length + 2}`;

    const params = [...values, id, orgId];

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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for vehicles table" });
      return;
    }

    const result = await pool.query(`DELETE FROM ${VEHICLE_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, id]);
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
    const columns = await getTableColumns(DRIVER_TABLE);
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for drivers table" });
      return;
    }

    const rows = await fetchRowsWithOrgFallback(DRIVER_TABLE, orgId);
    const total = rows.length;
    const paged = rows.slice(offset, offset + perPage).map(r => normalizeDriverRow(r));
    res.json(paginatedPayload(paged, page, perPage, total));
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to fetch drivers" });
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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for drivers table" });
      return;
    }

    const scoped = await pool.query(`SELECT * FROM ${DRIVER_TABLE} WHERE org_id = $1 AND id = $2 LIMIT 1`, [orgId, id]);
    if (!scoped.rows.length) {
      res.status(404).json({ success: false, message: "Driver not found" });
      return;
    }

    res.json({ success: true, data: normalizeDriverRow(scoped.rows[0]) });
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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for drivers table" });
      return;
    }

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

app.put("/api/drivers/:id", upload.any(), async (req: Request, res: Response) => {
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
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for drivers table" });
      return;
    }

    const payload = toDriverPayload(req.body as Record<string, unknown>, columns);
    if (columns.has("updated_at")) payload.updated_at = new Date().toISOString();

    const updates = Object.keys(payload);
    if (!updates.length) {
      res.status(400).json({ success: false, message: "No fields provided for update" });
      return;
    }

    const setClause = updates.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = updates.map((key) => payload[key]);

    const whereClause = `id = $${values.length + 1} AND org_id = $${values.length + 2}`;

    const params = [...values, id, orgId];

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

app.get("/api/devices", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { page, perPage, offset } = getPagination(req);
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const typeFilter = String(req.query.device_type ?? "").trim().toLowerCase();
  const statusFilter = String(req.query.status ?? "").trim().toLowerCase();

  const includeGps = !typeFilter || typeFilter === "gps";
  const includeBeacon = !typeFilter || typeFilter === "beacon";
  const items: DeviceRecord[] = [];

  try {
    if (includeGps) {
      const gpsColumns = await getTableColumns(GPS_DEVICE_TABLE);
      // Always push orgId as $1 for the LEFT JOIN
      const gpsParams: Array<string | number> = [orgId];
      const gpsWhere: string[] = [];

      if (gpsColumns.has("org_id")) {
        gpsWhere.push(`a.org_id = $1`);
      }

      if (search) {
        const term = `%${escapeLike(search)}%`;
        gpsParams.push(term);
        const marker = `$${gpsParams.length}`;
        gpsWhere.push(`(
          LOWER(COALESCE(a.device_id, '')) LIKE ${marker} ESCAPE '\\'
          OR LOWER(COALESCE(a.serial_number, '')) LIKE ${marker} ESCAPE '\\'
          OR LOWER(COALESCE(a.imei_number, '')) LIKE ${marker} ESCAPE '\\'
          OR LOWER(COALESCE(a.sequnce_number, '')) LIKE ${marker} ESCAPE '\\'
        )`);
      }

      if (statusFilter) {
        gpsParams.push(statusFilter);
        gpsWhere.push(`LOWER(COALESCE(a.status, '')) = $${gpsParams.length}`);
      }

      const gpsQuery = `
        SELECT
          a.id,
          a.sequnce_number,
          a.device_id,
          a.serial_number,
          a.imei_number,
          a.manufacture_date,
          a.status,
          v.vehicle_number as assigned_to
        FROM ${GPS_DEVICE_TABLE} a
        LEFT JOIN ${VEHICLE_TABLE} v ON (a.device_id = v.gps_device OR a.imei_number = v.gps_device) AND v.org_id = $1
        ${gpsWhere.length ? `WHERE ${gpsWhere.join(" AND ")}` : ""}
        ORDER BY a.id DESC
      `;

      const gpsRows = await pool.query(gpsQuery, gpsParams);
      for (const row of gpsRows.rows as Array<Record<string, unknown>>) {
        items.push({
          id: `gps-${String(row.id)}`,
          source_id: Number(row.id),
          device_type: "GPS",
          sequnce_number: row.sequnce_number ? String(row.sequnce_number) : null,
          device_id: row.device_id ? String(row.device_id) : null,
          serial_number: row.serial_number ? String(row.serial_number) : null,
          imei_number: row.imei_number ? String(row.imei_number) : null,
          manufacture_date: row.manufacture_date ? String(row.manufacture_date) : null,
          status: row.status ? String(row.status) : null,
          assigned_to: row.assigned_to ? String(row.assigned_to) : null,
        });
      }
    }

    if (includeBeacon) {
      const beaconColumns = await getTableColumns(BEACON_DEVICE_TABLE);
      // Always push orgId as $1 for the LEFT JOIN
      const beaconParams: Array<string | number> = [orgId];
      const beaconWhere: string[] = [];

      if (beaconColumns.has("org_id")) {
        beaconWhere.push(`a.org_id = $1`);
      }

      if (search) {
        const term = `%${escapeLike(search)}%`;
        beaconParams.push(term);
        const marker = `$${beaconParams.length}`;
        beaconWhere.push(`(
          LOWER(COALESCE(a.device_id, '')) LIKE ${marker} ESCAPE '\\'
          OR LOWER(COALESCE(a.serial_number, '')) LIKE ${marker} ESCAPE '\\'
          OR LOWER(COALESCE(a.imei_number, '')) LIKE ${marker} ESCAPE '\\'
          OR LOWER(COALESCE(a.sequnce_number, '')) LIKE ${marker} ESCAPE '\\'
        )`);
      }

      if (statusFilter) {
        beaconParams.push(statusFilter);
        beaconWhere.push(`LOWER(COALESCE(a.status, '')) = $${beaconParams.length}`);
      }

      const beaconQuery = `
        SELECT
          a.id,
          a.sequnce_number,
          a.device_id,
          a.serial_number,
          a.imei_number,
          a.manufacture_date,
          a.status,
          d.first_name || ' ' || d.last_name as assigned_to
        FROM ${BEACON_DEVICE_TABLE} a
        LEFT JOIN ${DRIVER_TABLE} d ON (a.device_id = d.beacon_id OR a.imei_number = d.beacon_id) AND d.org_id = $1
        ${beaconWhere.length ? `WHERE ${beaconWhere.join(" AND ")}` : ""}
        ORDER BY a.id DESC
      `;

      const beaconRows = await pool.query(beaconQuery, beaconParams);
      for (const row of beaconRows.rows as Array<Record<string, unknown>>) {
        items.push({
          id: `beacon-${String(row.id)}`,
          source_id: Number(row.id),
          device_type: "BEACON",
          sequnce_number: row.sequnce_number ? String(row.sequnce_number) : null,
          device_id: row.device_id ? String(row.device_id) : null,
          serial_number: row.serial_number ? String(row.serial_number) : null,
          imei_number: row.imei_number ? String(row.imei_number) : null,
          manufacture_date: row.manufacture_date ? String(row.manufacture_date) : null,
          status: row.status ? String(row.status) : null,
          assigned_to: row.assigned_to ? String(row.assigned_to) : null,
        });
      }
    }

    if (!items.length) {
      const iotItems = await fetchIotAvailableDevices(orgId, includeGps, includeBeacon);
      if (iotItems.length) {
        await persistIotDevicesToDb(orgId, iotItems);
      }
      const filteredIotItems = iotItems.filter((item) => matchesDeviceFilters(item, search, statusFilter));
      items.push(...filteredIotItems);
    }

    items.sort((a, b) => b.source_id - a.source_id);

    const total = items.length;
    const paged = items.slice(offset, offset + perPage);
    res.json(paginatedPayload(paged, page, perPage, total));
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to fetch devices" });
  }
});

app.post("/api/devices/sync-iot", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const typeFilter = String(req.query.device_type ?? "").trim().toLowerCase();
  const includeGps = !typeFilter || typeFilter === "gps";
  const includeBeacon = !typeFilter || typeFilter === "beacon";

  try {
    const iotItems = await fetchIotAvailableDevices(orgId, includeGps, includeBeacon);
    const stats = await persistIotDevicesToDb(orgId, iotItems);

    res.json({
      success: true,
      message: "IoT device sync completed",
      data: {
        fetched: iotItems.length,
        gpsUpserts: stats.gpsUpserts,
        beaconUpserts: stats.beaconUpserts,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to sync IoT devices" });
  }
});

// ═══════════════════════════════════════════════════
// IoT Assignment & Live Vehicle Endpoints
// ═══════════════════════════════════════════════════

/** GET /api/iot/vehicles/live — Proxy to IoT GetVehiclesLive */
app.get("/api/iot/vehicles/live", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const url = `${IOT_BASE_URL}/vehicles/all/live`;
    console.log(`[IOT] GET vehicles/all/live`);
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(response.status).json({ success: false, message: `IoT API error: ${errText.substring(0, 200)}` });
      return;
    }
    const data = await response.json();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** GET /api/iot/assignments — Fetch IoT device assignments */
app.get("/api/iot/assignments", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const assignments = await fetchIotAssignments();
    res.json({ success: true, data: assignments });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** POST /api/iot/assign-gps — Assign GPS device to a vehicle */
app.post("/api/iot/assign-gps", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) { res.status(401).json({ message: "Unauthorized" }); return; }

  const { gpsId, vehicleId } = req.body;
  if (!gpsId || !vehicleId) {
    res.status(400).json({ success: false, message: "gpsId and vehicleId are required" });
    return;
  }

  try {
    const result = await iotAssignGpsToVehicle(gpsId, vehicleId);
    if (!result.ok) {
      res.status(400).json({ success: false, message: result.error || "Failed to assign GPS" });
      return;
    }

    // Also update local DB: set gps_device on the vehicle
    try {
      await pool.query(
        `UPDATE ${VEHICLE_TABLE} SET gps_device = $1 WHERE vehicle_number = $2 AND org_id = $3`,
        [gpsId, vehicleId, orgId],
      );
    } catch (dbErr: any) {
      console.error(`[IOT] Local DB update for GPS assign failed: ${dbErr.message}`);
    }

    res.json({ success: true, message: "GPS device assigned to vehicle", data: result.data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** POST /api/iot/assign-beacon — Assign beacon to a driver */
app.post("/api/iot/assign-beacon", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) { res.status(401).json({ message: "Unauthorized" }); return; }

  const { beaconId, driverId } = req.body;
  if (!beaconId || !driverId) {
    res.status(400).json({ success: false, message: "beaconId and driverId are required" });
    return;
  }

  try {
    const result = await iotAssignBeaconToDriver(beaconId, driverId);
    if (!result.ok) {
      res.status(400).json({ success: false, message: result.error || "Failed to assign beacon" });
      return;
    }

    // Also update local DB: set beacon_id on the driver
    try {
      await pool.query(
        `UPDATE ${DRIVER_TABLE} SET beacon_id = $1 WHERE id = $2 AND org_id = $3`,
        [beaconId, Number(driverId), orgId],
      );
    } catch (dbErr: any) {
      console.error(`[IOT] Local DB update for beacon assign failed: ${dbErr.message}`);
    }

    res.json({ success: true, message: "Beacon assigned to driver", data: result.data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** POST /api/iot/unassign-device — Remove device assignment */
app.post("/api/iot/unassign-device", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) { res.status(401).json({ message: "Unauthorized" }); return; }

  const { deviceId } = req.body;
  if (!deviceId) {
    res.status(400).json({ success: false, message: "deviceId is required" });
    return;
  }

  try {
    const result = await iotUnassignDevice(deviceId);
    if (!result.ok) {
      res.status(400).json({ success: false, message: result.error || "Failed to unassign device" });
      return;
    }

    // Clear local references
    try {
      await pool.query(`UPDATE ${VEHICLE_TABLE} SET gps_device = NULL WHERE gps_device = $1 AND org_id = $2`, [deviceId, orgId]);
      await pool.query(`UPDATE ${DRIVER_TABLE} SET beacon_id = NULL WHERE beacon_id = $1 AND org_id = $2`, [deviceId, orgId]);
    } catch (dbErr: any) {
      console.error(`[IOT] Local DB cleanup for unassign failed: ${dbErr.message}`);
    }

    res.json({ success: true, message: "Device unassigned successfully", data: result.data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** POST /api/iot/allocate-beacon-to-tenant — Allocate a beacon to the organization */
app.post("/api/iot/allocate-beacon-to-tenant", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) { res.status(401).json({ message: "Unauthorized" }); return; }

  const { beaconId } = req.body;
  if (!beaconId) {
    res.status(400).json({ success: false, message: "beaconId is required" });
    return;
  }

  try {
    const result = await iotAllocateBeaconToTenant(beaconId, orgId);
    if (!result.ok) {
      res.status(400).json({ success: false, message: result.error || "Failed to allocate beacon" });
      return;
    }
    res.json({ success: true, message: "Beacon allocated to tenant", data: result.data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/gps-device/for/dropdown", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, device_id, serial_number, imei_number 
       FROM ${GPS_DEVICE_TABLE} 
       WHERE org_id = $1 AND (status IS NULL OR LOWER(status) = 'available')
       ORDER BY id DESC`,
      [orgId],
    );
    res.json(
      result.rows.map((row: any) => ({
        id: row.id,
        label: row.device_id || row.imei_number || row.serial_number || `GPS-${row.id}`,
      })),
    );
  } catch (e: any) {
    console.error(`[TENANT] GPS dropdown fetch failed: ${e.message}`);
    res.json([]);
  }
});

app.get("/api/beacon-device/for/dropdown", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, device_id, serial_number, imei_number 
       FROM ${BEACON_DEVICE_TABLE} 
       WHERE (status IS NULL OR LOWER(status) = 'available')
       ORDER BY id DESC`,
    );
    // Beacons might not have org_id yet in the sync logic so we fetch all available for now
    // or filter if column exists
    res.json(
      result.rows.map((row: any) => ({
        id: row.id,
        label: row.device_id || row.serial_number || `BCN-${row.id}`,
      })),
    );
  } catch (e: any) {
    console.error(`[TENANT] Beacon dropdown fetch failed: ${e.message}`);
    res.json([]);
  }
});

app.get("/api/active-vehicles/for/dropdown", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const columns = await getTableColumns(VEHICLE_TABLE);
    if (!columns.has("org_id")) {
      res.status(500).json({ success: false, message: "Tenant isolation not configured for vehicles table" });
      return;
    }

    const rows = await fetchRowsWithOrgFallback(VEHICLE_TABLE, orgId);
    console.log(`[TENANT] Fetching active vehicles dropdown for org_id: ${orgId}`);
    const active = rows
      .filter((row: any) => String(row.status || "active").toLowerCase() === "active")
      .map((row: any) => ({
        id: row.id,
        vehicle_number: row.vehicle_number,
        vehicle_name: row.vehicle_name || row.vehicle_number,
      }));
    res.json(active);
  } catch (e: any) {
    console.error(`[TENANT] Dropdown fetch failed: ${e.message}`);
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
      `SELECT r.id, r.org_id, r.name, r.description, r.created_at, r.updated_at,
       (SELECT COUNT(*) FROM ${ROLE_PERMISSION_MAP_TABLE} rpm WHERE rpm.role_id = r.id) as permissions_count
       FROM ${ROLE_TABLE} r 
       WHERE r.org_id = $1 
       ORDER BY r.id DESC`,
      [orgId]
    );
    res.json({ success: true, data: result.rows });
  } catch (e: any) {
    console.error("[ROLES] Fetch failed:", e);
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("[ROLES] Creating role for org:", orgId, "Body:", req.body);
    
    const result = await client.query(
      `INSERT INTO ${ROLE_TABLE} (org_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [orgId, name, description]
    );
    const newRole = result.rows[0];

    // Handle Permissions
    const permissionIds = Array.isArray(req.body?.permissions) ? req.body.permissions : [];
    if (permissionIds.length > 0) {
      for (const pId of permissionIds) {
        await client.query(
          `INSERT INTO ${ROLE_PERMISSION_MAP_TABLE} (role_id, permission_id, org_id) VALUES ($1, $2, $3)`,
          [newRole.id, pId, orgId]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true, data: newRole, message: "Role created successfully" });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("[ROLES] Create role failed:", e);
    if (e?.code === "23505") {
      res.status(409).json({ success: false, message: "Role already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Failed to create role: " + e.message });
  } finally {
    client.release();
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
      await pool.query(`DELETE FROM ${ROLE_PERMISSION_MAP_TABLE} WHERE role_id = $1 AND org_id = $2`, [roleId, orgId]);
      for (const pId of permissionIds) {
        await pool.query(
          `INSERT INTO ${ROLE_PERMISSION_MAP_TABLE} (role_id, permission_id, org_id) VALUES ($1, $2, $3)`,
          [roleId, pId, orgId]
        ).catch(e => console.error("Failed to sync permission", e));
      }
    }

    res.json({ success: true, data: result.rows[0], message: "Role updated successfully" });
  } catch (e: any) {
    console.error("[ROLES] Update role failed:", e);
    res.status(500).json({ success: false, message: "Failed to update role: " + e.message });
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
    // 1. Delete Mappings
    await pool.query(`DELETE FROM ${ROLE_PERMISSION_MAP_TABLE} WHERE org_id = $1 AND role_id = $2`, [orgId, roleId]);
    // 2. Delete Role
    const result = await pool.query(`DELETE FROM ${ROLE_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, roleId]);
    if (!result.rowCount) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (e: any) {
    console.error(`[TENANT] Role deletion failed: ${e.message}`);
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
    // Definining standard permissions
    const modules = [
      "dashboard", "roles", "staff", "employees", "vehicles", 
      "drivers", "travellers", "bookings", "vendors", 
      "feedbacks", "reports", "settings", "compliance"
    ];
    const actions = ["view", "create", "edit", "delete"];
    const defaults: string[] = [];
    modules.forEach(mod => actions.forEach(act => defaults.push(`${mod}-${act}`)));
    defaults.push("compliance-analyze", "reports-export");

    // Check current count
    const countRes = await pool.query(`SELECT COUNT(*) as cnt FROM ${PERMISSION_TABLE} WHERE org_id = $1`, [orgId]);
    const currentCount = parseInt(countRes.rows[0].cnt || "0");

    // If missing many permissions, re-seed (idempotent)
    if (currentCount < (defaults.length / 2)) {
      console.log(`[SEED] Ensuring permissions for org: ${orgId}`);
      for (const name of defaults) {
        await pool.query(
          `INSERT INTO ${PERMISSION_TABLE} (org_id, name) VALUES ($1, $2) ON CONFLICT (org_id, name) DO NOTHING`,
          [orgId, name]
        );
      }
    }

    const result = await pool.query(`SELECT id, org_id, name FROM ${PERMISSION_TABLE} WHERE org_id = $1 ORDER BY name ASC`, [orgId]);
    res.json({ success: true, data: result.rows });
  } catch (e: any) {
    console.error(`[TENANT] Failed to fetch/seed permissions:`, e.message);
    res.status(500).json({ success: false, message: "Failed to fetch permissions" });
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
    const result = await pool.query(`INSERT INTO ${PERMISSION_TABLE} (org_id, name) VALUES ($1, $2) RETURNING id, org_id, name`, [orgId, name]);
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
    // 1. Delete Mappings
    await pool.query(`DELETE FROM ${ROLE_PERMISSION_MAP_TABLE} WHERE org_id = $1 AND permission_id = $2`, [orgId, permissionId]);
    // 2. Delete Permission
    const result = await pool.query(`DELETE FROM ${PERMISSION_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, permissionId]);
    if (!result.rowCount) {
      res.status(404).json({ success: false, message: "Permission not found" });
      return;
    }
    res.json({ success: true, message: "Permission deleted successfully" });
  } catch (e: any) {
    console.error(`[TENANT] Permission deletion failed: ${e.message}`);
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

app.get("/api/stats/summary", async (req: Request, res: Response) => {
  const orgId = getOrgIdFromRequest(req);
  if (!orgId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const [vRes, eRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM ${VEHICLE_TABLE} WHERE org_id = $1`, [orgId]),
      pool.query(`SELECT COUNT(*) as total FROM ${EMPLOYEE_TABLE} WHERE org_id = $1`, [orgId]),
    ]);

    res.json({
      success: true,
      data: {
        totalVehicles: parseInt(vRes.rows[0]?.total || "0"),
        activeVehicles: parseInt(vRes.rows[0]?.active || "0"),
        totalStaff: parseInt(eRes.rows[0]?.total || "0"),
        activeTrips: 0, // trip module not yet implemented with org_id
      },
    });
  } catch (e: any) {
    console.error(`[TENANT] Stats summary failed: ${e.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

async function ensureTables() {
  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS schemaa`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schemaa."officePermissions" (
        id SERIAL PRIMARY KEY,
        org_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);
    // Ensure unique constraint exists for (org_id, name)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS office_permissions_org_id_name_uidx 
      ON schemaa."officePermissions" (org_id, name)
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schemaa."officeRoles" (
        id SERIAL PRIMARY KEY,
        org_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(org_id, name)
      )
    `);
    
    // Add columns if they don't exist (migration)
    await pool.query(`ALTER TABLE schemaa."officeRoles" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`);
    await pool.query(`ALTER TABLE schemaa."officeRoles" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS schemaa."officeRolePermissions" (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES schemaa."officeRoles"(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES schemaa."officePermissions"(id) ON DELETE CASCADE,
        org_id VARCHAR(255),
        UNIQUE(role_id, permission_id)
      )
    `);

    // Migration for join table
    await pool.query(`ALTER TABLE schemaa."officeRolePermissions" ADD COLUMN IF NOT EXISTS org_id VARCHAR(255)`);

    console.log("[STARTUP] Roles & Permissions tables ensured.");
  } catch (e: any) {
    console.error("[STARTUP] Failed to ensure tables:", e.message);
  }
}

app.listen(PORT, async () => {
  let dbStatus = "disconnected";
  try {
    const conn = await pool.connect();
    conn.release();
    dbStatus = "connected";
    await ensureTables();
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
