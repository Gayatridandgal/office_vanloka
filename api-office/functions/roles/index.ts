import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

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

      if (req.method === "GET") {
        const status = req.query.get("status");
        const { rows } = await client.query(
          `SELECT id, role_name, department, access_level, description, permissions, status, login_email, created_at
           FROM vl_roles
           WHERE org_id = $1 AND ($2::text IS NULL OR status = $2)
           ORDER BY role_name ASC`,
          [auth.user.org_id, status ?? null],
        );
        return ok(rows);
      }

      // POST
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.roleName) return err(400, "roleName is required");

      let hashedPassword = null;
      if (body.loginPassword) {
        const bcrypt = await import("bcryptjs");
        hashedPassword = await bcrypt.hash(body.loginPassword, 10);
      }

      const { rows } = await client.query(
        `INSERT INTO vl_roles (
           org_id, role_name, department, access_level, description, permissions, status, login_email, login_password
         ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
         RETURNING id, role_name, department, access_level, description, permissions, status, login_email, created_at`,
        [
          auth.user.org_id,
          body.roleName,
          body.department ?? null,
          body.accessLevel ?? "Partial Access",
          body.description ?? null,
          JSON.stringify(body.permissions ?? []),
          body.status ?? "Active",
          body.loginEmail ?? null,
          hashedPassword,
        ],
      );
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("roles:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
