import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("sessionsCreate", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions",
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

      // Create the session
      const { rows: sessionRows } = await client.query(
        `INSERT INTO mds_training_sessions (
           org_id, template_id, instructor_id, vehicle_id,
           session_title, category, scheduled_at,
           duration_minutes, status, remarks
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id, session_title, status, scheduled_at, created_at`,
        [
          auth.user.org_id,
          body.templateId ?? null,
          body.instructorId ?? null,
          body.vehicleId ?? null,
          body.sessionTitle,
          body.category ?? null,
          body.scheduledAt ?? null,
          body.durationMinutes ?? 60,
          body.status ?? "Scheduled",
          body.remarks ?? null,
        ],
      );

      const session = sessionRows[0];

      // Enroll trainees if provided
      if (Array.isArray(body.traineeIds) && body.traineeIds.length > 0) {
        const values = body.traineeIds
          .map((_: string, i: number) =>
            `($1, $2, $${i + 3})`,
          )
          .join(", ");

        await client.query(
          `INSERT INTO mds_session_trainees (org_id, session_id, trainee_id)
           VALUES ${values}
           ON CONFLICT DO NOTHING`,
          [auth.user.org_id, session.id, ...body.traineeIds],
        );
      }

      return ok(session);
    } catch (e) {
      ctx.error("sessionsCreate:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
