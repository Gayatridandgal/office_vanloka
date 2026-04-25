import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("instructorsList", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "instructors",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const page = parseInt(req.query.get("page") ?? "1");
    const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
    const status = req.query.get("status");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `SELECT id, first_name, last_name, gender, email, mobile,
                dl_number, dl_expiry_date, license_type,
                instructor_type, status, rating, sessions_count,
                assigned_vehicle_id, vehicle_reg,
                profile_photo_url, created_at
         FROM mds_instructors
         WHERE ($1::text IS NULL OR status = $1)
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [status ?? null, pageSize, (page - 1) * pageSize],
      );

      const { rows: count } = await client.query(
        `SELECT COUNT(*) FROM mds_instructors
         WHERE ($1::text IS NULL OR status = $1)`,
        [status ?? null],
      );

      return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
    } catch (e) {
      ctx.error("instructorsList:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
