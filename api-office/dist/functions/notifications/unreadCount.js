"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("notificationsUnreadCount", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    route: "notifications/unread-count",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            const { rows } = await client.query(`SELECT COUNT(*) AS count FROM vl_notifications
         WHERE org_id = $1 AND is_read = FALSE`, [auth.user.org_id]);
            return (0, response_1.ok)({ unreadCount: parseInt(rows[0].count) });
        }
        catch (e) {
            ctx.error("notificationsUnreadCount:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
