import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("staffUpdate", {
  methods: ["PUT", "OPTIONS"],
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
    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE mds_staff_members SET
           role_id          = COALESCE($1,  role_id),
           employee_id      = COALESCE($2,  employee_id),
           first_name       = COALESCE($3,  first_name),
           last_name        = COALESCE($4,  last_name),
           gender           = COALESCE($5,  gender),
           marital_status   = COALESCE($6,  marital_status),
           dob              = COALESCE($7,  dob),
           joining_date     = COALESCE($8,  joining_date),
           employment_type  = COALESCE($9,  employment_type),
           designation      = COALESCE($10, designation),
           email            = COALESCE($11, email),
           phone            = COALESCE($12, phone),
           address          = COALESCE($13, address),
           state            = COALESCE($14, state),
           district         = COALESCE($15, district),
           city             = COALESCE($16, city),
           pin_code         = COALESCE($17, pin_code),
           status           = COALESCE($18, status),
           department       = COALESCE($19, department),
           remarks          = COALESCE($20, remarks),
           updated_at       = now()
         WHERE id = $21 AND org_id = $22
         RETURNING id, first_name, last_name, status, updated_at`,
        [
          body.roleId ?? null,
          body.employeeId ?? null,
          body.firstName ?? null,
          body.lastName ?? null,
          body.gender ?? null,
          body.maritalStatus ?? null,
          body.dob ?? null,
          body.joiningDate ?? null,
          body.employmentType ?? null,
          body.designation ?? null,
          body.email ?? null,
          body.phone ?? null,
          body.address ?? null,
          body.state ?? null,
          body.district ?? null,
          body.city ?? null,
          body.pinCode ?? null,
          body.status ?? null,
          body.department ?? null,
          body.remarks ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (!rows[0]) return err(404, "Staff member not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("staffUpdate:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
