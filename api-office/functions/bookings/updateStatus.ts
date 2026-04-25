import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("bookingsUpdateStatus", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "bookings/{id}/status",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const body: any = await req.json().catch(() => null);
    if (!body || !body.status) return err(400, "status is required");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE vl_bookings SET status = $1, updated_at = NOW()
         WHERE id = $2 AND org_id = $3
         RETURNING id, status, updated_at`,
        [body.status, id, auth.user.org_id],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("bookingsUpdateStatus:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
