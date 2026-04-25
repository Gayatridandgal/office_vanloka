"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("devicesById", {
    methods: ["PUT", "DELETE", "OPTIONS"],
    authLevel: "anonymous",
    route: "devices/{id}",
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
                const { rowCount } = await client.query(`DELETE FROM vl_devices WHERE id = $1 AND org_id = $2`, [id, auth.user.org_id]);
                if (rowCount === 0)
                    return (0, response_1.err)(404, "Not found");
                return (0, response_1.ok)({ deleted: true });
            }
            // PUT
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            const { rows } = await client.query(`UPDATE vl_devices SET
           device_id           = COALESCE($1, device_id),
           device_type         = COALESCE($2, device_type),
           serial_number       = COALESCE($3, serial_number),
           assigned_vehicle_id = COALESCE($4, assigned_vehicle_id),
           battery_percent     = COALESCE($5, battery_percent),
           status              = COALESCE($6, status),
           updated_at          = NOW()
         WHERE id = $7 AND org_id = $8
         RETURNING *`, [
                body.deviceId ?? null,
                body.deviceType ?? null,
                body.serialNumber ?? null,
                body.assignedVehicleId ?? null,
                body.batteryPercent ?? null,
                body.status ?? null,
                id,
                auth.user.org_id,
            ]);
            if (rows.length === 0)
                return (0, response_1.err)(404, "Not found");
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("devicesById:", e);
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
