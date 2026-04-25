import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("feedbacksById", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "feedbacks/{id}",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE vl_feedbacks
         SET admin_reply = COALESCE($1, admin_reply),
             status = COALESCE($2, status),
             updated_at = NOW()
         WHERE id = $3 AND org_id = $4
         RETURNING *`,
        [body.adminReply ?? null, body.status ?? null, id, auth.user.org_id],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("feedbacksById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
