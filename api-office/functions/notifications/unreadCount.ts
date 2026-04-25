import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("notificationsUnreadCount", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "notifications/unread-count",
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
        `SELECT COUNT(*) AS count FROM vl_notifications
         WHERE org_id = $1 AND is_read = FALSE`,
        [auth.user.org_id],
      );

      return ok({ unreadCount: parseInt(rows[0].count) });
    } catch (e: any) {
      ctx.error("notificationsUnreadCount:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
