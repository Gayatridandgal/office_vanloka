import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("sessionsList", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const page = parseInt(req.query.get("page") ?? "1");
    const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
    const status = req.query.get("status");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `SELECT
           s.id, s.session_title, s.category, s.scheduled_at,
           s.duration_minutes, s.status, s.remarks,
           s.instructor_id, s.vehicle_id, s.template_id,
           i.first_name || ' ' || i.last_name AS instructor_name,
           v.vehicle_number,
           s.created_at
         FROM mds_training_sessions s
         LEFT JOIN mds_instructors i ON i.id = s.instructor_id
         LEFT JOIN mds_vehicles    v ON v.id = s.vehicle_id
         WHERE s.org_id = $1
           AND ($2::text IS NULL OR s.status = $2)
         ORDER BY s.scheduled_at DESC
         LIMIT $3 OFFSET $4`,
        [auth.user.org_id, status ?? null, pageSize, (page - 1) * pageSize],
      );

      const { rows: count } = await client.query(
        `SELECT COUNT(*) FROM mds_training_sessions
         WHERE org_id = $1 AND ($2::text IS NULL OR status = $2)`,
        [auth.user.org_id, status ?? null],
      );

      return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
    } catch (e) {
      ctx.error("sessionsList:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
