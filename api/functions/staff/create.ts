import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("staffCreate", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "staff",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");
    if (!body.firstName) return err(400, "firstName is required");
    if (!body.lastName) return err(400, "lastName is required");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `INSERT INTO mds_staff_members (
           org_id, role_id, employee_id, profile_photo_url,
           first_name, last_name, gender, marital_status, dob, joining_date,
           employment_type, designation, email, phone,
           address, address2, landmark, state, district, city, pin_code,
           emergency_name, emergency_phone, emergency_email,
           emergency2_name, emergency2_phone, emergency2_email,
           bank_name, account_holder, account_number, ifsc,
           roles, status, department, remarks
         ) VALUES (
           $1,$2,$3,$4,
           $5,$6,$7,$8,$9,$10,
           $11,$12,$13,$14,
           $15,$16,$17,$18,$19,$20,$21,
           $22,$23,$24,
           $25,$26,$27,
           $28,$29,$30,$31,
           $32,$33,$34,$35
         ) RETURNING id, employee_id, first_name, last_name, status, created_at`,
        [
          auth.user.org_id,
          body.roleId ?? null,
          body.employeeId ?? null,
          body.profilePhotoUrl ?? null,
          body.firstName,
          body.lastName,
          body.gender ?? null,
          body.maritalStatus ?? null,
          body.dob ?? null,
          body.joiningDate ?? null,
          body.employmentType ?? null,
          body.designation ?? null,
          body.email ?? null,
          body.phone ?? null,
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
          body.emergency2Name ?? null,
          body.emergency2Phone ?? null,
          body.emergency2Email ?? null,
          body.bankName ?? null,
          body.accountHolder ?? null,
          body.accountNumber ?? null,
          body.ifsc ?? null,
          body.roles ?? [],
          body.status ?? "Active",
          body.department ?? null,
          body.remarks ?? null,
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("staffCreate:", e);
      if (e.code === "23505") return err(409, "Staff with this email already exists");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
