import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

/**
 * GET /vehicles/live
 * Returns real-time telemetry for all vehicles in the org.
 * Data is populated by the IoT pipeline into mds_vehicle_telemetry.
 * Falls back to empty array if no telemetry exists yet.
 */
app.http("vehiclesLive", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "vehicles/live",
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
        `SELECT
           t.id,
           t.vehicle_id        AS "vehicleId",
           v.vehicle_number    AS "vehicleNumber",
           t.lat,
           t.lng,
           t.speed,
           t.heading,
           t.status,
           t.driver_name       AS "driverName",
           t.recorded_at       AS "lastUpdated"
         FROM mds_vehicle_telemetry t
         JOIN mds_vehicles v ON v.id = t.vehicle_id
         WHERE t.org_id = $1
           AND t.recorded_at = (
             SELECT MAX(t2.recorded_at)
             FROM mds_vehicle_telemetry t2
             WHERE t2.vehicle_id = t.vehicle_id
           )
         ORDER BY v.vehicle_number`,
        [auth.user.org_id],
      );

      return ok(rows);
    } catch (e) {
      ctx.error("vehiclesLive:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
