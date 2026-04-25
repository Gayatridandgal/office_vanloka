import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("rolesList", {
  methods: ["GET", "OPTIONS"],
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

      const { rows } = await client.query(
        `SELECT id, org_id, role_name, department, access_level,
                description, permissions, status,
                login_email, created_at, updated_at
         FROM mds_roles
         ORDER BY created_at DESC`,
      );

      return ok(rows);
    } catch (e) {
      ctx.error("rolesList:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
