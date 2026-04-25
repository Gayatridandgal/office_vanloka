"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("devices", {
    methods: ["GET", "POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "devices",
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
                const deviceType = req.query.get("deviceType");
                const status = req.query.get("status");
                const { rows } = await client.query(`SELECT d.*, v.vehicle_number AS assigned_vehicle_number
           FROM vl_devices d
           LEFT JOIN vl_vehicles v ON v.id = d.assigned_vehicle_id
           WHERE d.org_id = $1
             AND ($2::text IS NULL OR d.device_type = $2)
             AND ($3::text IS NULL OR d.status = $3)
           ORDER BY d.created_at DESC
           LIMIT $4 OFFSET $5`, [auth.user.org_id, deviceType ?? null, status ?? null, pageSize, (page - 1) * pageSize]);
                const { rows: count } = await client.query(`SELECT COUNT(*)
           FROM vl_devices d
           WHERE d.org_id = $1
             AND ($2::text IS NULL OR d.device_type = $2)
             AND ($3::text IS NULL OR d.status = $3)`, [auth.user.org_id, deviceType ?? null, status ?? null]);
                return (0, response_1.ok)(rows, { page, pageSize, total: parseInt(count[0].count) });
            }
            // POST
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            if (!body.deviceId || !body.deviceType)
                return (0, response_1.err)(400, "deviceId and deviceType are required");
            const { rows } = await client.query(`INSERT INTO vl_devices (
           org_id, device_id, device_type, serial_number, assigned_vehicle_id, battery_percent, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [
                auth.user.org_id,
                body.deviceId,
                body.deviceType,
                body.serialNumber ?? null,
                body.assignedVehicleId ?? null,
                body.batteryPercent ?? null,
                body.status ?? "Active",
            ]);
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("devices:", e);
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
