import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("sessionsUpdateStatus", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  route: "sessions/{id}/status",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const id = req.params.id;
    const body: any = await req.json().catch(() => null);
    if (!body?.status) return err(400, "status is required");

    const allowed = ["Scheduled", "In Progress", "Completed", "Cancelled"];
    if (!allowed.includes(body.status)) {
      return err(400, `status must be one of: ${allowed.join(", ")}`);
    }

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE mds_training_sessions
         SET status = $1, remarks = COALESCE($2, remarks), updated_at = now()
         WHERE id = $3 AND org_id = $4
         RETURNING id, status, updated_at`,
        [body.status, body.remarks ?? null, id, auth.user.org_id],
      );

      if (!rows[0]) return err(404, "Session not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("sessionsUpdateStatus:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
