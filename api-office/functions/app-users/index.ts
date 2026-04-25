import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("appUsers", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "app-users",
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

      const page = parseInt(req.query.get("page") ?? "1");
      const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
      const role = req.query.get("role");
      const status = req.query.get("status");

      const { rows } = await client.query(
        `SELECT id, name, phone, email, role, linked_entity_type,
                linked_entity_id, last_active, status, created_at
         FROM vl_app_users
         WHERE org_id = $1
           AND ($2::text IS NULL OR role = $2)
           AND ($3::text IS NULL OR status = $3)
         ORDER BY created_at DESC
         LIMIT $4 OFFSET $5`,
        [auth.user.org_id, role ?? null, status ?? null, pageSize, (page - 1) * pageSize],
      );

      const { rows: count } = await client.query(
        `SELECT COUNT(*)
         FROM vl_app_users
         WHERE org_id = $1
           AND ($2::text IS NULL OR role = $2)
           AND ($3::text IS NULL OR status = $3)`,
        [auth.user.org_id, role ?? null, status ?? null],
      );

      return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
    } catch (e: any) {
      ctx.error("appUsers:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
