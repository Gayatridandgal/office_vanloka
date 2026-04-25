import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// GET  /api/sessions/templates
// POST /api/sessions/templates
app.http("sessionsTemplates", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions/templates",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();
    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);
      if (req.method === "GET") {
        const { rows } = await client.query(
          `SELECT id, session_title, category, duration_minutes, description,
                  status, session_count, is_rto_default, mandated_hours, video_url, created_at
           FROM mds_session_templates
           ORDER BY is_rto_default DESC, session_title ASC`,
        );
        return ok(rows);
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.sessionTitle) return err(400, "sessionTitle is required");
      const { rows } = await client.query(
        `INSERT INTO mds_session_templates (
           org_id,session_title,category,duration_minutes,description,status,video_url,is_rto_default,mandated_hours
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, session_title, status, created_at`,
        [
          auth.user.org_id, body.sessionTitle, body.category??null,
          body.durationMinutes??60, body.description??null,
          body.status??"Active", body.videoUrl??null,
          body.isRtoDefault??false, body.mandatedHours??null,
        ],
      );
      return ok(rows[0]);
    } catch (e) {
      ctx.error("sessionsTemplates:", e);
      return err(500, "Server error");
    } finally { client.release(); }
  },
});

// GET  /api/sessions
// POST /api/sessions
app.http("sessions", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();
    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);
      if (req.method === "GET") {
        const page = parseInt(req.query.get("page") ?? "1");
        const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
        const status = req.query.get("status");
        const { rows } = await client.query(
          `SELECT s.id, s.session_title, s.category, s.scheduled_at,
                  s.duration_minutes, s.status, s.remarks,
                  s.instructor_id, s.vehicle_id, s.template_id,
                  i.first_name || ' ' || i.last_name AS instructor_name,
                  v.vehicle_number, s.created_at
           FROM mds_training_sessions s
           LEFT JOIN mds_instructors i ON i.id=s.instructor_id
           LEFT JOIN mds_vehicles v ON v.id=s.vehicle_id
           WHERE s.org_id=$1 AND ($2::text IS NULL OR s.status=$2)
           ORDER BY s.scheduled_at DESC LIMIT $3 OFFSET $4`,
          [auth.user.org_id, status??null, pageSize, (page-1)*pageSize],
        );
        const { rows: count } = await client.query(
          `SELECT COUNT(*) FROM mds_training_sessions WHERE org_id=$1 AND ($2::text IS NULL OR status=$2)`,
          [auth.user.org_id, status??null],
        );
        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.sessionTitle) return err(400, "sessionTitle is required");
      const { rows: sessionRows } = await client.query(
        `INSERT INTO mds_training_sessions (
           org_id,template_id,instructor_id,vehicle_id,session_title,category,scheduled_at,duration_minutes,status,remarks
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id, session_title, status, scheduled_at, created_at`,
        [
          auth.user.org_id, body.templateId??null, body.instructorId??null, body.vehicleId??null,
          body.sessionTitle, body.category??null, body.scheduledAt??null,
          body.durationMinutes??60, body.status??"Scheduled", body.remarks??null,
        ],
      );
      const session = sessionRows[0];
      if (Array.isArray(body.traineeIds) && body.traineeIds.length > 0) {
        const values = body.traineeIds.map((_: string, i: number) => `($1,$2,$${i+3})`).join(",");
        await client.query(
          `INSERT INTO mds_session_trainees (org_id,session_id,trainee_id) VALUES ${values} ON CONFLICT DO NOTHING`,
          [auth.user.org_id, session.id, ...body.traineeIds],
        );
      }
      return ok(session);
    } catch (e) {
      ctx.error("sessions:", e);
      return err(500, "Server error");
    } finally { client.release(); }
  },
});
