import pool, { withRLS } from "../lib/db";
import type { Permission, Role } from "../types/index";
import { AppError } from "../middleware/errorHandler";

const ROLE_TABLE = 'schemaa."officeRoles"';
const PERMISSION_TABLE = 'schemaa."officePermissions"';
const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

let schemaReady = false;
let schemaAttempted = false;

let inMemoryRoles: Role[] = [];
let inMemoryPermissions: Permission[] = [];

const DEFAULT_PERMISSIONS = [
  "view dashboard",
  "view role permissions",
  "create role permissions",
  "edit role permissions",
  "delete role permissions",
  "view employees",
  "create employees",
  "edit employees",
  "delete employees",
  "view vehicles",
  "create vehicles",
  "edit vehicles",
  "delete vehicles",
  "view drivers",
  "create drivers",
  "edit drivers",
  "delete drivers",
  "view travellers",
  "create travellers",
  "edit travellers",
  "delete travellers",
  "view bookings",
  "view vendors",
  "view feedbacks",
  "view reports",
  "view settings",
];

function seedInMemoryPermissions(): void {
  if (inMemoryPermissions.length > 0) return;
  inMemoryPermissions = DEFAULT_PERMISSIONS.map((name, idx) => ({ id: idx + 1, name }));
}

export async function initializeRolePermissionSchema(): Promise<void> {
  if (schemaAttempted) return;
  schemaAttempted = true;

  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS schemaa`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${ROLE_TABLE} (
        id SERIAL PRIMARY KEY,
        org_id TEXT NOT NULL DEFAULT '${DEFAULT_ORG_ID}',
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(
      `ALTER TABLE ${ROLE_TABLE} ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT '${DEFAULT_ORG_ID}'`
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${PERMISSION_TABLE} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS office_roles_org_id_name_uidx ON ${ROLE_TABLE} (org_id, name)`
    );

    schemaReady = true;
    console.log("[DB] Role/Permission schema initialized");
  } catch (error: any) {
    schemaReady = false;
    seedInMemoryPermissions();
    console.warn(`[DB] Role/Permission schema unavailable; fallback mode: ${error?.message}`);
  }
}

