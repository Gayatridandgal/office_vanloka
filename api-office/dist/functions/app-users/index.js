"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("appUsers", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    route: "app-users",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            const page = parseInt(req.query.get("page") ?? "1");
            const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
            const role = req.query.get("role");
            const status = req.query.get("status");
            const { rows } = await client.query(`SELECT id, name, phone, email, role, linked_entity_type,
                linked_entity_id, last_active, status, created_at
         FROM vl_app_users
         WHERE org_id = $1
           AND ($2::text IS NULL OR role = $2)
           AND ($3::text IS NULL OR status = $3)
         ORDER BY created_at DESC
         LIMIT $4 OFFSET $5`, [auth.user.org_id, role ?? null, status ?? null, pageSize, (page - 1) * pageSize]);
            const { rows: count } = await client.query(`SELECT COUNT(*)
         FROM vl_app_users
         WHERE org_id = $1
           AND ($2::text IS NULL OR role = $2)
           AND ($3::text IS NULL OR status = $3)`, [auth.user.org_id, role ?? null, status ?? null]);
            return (0, response_1.ok)(rows, { page, pageSize, total: parseInt(count[0].count) });
        }
        catch (e) {
            ctx.error("appUsers:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
