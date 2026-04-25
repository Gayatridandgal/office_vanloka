import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// GET  /api/staff
// POST /api/staff
app.http("staff", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "staff",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
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
        const { rows } = await client.query(
          `SELECT id, employee_id, first_name, last_name, gender,
                  designation, department, employment_type, email, phone,
                  status, joining_date, profile_photo_url, roles, created_at
           FROM mds_staff_members
           WHERE ($1::text IS NULL OR status = $1)
           ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          [status ?? null, pageSize, (page - 1) * pageSize],
        );
        const { rows: count } = await client.query(
          `SELECT COUNT(*) FROM mds_staff_members WHERE ($1::text IS NULL OR status = $1)`,
          [status ?? null],
        );
        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.firstName) return err(400, "firstName is required");
      if (!body.lastName) return err(400, "lastName is required");
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
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)
         RETURNING id, employee_id, first_name, last_name, status, created_at`,
        [
          auth.user.org_id, body.roleId ?? null, body.employeeId ?? null, body.profilePhotoUrl ?? null,
          body.firstName, body.lastName, body.gender ?? null, body.maritalStatus ?? null,
          body.dob ?? null, body.joiningDate ?? null, body.employmentType ?? null,
          body.designation ?? null, body.email ?? null, body.phone ?? null,
          body.address ?? null, body.address2 ?? null, body.landmark ?? null,
          body.state ?? null, body.district ?? null, body.city ?? null, body.pinCode ?? null,
          body.emergencyName ?? null, body.emergencyPhone ?? null, body.emergencyEmail ?? null,
          body.emergency2Name ?? null, body.emergency2Phone ?? null, body.emergency2Email ?? null,
          body.bankName ?? null, body.accountHolder ?? null, body.accountNumber ?? null, body.ifsc ?? null,
          body.roles ?? [], body.status ?? "Active", body.department ?? null, body.remarks ?? null,
        ],
      );
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("staff:", e);
      if (e.code === "23505") return err(409, "Staff with this email already exists");
      return err(500, "Server error");
    } finally { client.release(); }
  },
});
