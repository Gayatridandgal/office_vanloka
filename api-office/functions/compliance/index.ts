import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("compliance", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "compliance",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      if (req.method === "GET") {
        const page = parseInt(req.query.get("page") ?? "1");
        const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
        const entityType = req.query.get("entityType");
        const status = req.query.get("status");
        const search = req.query.get("search");

        const { rows } = await client.query(
          `SELECT c.*,
             CASE c.entity_type
               WHEN 'vehicle' THEN (SELECT vehicle_number FROM vl_vehicles WHERE id = c.entity_id)
               WHEN 'driver' THEN (SELECT first_name || ' ' || last_name FROM vl_drivers WHERE id = c.entity_id)
             END AS entity_name,
             (c.expiry_date - CURRENT_DATE) AS days_until_expiry
           FROM vl_compliance c
           WHERE c.org_id = $1
             AND ($2::text IS NULL OR c.entity_type = $2)
             AND ($3::text IS NULL OR c.status = $3)
             AND ($4::text IS NULL OR c.document_type ILIKE '%' || $4 || '%')
           ORDER BY c.expiry_date ASC
           LIMIT $5 OFFSET $6`,
          [auth.user.org_id, entityType ?? null, status ?? null, search ?? null, pageSize, (page - 1) * pageSize],
        );

        const { rows: count } = await client.query(
          `SELECT COUNT(*)
           FROM vl_compliance c
           WHERE c.org_id = $1
             AND ($2::text IS NULL OR c.entity_type = $2)
             AND ($3::text IS NULL OR c.status = $3)
             AND ($4::text IS NULL OR c.document_type ILIKE '%' || $4 || '%')`,
          [auth.user.org_id, entityType ?? null, status ?? null, search ?? null],
        );

        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }

      // POST
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `INSERT INTO vl_compliance (
           org_id, entity_type, entity_id, document_type, document_number,
           issue_date, expiry_date, status, document_url, remarks
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          auth.user.org_id,
          body.entityType ?? null,
          body.entityId ?? null,
          body.documentType ?? null,
          body.documentNumber ?? null,
          body.issueDate ?? null,
          body.expiryDate ?? null,
          body.status ?? "Valid",
          body.documentUrl ?? null,
          body.remarks ?? null,
        ],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("compliance:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
