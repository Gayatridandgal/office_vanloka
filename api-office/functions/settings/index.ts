import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("settings", {
  methods: ["GET", "PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "settings",
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
        const { rows } = await client.query(
          `SELECT * FROM vl_organizations WHERE id = $1`,
          [auth.user.org_id],
        );
        if (rows.length === 0) return err(404, "Organization not found");
        return ok(rows[0]);
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_organizations
         SET name          = COALESCE($1, name),
             logo_url      = COALESCE($2, logo_url),
             address       = COALESCE($3, address),
             contact_phone = COALESCE($4, contact_phone),
             contact_email = COALESCE($5, contact_email),
             settings      = COALESCE($6::jsonb, settings),
             updated_at    = NOW()
         WHERE id = $7
         RETURNING *`,
        [
          body.name ?? null,
          body.logoUrl ?? null,
          body.address ?? null,
          body.contactPhone ?? null,
          body.contactEmail ?? null,
          body.settings ? JSON.stringify(body.settings) : null,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Organization not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("settings:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
