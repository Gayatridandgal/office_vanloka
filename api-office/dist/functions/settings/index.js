"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("settings", {
    methods: ["GET", "PUT", "OPTIONS"],
    authLevel: "anonymous",
    route: "settings",
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
                const { rows } = await client.query(`SELECT * FROM vl_organizations WHERE id = $1`, [auth.user.org_id]);
                if (rows.length === 0)
                    return (0, response_1.err)(404, "Organization not found");
                return (0, response_1.ok)(rows[0]);
            }
            // PUT
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            const { rows } = await client.query(`UPDATE vl_organizations
         SET name          = COALESCE($1, name),
             logo_url      = COALESCE($2, logo_url),
             address       = COALESCE($3, address),
             contact_phone = COALESCE($4, contact_phone),
             contact_email = COALESCE($5, contact_email),
             settings      = COALESCE($6::jsonb, settings),
             updated_at    = NOW()
         WHERE id = $7
         RETURNING *`, [
                body.name ?? null,
                body.logoUrl ?? null,
                body.address ?? null,
                body.contactPhone ?? null,
                body.contactEmail ?? null,
                body.settings ? JSON.stringify(body.settings) : null,
                auth.user.org_id,
            ]);
            if (rows.length === 0)
                return (0, response_1.err)(404, "Organization not found");
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("settings:", e);
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
