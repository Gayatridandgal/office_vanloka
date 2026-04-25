import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("drivers", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "drivers",
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
        const status = req.query.get("status");
        const city = req.query.get("city");
        const search = req.query.get("search");

        const { rows } = await client.query(
          `SELECT id, first_name, last_name, gender, email, mobile_number,
                  dl_number, dl_expiry_date, license_type, current_status,
                  assigned_vehicle_id, vehicle_reg, operational_base,
                  profile_photo_url, employee_id, created_at
           FROM vl_drivers
           WHERE org_id = $1
             AND ($2::text IS NULL OR current_status = $2)
             AND ($3::text IS NULL OR operational_base = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  mobile_number ILIKE '%' || $4 || '%' OR
                  employee_id ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%')
           ORDER BY created_at DESC
           LIMIT $5 OFFSET $6`,
          [auth.user.org_id, status ?? null, city ?? null, search ?? null, pageSize, (page - 1) * pageSize],
        );

        const { rows: count } = await client.query(
          `SELECT COUNT(*)
           FROM vl_drivers
           WHERE org_id = $1
             AND ($2::text IS NULL OR current_status = $2)
             AND ($3::text IS NULL OR operational_base = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  mobile_number ILIKE '%' || $4 || '%' OR
                  employee_id ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%')`,
          [auth.user.org_id, status ?? null, city ?? null, search ?? null],
        );

        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }

      // POST
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.firstName || !body.lastName) return err(400, "firstName and lastName are required");

      const { rows } = await client.query(
        `INSERT INTO vl_drivers (
           org_id, first_name, last_name, gender, dob, email, mobile_number,
           blood_group, marital_status, profile_photo_url, employment_type,
           employee_id, dl_number, dl_issue_date, dl_expiry_date, license_type,
           driving_experience, address, city, district, state, pin_code,
           assigned_vehicle_id, vehicle_reg, beacon_id, operational_base,
           current_status, status, remarks
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
         RETURNING *`,
        [
          auth.user.org_id,
          body.firstName,
          body.lastName,
          body.gender ?? null,
          body.dob ?? null,
          body.email ?? null,
          body.mobileNumber ?? null,
          body.bloodGroup ?? null,
          body.maritalStatus ?? null,
          body.profilePhotoUrl ?? null,
          body.employmentType ?? null,
          body.employeeId ?? null,
          body.dlNumber ?? null,
          body.dlIssueDate ?? null,
          body.dlExpiryDate ?? null,
          body.licenseType ?? null,
          body.drivingExperience ?? null,
          body.address ?? null,
          body.city ?? null,
          body.district ?? null,
          body.state ?? null,
          body.pinCode ?? null,
          body.assignedVehicleId ?? null,
          body.vehicleReg ?? null,
          body.beaconId ?? null,
          body.operationalBase ?? null,
          body.currentStatus ?? "Active",
          body.status ?? "Active",
          body.remarks ?? null,
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("drivers:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
