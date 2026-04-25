import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("rolesById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "roles/{id}",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
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
          `DELETE FROM vl_roles WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      let hashedPassword = undefined;
      if (body.loginPassword) {
        const bcrypt = await import("bcryptjs");
        hashedPassword = await bcrypt.hash(body.loginPassword, 10);
      }

      const { rows } = await client.query(
        `UPDATE vl_roles SET
           role_name      = COALESCE($1, role_name),
           department     = COALESCE($2, department),
           access_level   = COALESCE($3, access_level),
           description    = COALESCE($4, description),
           permissions    = COALESCE($5::jsonb, permissions),
           status         = COALESCE($6, status),
           login_email    = COALESCE($7, login_email),
           login_password = COALESCE($8, login_password),
           updated_at     = NOW()
         WHERE id = $9 AND org_id = $10
         RETURNING id, role_name, department, access_level, description, permissions, status, login_email, updated_at`,
        [
          body.roleName ?? null,
          body.department ?? null,
          body.accessLevel ?? null,
          body.description ?? null,
          body.permissions ? JSON.stringify(body.permissions) : null,
          body.status ?? null,
          body.loginEmail ?? null,
          hashedPassword ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("rolesById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
