import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// GET  /api/instructors
// POST /api/instructors
app.http("instructors", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "instructors",
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
          `SELECT id, first_name, last_name, gender, email, mobile,
                  dl_number, dl_expiry_date, license_type, instructor_type,
                  status, rating, sessions_count, assigned_vehicle_id,
                  vehicle_reg, profile_photo_url, created_at
           FROM mds_instructors
           WHERE ($1::text IS NULL OR status = $1)
           ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          [status ?? null, pageSize, (page - 1) * pageSize],
        );
        const { rows: count } = await client.query(
          `SELECT COUNT(*) FROM mds_instructors WHERE ($1::text IS NULL OR status=$1)`,
          [status ?? null],
        );
        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.firstName) return err(400, "firstName is required");
      if (!body.lastName) return err(400, "lastName is required");
      const { rows } = await client.query(
        `INSERT INTO mds_instructors (
           org_id,first_name,last_name,gender,dob,profile_photo_url,
           email,mobile,emergency_contact,emergency_contact_name,
           address1,address2,locality,city,district,state,pin_code,
           kyc_doc_type,kyc_doc_number,aadhaar_number,pan_number,
           dl_number,dl_issue_date,dl_expiry_date,license_type,
           marital_status,blood_group,employee_id,driving_experience,
           employment_type,has_insurance,insurance_policy_number,
           medical_conditions,safety_training_completed,permit_verified,
           certification_number,certification_authority,cert_validity_start,cert_expiry_date,
           instructor_type,assigned_vehicle_id,vehicle_reg,
           languages_taught,training_modules,driving_school_name,driving_school_reg_no,
           digital_training_consent,status,remarks
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49)
         RETURNING id, first_name, last_name, status, created_at`,
        [
          auth.user.org_id,
          body.firstName,body.lastName,body.gender??null,body.dob??null,body.profilePhotoUrl??null,
          body.email??null,body.mobile??null,body.emergencyContact??null,body.emergencyContactName??null,
          body.address1??null,body.address2??null,body.locality??null,body.city??null,body.district??null,body.state??null,body.pinCode??null,
          body.kycDocType??null,body.kycDocNumber??null,body.aadhaarNumber??null,body.panNumber??null,
          body.dlNumber??null,body.dlIssueDate??null,body.dlExpiryDate??null,body.licenseType??null,
          body.maritalStatus??null,body.bloodGroup??null,body.employeeId??null,body.drivingExperience??null,
          body.employmentType??null,body.hasInsurance??null,body.insurancePolicyNumber??null,
          body.medicalConditions??null,body.safetyTrainingCompleted??null,body.permitVerified??null,
          body.certificationNumber??null,body.certificationAuthority??null,body.certValidityStart??null,body.certExpiryDate??null,
          body.instructorType??"Instructor",body.assignedVehicleId??null,body.vehicleReg??null,
          body.languagesTaught??[],body.trainingModules??[],body.drivingSchoolName??null,body.drivingSchoolRegNo??null,
          body.digitalTrainingConsent??false,body.status??"Active",body.remarks??null,
        ],
      );
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("instructors:", e);
      if (e.code === "23505") return err(409, "Instructor with this email already exists");
      return err(500, "Server error");
    } finally { client.release(); }
  },
});
