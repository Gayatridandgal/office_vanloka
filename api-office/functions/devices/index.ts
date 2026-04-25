import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("devices", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "devices",
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

      if (req.method === "GET") {
        const page = parseInt(req.query.get("page") ?? "1");
        const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
        const deviceType = req.query.get("deviceType");
        const status = req.query.get("status");

        const { rows } = await client.query(
          `SELECT d.*, v.vehicle_number AS assigned_vehicle_number
           FROM vl_devices d
           LEFT JOIN vl_vehicles v ON v.id = d.assigned_vehicle_id
           WHERE d.org_id = $1
             AND ($2::text IS NULL OR d.device_type = $2)
             AND ($3::text IS NULL OR d.status = $3)
           ORDER BY d.created_at DESC
           LIMIT $4 OFFSET $5`,
          [auth.user.org_id, deviceType ?? null, status ?? null, pageSize, (page - 1) * pageSize],
        );

        const { rows: count } = await client.query(
          `SELECT COUNT(*)
           FROM vl_devices d
           WHERE d.org_id = $1
             AND ($2::text IS NULL OR d.device_type = $2)
             AND ($3::text IS NULL OR d.status = $3)`,
          [auth.user.org_id, deviceType ?? null, status ?? null],
        );

        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }

      // POST
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.deviceId || !body.deviceType) return err(400, "deviceId and deviceType are required");

      const { rows } = await client.query(
        `INSERT INTO vl_devices (
           org_id, device_id, device_type, serial_number, assigned_vehicle_id, battery_percent, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          auth.user.org_id,
          body.deviceId,
          body.deviceType,
          body.serialNumber ?? null,
          body.assignedVehicleId ?? null,
          body.batteryPercent ?? null,
          body.status ?? "Active",
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("devices:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
