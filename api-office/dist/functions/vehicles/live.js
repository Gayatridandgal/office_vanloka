"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("vehiclesLive", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    route: "vehicles/live",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            const { rows } = await client.query(`SELECT DISTINCT ON (t.vehicle_id)
           t.vehicle_id, t.lat, t.lng, t.speed, t.heading, t.status, t.driver_name,
           t.recorded_at, v.vehicle_number, v.model
         FROM vl_vehicle_telemetry t
         JOIN vl_vehicles v ON v.id = t.vehicle_id
         WHERE t.org_id = $1
         ORDER BY t.vehicle_id, t.recorded_at DESC`, [auth.user.org_id]);
            return (0, response_1.ok)(rows);
        }
        catch (e) {
            ctx.error("vehiclesLive:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
