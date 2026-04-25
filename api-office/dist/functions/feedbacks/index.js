"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("feedbacks", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    route: "feedbacks",
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
            const status = req.query.get("status");
            const type = req.query.get("type");
            const rating = req.query.get("rating") ? parseInt(req.query.get("rating")) : null;
            const search = req.query.get("search");
            const { rows } = await client.query(`SELECT id, submitted_by, type, rating, message, admin_reply, status, created_at, updated_at
         FROM vl_feedbacks
         WHERE org_id = $1
           AND ($2::text IS NULL OR status = $2)
           AND ($3::text IS NULL OR type = $3)
           AND ($4::integer IS NULL OR rating = $4)
           AND ($5::text IS NULL OR
                submitted_by ILIKE '%' || $5 || '%' OR
                message ILIKE '%' || $5 || '%')
         ORDER BY created_at DESC
         LIMIT $6 OFFSET $7`, [auth.user.org_id, status ?? null, type ?? null, rating, search ?? null, pageSize, (page - 1) * pageSize]);
            const { rows: count } = await client.query(`SELECT COUNT(*)
         FROM vl_feedbacks
         WHERE org_id = $1
           AND ($2::text IS NULL OR status = $2)
           AND ($3::text IS NULL OR type = $3)
           AND ($4::integer IS NULL OR rating = $4)
           AND ($5::text IS NULL OR
                submitted_by ILIKE '%' || $5 || '%' OR
                message ILIKE '%' || $5 || '%')`, [auth.user.org_id, status ?? null, type ?? null, rating, search ?? null]);
            return (0, response_1.ok)(rows, { page, pageSize, total: parseInt(count[0].count) });
        }
        catch (e) {
            ctx.error("feedbacks:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
