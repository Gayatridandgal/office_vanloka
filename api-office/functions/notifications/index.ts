import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("notifications", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "notifications",
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
      const type = req.query.get("type");
      const isReadStr = req.query.get("isRead");
      let isRead: boolean | null = null;
      if (isReadStr === "true") isRead = true;
      if (isReadStr === "false") isRead = false;

      const { rows } = await client.query(
        `SELECT id, type, title, message, entity_type, entity_id, is_read, created_at
         FROM vl_notifications
         WHERE org_id = $1
           AND ($2::text IS NULL OR type = $2)
           AND ($3::boolean IS NULL OR is_read = $3)
         ORDER BY created_at DESC
         LIMIT $4 OFFSET $5`,
        [auth.user.org_id, type ?? null, isRead, pageSize, (page - 1) * pageSize],
      );

      const { rows: count } = await client.query(
        `SELECT COUNT(*)
         FROM vl_notifications
         WHERE org_id = $1
           AND ($2::text IS NULL OR type = $2)
           AND ($3::boolean IS NULL OR is_read = $3)`,
        [auth.user.org_id, type ?? null, isRead],
      );

      return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
    } catch (e: any) {
      ctx.error("notifications:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