export async function seedDefaultPermissions(): Promise<void> {
  if (!schemaReady) {
    seedInMemoryPermissions();
    return;
  }

  try {
    for (const name of DEFAULT_PERMISSIONS) {
      await pool.query(
        `INSERT INTO ${PERMISSION_TABLE} (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [name]
      );
    }
  } catch (error) {
    console.warn("[DB] Failed to seed permissions:", error);
  }
}

export async function ensureDefaultAdminRole(orgId: string): Promise<Role | void> {
  const safeOrgId = orgId || DEFAULT_ORG_ID;

  if (!schemaReady) {
    const existing = inMemoryRoles.find((r) => r.org_id === safeOrgId && r.name === "admin");
    if (existing) return existing;

    const role: Role = {
      id: inMemoryRoles.length + 1,
      org_id: safeOrgId,
      name: "admin",
      description: "System administrator",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryRoles.push(role);
    return role;
  }

  try {
    const existing = await pool.query(
      `SELECT id, org_id, name, description, created_at, updated_at
       FROM ${ROLE_TABLE}
       WHERE org_id = $1 AND name = 'admin'
       LIMIT 1`,
      [safeOrgId]
    );

    if (existing.rows.length > 0) return existing.rows[0] as Role;

    const inserted = await pool.query(
      `INSERT INTO ${ROLE_TABLE} (org_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, org_id, name, description, created_at, updated_at`,
      [safeOrgId, "admin", "System administrator"]
    );

    return inserted.rows[0] as Role;
  } catch (error) {
    console.warn("[DB] Failed to ensure admin role:", error);
  }
}

export async function getRoles(orgId: string): Promise<Role[]> {
  if (!schemaReady) {
    return inMemoryRoles.filter((r) => r.org_id === orgId).sort((a, b) => b.id - a.id);
  }

  return withRLS(orgId, async (client) => {
    const result = await client.query(
      `SELECT id, org_id, name, description, created_at, updated_at
       FROM ${ROLE_TABLE}
       WHERE org_id = $1
       ORDER BY id DESC`,
      [orgId]
    );
    return result.rows as Role[];
  });
}

export async function getRoleById(orgId: string, roleId: number): Promise<Role> {
  if (!schemaReady) {
    const role = inMemoryRoles.find((r) => r.org_id === orgId && r.id === roleId);
    if (!role) throw new AppError(404, "Role not found");
    return role;
  }

  return withRLS(orgId, async (client) => {
    const result = await client.query(
      `SELECT id, org_id, name, description, created_at, updated_at
       FROM ${ROLE_TABLE}
       WHERE org_id = $1 AND id = $2`,
      [orgId, roleId]
    );

    if (result.rows.length === 0) throw new AppError(404, "Role not found");
    return result.rows[0] as Role;
  });
}

export async function createRole(
  orgId: string,
  data: { name: string; description?: string; permissions?: number[] }
): Promise<Role> {
  if (!data.name?.trim()) throw new AppError(400, "Role name is required");

  if (!schemaReady) {
    const role: Role = {
      id: inMemoryRoles.length + 1,
      org_id: orgId,
      name: data.name.trim(),
      description: data.description ?? null,
      permissions: data.permissions ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryRoles.push(role);
    return role;
  }

  try {
    return await withRLS(orgId, async (client) => {
      const result = await client.query(
        `INSERT INTO ${ROLE_TABLE} (org_id, name, description)
         VALUES ($1, $2, $3)
         RETURNING id, org_id, name, description, created_at, updated_at`,
        [orgId, data.name.trim(), data.description ?? null]
      );
      return result.rows[0] as Role;
    });
  } catch (error: any) {
    if (error?.code === "23505") throw new AppError(409, "Role already exists");
    throw new AppError(500, "Failed to create role");
  }
}

export async function updateRole(
  orgId: string,
  roleId: number,
  data: { name?: string; description?: string; permissions?: number[] }
): Promise<Role> {
  if (!schemaReady) {
    const role = inMemoryRoles.find((r) => r.org_id === orgId && r.id === roleId);
    if (!role) throw new AppError(404, "Role not found");

    if (typeof data.name === "string") role.name = data.name.trim();
    if (data.description !== undefined) role.description = data.description;
    if (data.permissions !== undefined) role.permissions = data.permissions;
    role.updated_at = new Date().toISOString();
    return role;
  }

  try {
    return await withRLS(orgId, async (client) => {
      const result = await client.query(
        `UPDATE ${ROLE_TABLE}
         SET
           name = COALESCE($3, name),
           description = COALESCE($4, description),
           updated_at = NOW()
         WHERE org_id = $1 AND id = $2
         RETURNING id, org_id, name, description, created_at, updated_at`,
        [orgId, roleId, data.name?.trim() ?? null, data.description ?? null]
      );

      if (result.rows.length === 0) throw new AppError(404, "Role not found");
      return result.rows[0] as Role;
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error?.code === "23505") throw new AppError(409, "Role already exists");
    throw new AppError(500, "Failed to update role");
  }
}

export async function deleteRole(orgId: string, roleId: number): Promise<void> {
  if (!schemaReady) {
    inMemoryRoles = inMemoryRoles.filter((r) => !(r.org_id === orgId && r.id === roleId));
    return;
  }

  await withRLS(orgId, async (client) => {
    const result = await client.query(`DELETE FROM ${ROLE_TABLE} WHERE org_id = $1 AND id = $2`, [orgId, roleId]);
    if (result.rowCount === 0) throw new AppError(404, "Role not found");
  });
}

export async function getPermissions(): Promise<Permission[]> {
  if (!schemaReady) {
    seedInMemoryPermissions();
    return [...inMemoryPermissions].sort((a, b) => a.id - b.id);
  }

  const result = await pool.query(`SELECT id, name FROM ${PERMISSION_TABLE} ORDER BY id ASC`);
  return result.rows as Permission[];
}

export async function createPermission(name: string): Promise<Permission> {
  if (!name?.trim()) throw new AppError(400, "Permission name is required");

  if (!schemaReady) {
    const permission: Permission = { id: inMemoryPermissions.length + 1, name: name.trim() };
    inMemoryPermissions.push(permission);
    return permission;
  }

  try {
    const result = await pool.query(
      `INSERT INTO ${PERMISSION_TABLE} (name) VALUES ($1) RETURNING id, name`,
      [name.trim()]
    );
    return result.rows[0] as Permission;
  } catch (error: any) {
    if (error?.code === "23505") throw new AppError(409, "Permission already exists");
    throw new AppError(500, "Failed to create permission");
  }
}

export async function deletePermission(permissionId: number): Promise<void> {
  if (!schemaReady) {
    inMemoryPermissions = inMemoryPermissions.filter((p) => p.id !== permissionId);
    return;
  }

  const result = await pool.query(`DELETE FROM ${PERMISSION_TABLE} WHERE id = $1`, [permissionId]);
  if (result.rowCount === 0) throw new AppError(404, "Permission not found");
}
