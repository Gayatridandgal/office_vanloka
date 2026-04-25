import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// Route: PUT /notifications/read-all
app.http("notificationsReadAll", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "notifications/read-all",
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

      const result = await client.query(
        `UPDATE vl_notifications SET is_read = TRUE
         WHERE org_id = $1 AND is_read = FALSE`,
        [auth.user.org_id],
      );

      return ok({ updated: result.rowCount });
    } catch (e: any) {
      ctx.error("notificationsReadAll:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});

// Route: PUT /notifications/{id}/read
app.http("notificationsMarkRead", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "notifications/{id}/read",
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

      const { rows } = await client.query(
        `UPDATE vl_notifications SET is_read = TRUE
         WHERE id = $1 AND org_id = $2
         RETURNING id, is_read`,
        [id, auth.user.org_id],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("notificationsMarkRead:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
