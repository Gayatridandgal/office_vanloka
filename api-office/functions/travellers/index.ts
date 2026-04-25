import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("travellers", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "travellers",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
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
        const route = req.query.get("route");
        const search = req.query.get("search");

        const { rows } = await client.query(
          `SELECT id, first_name, last_name, gender, email, phone,
                  route, boarding_point, beacon_id, status, created_at
           FROM vl_travellers
           WHERE org_id = $1
             AND ($2::text IS NULL OR status = $2)
             AND ($3::text IS NULL OR route = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  phone ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%')
           ORDER BY created_at DESC
           LIMIT $5 OFFSET $6`,
          [auth.user.org_id, status ?? null, route ?? null, search ?? null, pageSize, (page - 1) * pageSize],
        );

        const { rows: count } = await client.query(
          `SELECT COUNT(*)
           FROM vl_travellers
           WHERE org_id = $1
             AND ($2::text IS NULL OR status = $2)
             AND ($3::text IS NULL OR route = $3)
             AND ($4::text IS NULL OR
                  first_name ILIKE '%' || $4 || '%' OR
                  last_name ILIKE '%' || $4 || '%' OR
                  phone ILIKE '%' || $4 || '%' OR
                  email ILIKE '%' || $4 || '%')`,
          [auth.user.org_id, status ?? null, route ?? null, search ?? null],
        );

        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }

      // POST
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.firstName || !body.lastName) return err(400, "firstName and lastName are required");

      const { rows } = await client.query(
        `INSERT INTO vl_travellers (
           org_id, first_name, last_name, gender, email, phone,
           profile_photo, route, boarding_point, beacon_id, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          auth.user.org_id,
          body.firstName,
          body.lastName,
          body.gender ?? null,
          body.email ?? null,
          body.phone ?? null,
          body.profilePhoto ?? null,
          body.route ?? null,
          body.boardingPoint ?? null,
          body.beaconId ?? null,
          body.status ?? "Active",
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("travellers:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
