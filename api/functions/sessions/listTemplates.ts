import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("sessionsListTemplates", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions/templates",
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
        `SELECT id, session_title, category, duration_minutes,
                description, status, session_count, is_rto_default,
                mandated_hours, video_url, created_at
         FROM mds_session_templates
         ORDER BY is_rto_default DESC, session_title ASC`,
      );

      return ok(rows);
    } catch (e) {
      ctx.error("sessionsListTemplates:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
