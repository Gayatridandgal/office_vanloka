import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// GET  /api/roles  — list all roles for the org
// POST /api/roles  — create a new role
app.http("roles", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "roles",
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
        const { rows } = await client.query(
          `SELECT id, org_id, role_name, department, access_level,
                  description, permissions, status,
                  login_email, created_at, updated_at
           FROM mds_roles
           ORDER BY created_at DESC`,
        );
        return ok(rows);
      }

      /* ── POST ── */
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.roleName) return err(400, "roleName is required");

      let hashedPassword: string | null = null;
      if (body.loginPassword) {
        const bcrypt = await import("bcryptjs");
        hashedPassword = await bcrypt.hash(body.loginPassword, 10);
      }

      const { rows } = await client.query(
        `INSERT INTO mds_roles (
           org_id, role_name, department, access_level,
           description, permissions, status, login_email, login_password
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, role_name, department, access_level, status, created_at`,
        [
          auth.user.org_id,
          body.roleName,
          body.department ?? null,
          body.accessLevel ?? "Partial Access",
          body.description ?? null,
          body.permissions ?? [],
          body.status ?? "Active",
          body.loginEmail ?? null,
          hashedPassword,
        ],
      );
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("roles:", e);
      if (e.code === "23505") return err(409, "A role with this login email already exists");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
