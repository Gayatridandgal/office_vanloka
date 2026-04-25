import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("sessionsCreateTemplate", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions/templates",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");
    if (!body.sessionTitle) return err(400, "sessionTitle is required");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `INSERT INTO mds_session_templates (
           org_id, session_title, category, duration_minutes,
           description, status, video_url, is_rto_default, mandated_hours
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, session_title, status, created_at`,
        [
          auth.user.org_id,
          body.sessionTitle,
          body.category ?? null,
          body.durationMinutes ?? 60,
          body.description ?? null,
          body.status ?? "Active",
          body.videoUrl ?? null,
          body.isRtoDefault ?? false,
          body.mandatedHours ?? null,
        ],
      );

      return ok(rows[0]);
    } catch (e) {
      ctx.error("sessionsCreateTemplate:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
