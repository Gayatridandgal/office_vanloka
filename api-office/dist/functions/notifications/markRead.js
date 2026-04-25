"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
// Route: PUT /notifications/read-all
functions_1.app.http("notificationsReadAll", {
    methods: ["PUT", "OPTIONS"],
    authLevel: "anonymous",
    route: "notifications/read-all",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            const result = await client.query(`UPDATE vl_notifications SET is_read = TRUE
         WHERE org_id = $1 AND is_read = FALSE`, [auth.user.org_id]);
            return (0, response_1.ok)({ updated: result.rowCount });
        }
        catch (e) {
            ctx.error("notificationsReadAll:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
// Route: PUT /notifications/{id}/read
functions_1.app.http("notificationsMarkRead", {
    methods: ["PUT", "OPTIONS"],
    authLevel: "anonymous",
    route: "notifications/{id}/read",
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
            const { rows } = await client.query(`UPDATE vl_notifications SET is_read = TRUE
         WHERE id = $1 AND org_id = $2
         RETURNING id, is_read`, [id, auth.user.org_id]);
            if (rows.length === 0)
                return (0, response_1.err)(404, "Not found");
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("notificationsMarkRead:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
