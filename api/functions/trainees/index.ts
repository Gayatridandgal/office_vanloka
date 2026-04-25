import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// GET  /api/trainees
// POST /api/trainees
app.http("trainees", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "trainees",
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
          `SELECT id, first_name, last_name, gender, email, phone,
                  status, bookings, total_fee, paid_amount,
                  aimed_licenses, profile_photo_url, ll_number, dl_collected, created_at
           FROM mds_trainees
           WHERE ($1::text IS NULL OR status=$1)
           ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          [status ?? null, pageSize, (page - 1) * pageSize],
        );
        const { rows: count } = await client.query(
          `SELECT COUNT(*) FROM mds_trainees WHERE ($1::text IS NULL OR status=$1)`,
          [status ?? null],
        );
        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.firstName) return err(400, "firstName is required");
      if (!body.lastName) return err(400, "lastName is required");
      const { rows } = await client.query(
        `INSERT INTO mds_trainees (
           org_id,first_name,last_name,gender,dob,profile_photo_url,
           email,phone,emergency_contact_name,emergency_contact,
           address,address2,locality,city,district,state,pin_code,
           kyc_doc_type,kyc_doc_number,referral_code,
           preferred_language,interest,occupation,aimed_licenses,
           total_fee,paid_amount,training_only,status,remarks
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
         RETURNING id, first_name, last_name, status, created_at`,
        [
          auth.user.org_id,
          body.firstName,body.lastName,body.gender??null,body.dob??null,body.profilePhotoUrl??null,
          body.email??null,body.phone??null,body.emergencyContactName??null,body.emergencyContact??null,
          body.address??null,body.address2??null,body.locality??null,body.city??null,body.district??null,body.state??null,body.pinCode??null,
          body.kycDocType??null,body.kycDocNumber??null,body.referralCode??null,
          body.preferredLanguage??null,body.interest??null,body.occupation??null,body.aimedLicenses??[],
          body.totalFee??0,body.paidAmount??0,body.trainingOnly??false,body.status??"Active",body.remarks??null,
        ],
      );
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("trainees:", e);
      if (e.code === "23505") return err(409, "Trainee with this email already exists");
      return err(500, "Server error");
    } finally { client.release(); }
  },
});
