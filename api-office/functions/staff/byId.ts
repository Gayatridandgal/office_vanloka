import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("staffById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "staff/{id}",
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
          `DELETE FROM vl_staff_members WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_staff_members SET
           role_id           = COALESCE($1, role_id),
           employee_id       = COALESCE($2, employee_id),
           first_name        = COALESCE($3, first_name),
           last_name         = COALESCE($4, last_name),
           gender            = COALESCE($5, gender),
           email             = COALESCE($6, email),
           phone             = COALESCE($7, phone),
           designation       = COALESCE($8, designation),
           department        = COALESCE($9, department),
           employment_type   = COALESCE($10, employment_type),
           joining_date      = COALESCE($11, joining_date),
           marital_status    = COALESCE($12, marital_status),
           dob               = COALESCE($13, dob),
           address           = COALESCE($14, address),
           address2          = COALESCE($15, address2),
           landmark          = COALESCE($16, landmark),
           state             = COALESCE($17, state),
           district          = COALESCE($18, district),
           city              = COALESCE($19, city),
           pin_code          = COALESCE($20, pin_code),
           emergency_name    = COALESCE($21, emergency_name),
           emergency_phone   = COALESCE($22, emergency_phone),
           emergency_email   = COALESCE($23, emergency_email),
           bank_name         = COALESCE($24, bank_name),
           account_holder    = COALESCE($25, account_holder),
           account_number    = COALESCE($26, account_number),
           ifsc              = COALESCE($27, ifsc),
           profile_photo_url = COALESCE($28, profile_photo_url),
           roles             = COALESCE($29::jsonb, roles),
           status            = COALESCE($30, status),
           remarks           = COALESCE($31, remarks),
           updated_at        = NOW()
         WHERE id = $32 AND org_id = $33
         RETURNING *`,
        [
          body.roleId ?? null,
          body.employeeId ?? null,
          body.firstName ?? null,
          body.lastName ?? null,
          body.gender ?? null,
          body.email ?? null,
          body.phone ?? null,
          body.designation ?? null,
          body.department ?? null,
          body.employmentType ?? null,
          body.joinDate ?? body.joiningDate ?? null,
          body.maritalStatus ?? null,
          body.dob ?? null,
          body.address ?? null,
          body.address2 ?? null,
          body.landmark ?? null,
          body.state ?? null,
          body.district ?? null,
          body.city ?? null,
          body.pinCode ?? null,
          body.emergencyName ?? null,
          body.emergencyPhone ?? null,
          body.emergencyEmail ?? null,
          body.bankName ?? null,
          body.accountHolder ?? null,
          body.accountNumber ?? null,
          body.ifsc ?? null,
          body.profilePhotoUrl ?? null,
          body.roles ? JSON.stringify(body.roles) : null,
          body.status ?? null,
          body.remarks ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("staffById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
