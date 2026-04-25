import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("vendorsById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "vendors/{id}",
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
          `DELETE FROM vl_vendors WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_vendors SET
           name            = COALESCE($1, name),
           service_type    = COALESCE($2, service_type),
           contact_name    = COALESCE($3, contact_name),
           contact_phone   = COALESCE($4, contact_phone),
           contact_email   = COALESCE($5, contact_email),
           contract_status = COALESCE($6, contract_status),
           contract_start  = COALESCE($7, contract_start),
           contract_end    = COALESCE($8, contract_end),
           remarks         = COALESCE($9, remarks),
           updated_at      = NOW()
         WHERE id = $10 AND org_id = $11
         RETURNING *`,
        [
          body.name ?? null,
          body.serviceType ?? null,
          body.contactName ?? null,
          body.contactPhone ?? null,
          body.contactEmail ?? null,
          body.contractStatus ?? null,
          body.contractStart ?? null,
          body.contractEnd ?? null,
          body.remarks ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("vendorsById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
