import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("vehiclesUpdate", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "vehicles/{id}",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE mds_vehicles SET
           vehicle_number   = COALESCE($1,  vehicle_number),
           model            = COALESCE($2,  model),
           manufacturer     = COALESCE($3,  manufacturer),
           vehicle_type     = COALESCE($4,  vehicle_type),
           year             = COALESCE($5,  year),
           fuel_type        = COALESCE($6,  fuel_type),
           seating_capacity = COALESCE($7,  seating_capacity),
           colour           = COALESCE($8,  colour),
           status           = COALESCE($9,  status),
           gps_device_id    = COALESCE($10, gps_device_id),
           assigned_driver  = COALESCE($11, assigned_driver),
           insurance_expiry = COALESCE($12, insurance_expiry),
           next_service     = COALESCE($13, next_service),
           km_driven        = COALESCE($14, km_driven),
           updated_at       = now()
         WHERE id = $15 AND org_id = $16
         RETURNING id, vehicle_number, status, updated_at`,
        [
          body.vehicleNumber ?? null,
          body.model ?? null,
          body.manufacturer ?? null,
          body.vehicleType ?? null,
          body.year ?? null,
          body.fuelType ?? null,
          body.seatingCapacity ?? null,
          body.colour ?? null,
          body.status ?? null,
          body.gpsDeviceId ?? null,
          body.assignedDriver ?? null,
          body.insuranceExpiry ?? null,
          body.nextService ?? null,
          body.kmDriven ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (!rows[0]) return err(404, "Vehicle not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("vehiclesUpdate:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
