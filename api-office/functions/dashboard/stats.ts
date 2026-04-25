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

      const [vehicles, drivers, staff, bookings] = await Promise.all([
        client.query(
          `SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status='Active') AS active,
                  COUNT(*) FILTER (WHERE status='Maintenance') AS maintenance,
                  COUNT(*) FILTER (WHERE status='Inactive') AS inactive
           FROM vl_vehicles WHERE org_id = $1`,
          [auth.user.org_id],
        ),
        client.query(
          `SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE current_status='On Duty') AS on_duty,
                  COUNT(*) FILTER (WHERE current_status='On Break') AS on_break,
                  COUNT(*) FILTER (WHERE current_status='Offline') AS offline
           FROM vl_drivers WHERE org_id = $1`,
          [auth.user.org_id],
        ),
        client.query(
          `SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status='Active') AS active
           FROM vl_staff_members WHERE org_id = $1`,
          [auth.user.org_id],
        ),
        client.query(
          `SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status='Confirmed') AS confirmed,
                  COUNT(*) FILTER (WHERE status='Pending') AS pending,
                  COUNT(*) FILTER (WHERE status='Cancelled') AS cancelled
           FROM vl_bookings WHERE org_id = $1`,
          [auth.user.org_id],
        ),
      ]);

      return ok({
        vehicles: vehicles.rows[0],
        drivers: drivers.rows[0],
        staff: staff.rows[0],
        bookings: bookings.rows[0],
      });
    } catch (e: any) {
      ctx.error("dashboardStats:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
