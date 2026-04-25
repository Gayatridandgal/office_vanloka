import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import bcrypt from "bcryptjs";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("rolesUpdate", {
  methods: ["PUT", "OPTIONS"],
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
    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");

    let hashedPassword: string | undefined = undefined;
    if (body.loginPassword) {
      hashedPassword = await bcrypt.hash(body.loginPassword, 10);
    }

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE mds_roles SET
           role_name    = COALESCE($1, role_name),
           department   = COALESCE($2, department),
           access_level = COALESCE($3, access_level),
           description  = COALESCE($4, description),
           permissions  = COALESCE($5, permissions),
           status       = COALESCE($6, status),
           login_email  = COALESCE($7, login_email),
           login_password = COALESCE($8, login_password),
           updated_at   = now()
         WHERE id = $9 AND org_id = $10
         RETURNING id, role_name, department, access_level, status, updated_at`,
        [
          body.roleName ?? null,
          body.department ?? null,
          body.accessLevel ?? null,
          body.description ?? null,
          body.permissions ?? null,
          body.status ?? null,
          body.loginEmail ?? null,
          hashedPassword ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (!rows[0]) return err(404, "Role not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("rolesUpdate:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
