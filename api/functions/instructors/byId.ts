import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// PUT    /api/instructors/{id}
// DELETE /api/instructors/{id}
app.http("instructorsById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "instructors/{id}",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();
    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);
    const id = req.params.id;
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);
      if (req.method === "DELETE") {
        const { rowCount } = await client.query(
          `DELETE FROM mds_instructors WHERE id=$1 AND org_id=$2`,
          [id, auth.user.org_id],
        );
        if (!rowCount) return err(404, "Instructor not found");
        return ok({ deleted: true });
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      const { rows } = await client.query(
        `UPDATE mds_instructors SET
           first_name=COALESCE($1,first_name), last_name=COALESCE($2,last_name),
           gender=COALESCE($3,gender), email=COALESCE($4,email), mobile=COALESCE($5,mobile),
           dl_number=COALESCE($6,dl_number), dl_expiry_date=COALESCE($7,dl_expiry_date),
           license_type=COALESCE($8,license_type), instructor_type=COALESCE($9,instructor_type),
           assigned_vehicle_id=COALESCE($10,assigned_vehicle_id), vehicle_reg=COALESCE($11,vehicle_reg),
           status=COALESCE($12,status), rating=COALESCE($13,rating), remarks=COALESCE($14,remarks),
           updated_at=now()
         WHERE id=$15 AND org_id=$16
         RETURNING id, first_name, last_name, status, updated_at`,
        [
          body.firstName??null, body.lastName??null, body.gender??null,
          body.email??null, body.mobile??null, body.dlNumber??null,
          body.dlExpiryDate??null, body.licenseType??null, body.instructorType??null,
          body.assignedVehicleId??null, body.vehicleReg??null,
          body.status??null, body.rating??null, body.remarks??null,
          id, auth.user.org_id,
        ],
      );
      if (!rows[0]) return err(404, "Instructor not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("instructorsById:", e);
      return err(500, "Server error");
    } finally { client.release(); }
  },
});
