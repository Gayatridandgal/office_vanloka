import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

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
        `SELECT DISTINCT ON (t.vehicle_id)
           t.vehicle_id, t.lat, t.lng, t.speed, t.heading, t.status, t.driver_name,
           t.recorded_at, v.vehicle_number, v.model
         FROM vl_vehicle_telemetry t
         JOIN vl_vehicles v ON v.id = t.vehicle_id
         WHERE t.org_id = $1
         ORDER BY t.vehicle_id, t.recorded_at DESC`,
        [auth.user.org_id],
      );

      return ok(rows);
    } catch (e: any) {
      ctx.error("vehiclesLive:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
