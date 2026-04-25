"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("dashboardStats", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    route: "dashboard/stats",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            const [vehicles, drivers, staff, bookings] = await Promise.all([
                client.query(`SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status='Active') AS active,
                  COUNT(*) FILTER (WHERE status='Maintenance') AS maintenance,
                  COUNT(*) FILTER (WHERE status='Inactive') AS inactive
           FROM vl_vehicles WHERE org_id = $1`, [auth.user.org_id]),
                client.query(`SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE current_status='On Duty') AS on_duty,
                  COUNT(*) FILTER (WHERE current_status='On Break') AS on_break,
                  COUNT(*) FILTER (WHERE current_status='Offline') AS offline
           FROM vl_drivers WHERE org_id = $1`, [auth.user.org_id]),
                client.query(`SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status='Active') AS active
           FROM vl_staff_members WHERE org_id = $1`, [auth.user.org_id]),
                client.query(`SELECT COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status='Confirmed') AS confirmed,
                  COUNT(*) FILTER (WHERE status='Pending') AS pending,
                  COUNT(*) FILTER (WHERE status='Cancelled') AS cancelled
           FROM vl_bookings WHERE org_id = $1`, [auth.user.org_id]),
            ]);
            return (0, response_1.ok)({
                vehicles: vehicles.rows[0],
                drivers: drivers.rows[0],
                staff: staff.rows[0],
                bookings: bookings.rows[0],
            });
        }
        catch (e) {
            ctx.error("dashboardStats:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
