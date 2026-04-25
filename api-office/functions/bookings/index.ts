import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("bookings", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "bookings",
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
        const dateFrom = req.query.get("dateFrom");
        const dateTo = req.query.get("dateTo");
        const search = req.query.get("search");

        const { rows } = await client.query(
          `SELECT b.id, b.route, b.booking_date, b.pickup_point, b.status, b.remarks,
                  b.created_at,
                  b.traveller_id, t.first_name || ' ' || t.last_name AS traveller_name,
                  b.vehicle_id, v.vehicle_number,
                  b.driver_id, d.first_name || ' ' || d.last_name AS driver_name
           FROM vl_bookings b
           LEFT JOIN vl_travellers t ON t.id = b.traveller_id
           LEFT JOIN vl_vehicles v ON v.id = b.vehicle_id
           LEFT JOIN vl_drivers d ON d.id = b.driver_id
           WHERE b.org_id = $1
             AND ($2::text IS NULL OR b.status = $2)
             AND ($3::date IS NULL OR b.booking_date >= $3)
             AND ($4::date IS NULL OR b.booking_date <= $4)
             AND ($5::text IS NULL OR
                  t.first_name ILIKE '%' || $5 || '%' OR
                  t.last_name ILIKE '%' || $5 || '%' OR
                  v.vehicle_number ILIKE '%' || $5 || '%')
           ORDER BY b.booking_date DESC, b.created_at DESC
           LIMIT $6 OFFSET $7`,
          [auth.user.org_id, status ?? null, dateFrom ?? null, dateTo ?? null, search ?? null, pageSize, (page - 1) * pageSize],
        );

        const { rows: count } = await client.query(
          `SELECT COUNT(*)
           FROM vl_bookings b
           LEFT JOIN vl_travellers t ON t.id = b.traveller_id
           LEFT JOIN vl_vehicles v ON v.id = b.vehicle_id
           WHERE b.org_id = $1
             AND ($2::text IS NULL OR b.status = $2)
             AND ($3::date IS NULL OR b.booking_date >= $3)
             AND ($4::date IS NULL OR b.booking_date <= $4)
             AND ($5::text IS NULL OR
                  t.first_name ILIKE '%' || $5 || '%' OR
                  t.last_name ILIKE '%' || $5 || '%' OR
                  v.vehicle_number ILIKE '%' || $5 || '%')`,
          [auth.user.org_id, status ?? null, dateFrom ?? null, dateTo ?? null, search ?? null],
        );

        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }

      // POST
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `INSERT INTO vl_bookings (
           org_id, traveller_id, vehicle_id, driver_id, route, booking_date, pickup_point, status, remarks
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          auth.user.org_id,
          body.travellerId ?? null,
          body.vehicleId ?? null,
          body.driverId ?? null,
          body.route ?? null,
          body.bookingDate ?? null,
          body.pickupPoint ?? null,
          body.status ?? "Pending",
          body.remarks ?? null,
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("bookings:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
