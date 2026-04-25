import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("vehiclesCreate", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "vehicles",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");
    if (!body.vehicleNumber) return err(400, "vehicleNumber is required");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `INSERT INTO mds_vehicles (
           org_id, vehicle_number, model, manufacturer, vehicle_type,
           year, fuel_type, seating_capacity, colour, status,
           gps_device_id, sim_number, gps_install_date,
           assigned_driver, ownership_type, owner_name, owner_contact,
           insurance_provider, insurance_policy_no, insurance_expiry,
           permit_type, permit_number, permit_issue, permit_expiry,
           fitness_cert_no, fitness_expiry, pollution_cert_no, pollution_expiry,
           last_service, next_service, km_driven,
           fire_extinguisher, first_aid_kit, cctv, panic_button
         ) VALUES (
           $1,$2,$3,$4,$5,
           $6,$7,$8,$9,$10,
           $11,$12,$13,
           $14,$15,$16,$17,
           $18,$19,$20,
           $21,$22,$23,$24,
           $25,$26,$27,$28,
           $29,$30,$31,
           $32,$33,$34,$35
         ) RETURNING id, vehicle_number, status, created_at`,
        [
          auth.user.org_id,
          body.vehicleNumber,
          body.model ?? null,
          body.manufacturer ?? null,
          body.vehicleType ?? null,
          body.year ?? null,
          body.fuelType ?? null,
          body.seatingCapacity ?? null,
          body.colour ?? null,
          body.status ?? "Active",
          body.gpsDeviceId ?? null,
          body.simNumber ?? null,
          body.gpsInstallDate ?? null,
          body.assignedDriver ?? null,
          body.ownershipType ?? null,
          body.ownerName ?? null,
          body.ownerContact ?? null,
          body.insuranceProvider ?? null,
          body.insurancePolicyNo ?? null,
          body.insuranceExpiry ?? null,
          body.permitType ?? null,
          body.permitNumber ?? null,
          body.permitIssue ?? null,
          body.permitExpiry ?? null,
          body.fitnessCertNo ?? null,
          body.fitnessExpiry ?? null,
          body.pollutionCertNo ?? null,
          body.pollutionExpiry ?? null,
          body.lastService ?? null,
          body.nextService ?? null,
          body.kmDriven ?? null,
          body.fireExtinguisher ?? false,
          body.firstAidKit ?? false,
          body.cctv ?? false,
          body.panicButton ?? false,
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("vehiclesCreate:", e);
      if (e.code === "23505") return err(409, "Vehicle number already exists");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
