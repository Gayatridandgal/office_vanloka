import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("dashboardStats", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "dashboard/stats",
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

      const [vehicles, instructors, trainees, staff, sessions, fees] =
        await Promise.all([
          client.query(
            `SELECT
               COUNT(*) FILTER (WHERE TRUE)          AS total,
               COUNT(*) FILTER (WHERE status='Active') AS active
             FROM mds_vehicles`,
          ),
          client.query(
            `SELECT
               COUNT(*) FILTER (WHERE TRUE)          AS total,
               COUNT(*) FILTER (WHERE status='Active') AS active
             FROM mds_instructors`,
          ),
          client.query(
            `SELECT
               COUNT(*) FILTER (WHERE TRUE)               AS total,
               COUNT(*) FILTER (WHERE status='Active')    AS active,
               COUNT(*) FILTER (WHERE status='In Training') AS in_training,
               COUNT(*) FILTER (WHERE status='Certified') AS certified,
               COALESCE(SUM(total_fee),0)   AS total_fees,
               COALESCE(SUM(paid_amount),0) AS collected_fees
             FROM mds_trainees`,
          ),
          client.query(`SELECT COUNT(*) AS total FROM mds_staff_members`),
          client.query(
            `SELECT
               COUNT(*) FILTER (WHERE TRUE)                  AS total,
               COUNT(*) FILTER (WHERE status='Scheduled')    AS scheduled,
               COUNT(*) FILTER (WHERE status='In Progress')  AS in_progress,
               COUNT(*) FILTER (WHERE status='Completed')    AS completed,
               COUNT(*) FILTER (WHERE status='Cancelled')    AS cancelled
             FROM mds_training_sessions`,
          ),
          client.query(
            `SELECT
               COALESCE(SUM(amount) FILTER (WHERE status='Completed'),0) AS total_collected,
               COALESCE(SUM(amount) FILTER (
                 WHERE status='Completed'
                   AND payment_date >= date_trunc('month', CURRENT_DATE)
               ),0) AS this_month
             FROM mds_fee_transactions`,
          ),
        ]);

      return ok({
        vehicles: vehicles.rows[0],
        instructors: instructors.rows[0],
        trainees: trainees.rows[0],
        staff: staff.rows[0],
        sessions: sessions.rows[0],
        fees: fees.rows[0],
      });
    } catch (e) {
      ctx.error("dashboardStats:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
