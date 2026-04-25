"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("staff", {
    methods: ["GET", "POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "staff",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            if (req.method === "GET") {
                const page = parseInt(req.query.get("page") ?? "1");
                const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
                const status = req.query.get("status");
                const search = req.query.get("search");
                const department = req.query.get("department");
                const { rows } = await client.query(`SELECT id, employee_id, first_name, last_name, gender, email, phone,
                  designation, department, employment_type, joining_date, status,
                  profile_photo_url, role_id, created_at
           FROM vl_staff_members
           WHERE org_id = $1
             AND ($2::text IS NULL OR status = $2)
             AND ($3::text IS NULL OR department = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%' OR
                  employee_id ILIKE '%' || $4 || '%' OR
                  phone ILIKE '%' || $4 || '%')
           ORDER BY created_at DESC
           LIMIT $5 OFFSET $6`, [auth.user.org_id, status ?? null, department ?? null, search ?? null, pageSize, (page - 1) * pageSize]);
                const { rows: count } = await client.query(`SELECT COUNT(*)
           FROM vl_staff_members
           WHERE org_id = $1
             AND ($2::text IS NULL OR status = $2)
             AND ($3::text IS NULL OR department = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%' OR
                  employee_id ILIKE '%' || $4 || '%' OR
                  phone ILIKE '%' || $4 || '%')`, [auth.user.org_id, status ?? null, department ?? null, search ?? null]);
                return (0, response_1.ok)(rows, { page, pageSize, total: parseInt(count[0].count) });
            }
            // POST
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            if (!body.firstName || !body.lastName)
                return (0, response_1.err)(400, "firstName and lastName are required");
            const { rows } = await client.query(`INSERT INTO vl_staff_members (
           org_id, role_id, employee_id, first_name, last_name, gender, email, phone,
           designation, department, employment_type, joining_date, marital_status, dob,
           address, address2, landmark, state, district, city, pin_code,
           emergency_name, emergency_phone, emergency_email, bank_name,
           account_holder, account_number, ifsc, profile_photo_url, roles,
           status, remarks
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30::jsonb, $31, $32)
         RETURNING *`, [
                auth.user.org_id,
                body.roleId ?? null,
                body.employeeId ?? null,
                body.firstName,
                body.lastName,
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
                JSON.stringify(body.roles ?? []),
                body.status ?? "Active",
                body.remarks ?? null,
            ]);
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("staff:", e);
            if (e.code === "23505")
                return (0, response_1.err)(409, "Record already exists");
            if (e.code === "23503")
                return (0, response_1.err)(404, "Related record not found");
            if (e.code === "23502")
                return (0, response_1.err)(400, "Required field missing");
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
