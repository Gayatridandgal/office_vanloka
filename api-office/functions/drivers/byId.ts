import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("driversById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "drivers/{id}",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      if (req.method === "DELETE") {
        const { rowCount } = await client.query(
          `DELETE FROM vl_drivers WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_drivers SET
           first_name          = COALESCE($1, first_name),
           last_name           = COALESCE($2, last_name),
           gender              = COALESCE($3, gender),
           dob                 = COALESCE($4, dob),
           email               = COALESCE($5, email),
           mobile_number       = COALESCE($6, mobile_number),
           blood_group         = COALESCE($7, blood_group),
           marital_status      = COALESCE($8, marital_status),
           profile_photo_url   = COALESCE($9, profile_photo_url),
           employment_type     = COALESCE($10, employment_type),
           employee_id         = COALESCE($11, employee_id),
           dl_number           = COALESCE($12, dl_number),
           dl_issue_date       = COALESCE($13, dl_issue_date),
           dl_expiry_date      = COALESCE($14, dl_expiry_date),
           license_type        = COALESCE($15, license_type),
           driving_experience  = COALESCE($16, driving_experience),
           address             = COALESCE($17, address),
           city                = COALESCE($18, city),
           district            = COALESCE($19, district),
           state               = COALESCE($20, state),
           pin_code            = COALESCE($21, pin_code),
           assigned_vehicle_id = COALESCE($22, assigned_vehicle_id),
           vehicle_reg         = COALESCE($23, vehicle_reg),
           beacon_id           = COALESCE($24, beacon_id),
           operational_base    = COALESCE($25, operational_base),
           current_status      = COALESCE($26, current_status),
           status              = COALESCE($27, status),
           remarks             = COALESCE($28, remarks),
           updated_at          = NOW()
         WHERE id = $29 AND org_id = $30
         RETURNING *`,
        [
          body.firstName ?? null,
          body.lastName ?? null,
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
          body.currentStatus ?? null,
          body.status ?? null,
          body.remarks ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("driversById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
