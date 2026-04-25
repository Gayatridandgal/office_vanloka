"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("bookingsById", {
    methods: ["PUT", "DELETE", "OPTIONS"],
    authLevel: "anonymous",
    route: "bookings/{id}",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const id = req.params.id;
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            if (req.method === "DELETE") {
                const { rowCount } = await client.query(`DELETE FROM vl_bookings WHERE id = $1 AND org_id = $2`, [id, auth.user.org_id]);
                if (rowCount === 0)
                    return (0, response_1.err)(404, "Not found");
                return (0, response_1.ok)({ deleted: true });
            }
            // PUT
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            const { rows } = await client.query(`UPDATE vl_bookings SET
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
         RETURNING *`, [
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
            ]);
            if (rows.length === 0)
                return (0, response_1.err)(404, "Not found");
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("bookingsById:", e);
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
