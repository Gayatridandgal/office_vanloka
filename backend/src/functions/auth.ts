import { app, HttpRequest, InvocationContext } from "@azure/functions";
import type { HttpResponseInit } from "@azure/functions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dummy-secret-for-now";
const DUMMY_ORG_ID = "00000000-0000-0000-0000-000000000001"; // Hardcoded org_id for dev
const USER_TABLE_CANDIDATES = [
    'schemaa."officeUsers"',
    "schemaa.users",
    "public.users",
    'public."officeUsers"',
];

let resolvedUserTable: string | null | undefined;
let resolvedUserColumns: Set<string> | null = null;

function quoteIdent(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

function parseQualifiedTableName(table: string) {
    const parts = table.split(".");
    const schema = (parts[0] || "public").replace(/"/g, "");
    const name = (parts[1] || parts[0] || "").replace(/"/g, "");
    return { schema, name };
}

async function getTableColumns(table: string): Promise<Set<string>> {
    const { schema, name } = parseQualifiedTableName(table);
    const result = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
        [schema, name]
    );
    return new Set(result.rows.map((row: any) => String(row.column_name)));
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

async function resolveUserAuthSource(): Promise<{ table: string; columns: Set<string> } | null> {
    if (resolvedUserTable !== undefined) {
        return resolvedUserTable && resolvedUserColumns
            ? { table: resolvedUserTable, columns: resolvedUserColumns }
            : null;
    }

    for (const table of USER_TABLE_CANDIDATES) {
        try {
            const columns = await getTableColumns(table);
            if (columns.has("email") && getPasswordColumn(columns)) {
                resolvedUserTable = table;
                resolvedUserColumns = columns;
                return { table, columns };
            }
        } catch {
            // continue
        }
    }

    resolvedUserTable = null;
    resolvedUserColumns = null;
    return null;
}

/**
 * Handle Dummy Login
 */
export async function login(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const body = (await request.json()) as any;
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
        return { status: 400, jsonBody: { success: false, message: "Email and password are required" } };
    }

    const source = await resolveUserAuthSource();
    if (!source) {
        return { status: 500, jsonBody: { success: false, message: "Users table is not configured correctly" } };
    }

    const passwordColumn = getPasswordColumn(source.columns);
    if (!passwordColumn) {
        return { status: 500, jsonBody: { success: false, message: "Users table missing password column" } };
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
        return { status: 401, jsonBody: { success: false, message: "Invalid credentials" } };
    }

    const userRow = userResult.rows[0] as Record<string, unknown>;
    const storedPassword = String(userRow[passwordColumn] || "");
    const passwordValid = await verifyPassword(password, storedPassword);

    if (!passwordValid) {
        return { status: 401, jsonBody: { success: false, message: "Invalid credentials" } };
    }

    if (source.columns.has("status")) {
        const status = String(userRow.status || "").toLowerCase();
        if (status && ["inactive", "disabled", "blocked", "suspended"].includes(status)) {
            return { status: 403, jsonBody: { success: false, message: "User account is inactive" } };
        }
    }
    
    context.log(`Login attempt for: ${email}`);

    const orgId = String(userRow.org_id || userRow.tenant_id || "").trim();
    if (!orgId) {
        return { status: 403, jsonBody: { success: false, message: "User is not mapped to any organization" } };
    }
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

    return {
        status: 200,
        jsonBody: {
            success: true,
            data: {
                token,
                user: {
                    id: userId,
                    name,
                    email,
                    role,
                    org_id: orgId,
                }
            }
        }
    };
}

/**
 * Handle refreshMe (Token Validation)
 */
export async function refreshMe(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { status: 401, jsonBody: { message: "Unauthorized" } };
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return { status: 401, jsonBody: { message: "Unauthorized" } };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const orgId = String(decoded.org_id || "").trim();
        if (!orgId) {
            return { status: 401, jsonBody: { message: "Unauthorized" } };
        }
        
        return {
            status: 200,
            jsonBody: {
                id: decoded.id || decoded.email,
                name: String(decoded.email || "user").split("@")[0],
                email: decoded.email || "",
                roles: [decoded.role || "admin"],
                tenant_id: orgId, // Frontend expects tenant_id
                permissions: ["manage_fleet", "view_reports"]
            }
        };
    } catch (err) {
        return { status: 401, jsonBody: { message: "Invalid token" } };
    }
}

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'tenant-login', // Match frontend expectation
    handler: login
});

app.http('refreshMe', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'refreshMe',
    handler: refreshMe
});
