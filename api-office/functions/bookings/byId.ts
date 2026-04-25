import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("bookingsById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "bookings/{id}",
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
          `DELETE FROM vl_bookings WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_bookings SET
           traveller_id = COALESCE($1, traveller_id),
           vehicle_id   = COALESCE($2, vehicle_id),
           driver_id    = COALESCE($3, driver_id),
           route        = COALESCE($4, route),
           booking_date = COALESCE($5, booking_date),
           pickup_point = COALESCE($6, pickup_point),
           status       = COALESCE($7, status),
           remarks      = COALESCE($8, remarks),
           updated_at   = NOW()
         WHERE id = $9 AND org_id = $10
         RETURNING *`,
        [
          body.travellerId ?? null,
          body.vehicleId ?? null,
          body.driverId ?? null,
          body.route ?? null,
          body.bookingDate ?? null,
          body.pickupPoint ?? null,
          body.status ?? null,
          body.remarks ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("bookingsById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
