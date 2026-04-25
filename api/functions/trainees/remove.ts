import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("traineesRemove", {
  methods: ["DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "trainees/{id}",
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

      const { rowCount } = await client.query(
        `DELETE FROM mds_trainees WHERE id = $1 AND org_id = $2`,
        [id, auth.user.org_id],
      );

      if (!rowCount) return err(404, "Trainee not found");
      return ok({ deleted: true });
    } catch (e) {
      ctx.error("traineesRemove:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
