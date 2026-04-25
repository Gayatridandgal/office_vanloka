import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("complianceById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "compliance/{id}",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      if (req.method === "DELETE") {
        const { rowCount } = await client.query(
          `DELETE FROM vl_compliance WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_compliance SET
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
         RETURNING *`,
        [
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
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("complianceById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
