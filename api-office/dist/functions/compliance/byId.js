"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("complianceById", {
    methods: ["PUT", "DELETE", "OPTIONS"],
    authLevel: "anonymous",
    route: "compliance/{id}",
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
                const { rowCount } = await client.query(`DELETE FROM vl_compliance WHERE id = $1 AND org_id = $2`, [id, auth.user.org_id]);
                if (rowCount === 0)
                    return (0, response_1.err)(404, "Not found");
                return (0, response_1.ok)({ deleted: true });
            }
            // PUT
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            const { rows } = await client.query(`UPDATE vl_compliance SET
           entity_type     = COALESCE($1, entity_type),
           entity_id       = COALESCE($2, entity_id),
           document_type   = COALESCE($3, document_type),
           document_number = COALESCE($4, document_number),
           issue_date      = COALESCE($5, issue_date),
           expiry_date     = COALESCE($6, expiry_date),
           status          = COALESCE($7, status),
           document_url    = COALESCE($8, document_url),
           remarks         = COALESCE($9, remarks),
           updated_at      = NOW()
         WHERE id = $10 AND org_id = $11
         RETURNING *`, [
                body.entityType ?? null,
                body.entityId ?? null,
                body.documentType ?? null,
                body.documentNumber ?? null,
                body.issueDate ?? null,
                body.expiryDate ?? null,
                body.status ?? null,
                body.documentUrl ?? null,
                body.remarks ?? null,
                id,
                auth.user.org_id,
            ]);
            if (rows.length === 0)
                return (0, response_1.err)(404, "Not found");
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("complianceById:", e);
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
