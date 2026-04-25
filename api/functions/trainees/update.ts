import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("traineesUpdate", {
  methods: ["PUT", "OPTIONS"],
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
    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `UPDATE mds_trainees SET
           first_name      = COALESCE($1,  first_name),
           last_name       = COALESCE($2,  last_name),
           gender          = COALESCE($3,  gender),
           email           = COALESCE($4,  email),
           phone           = COALESCE($5,  phone),
           status          = COALESCE($6,  status),
           total_fee       = COALESCE($7,  total_fee),
           paid_amount     = COALESCE($8,  paid_amount),
           ll_number       = COALESCE($9,  ll_number),
           ll_issue_date   = COALESCE($10, ll_issue_date),
           dl_collected    = COALESCE($11, dl_collected),
           dl_collected_date = COALESCE($12, dl_collected_date),
           remarks         = COALESCE($13, remarks),
           updated_at      = now()
         WHERE id = $14 AND org_id = $15
         RETURNING id, first_name, last_name, status, updated_at`,
        [
          body.firstName ?? null,
          body.lastName ?? null,
          body.gender ?? null,
          body.email ?? null,
          body.phone ?? null,
          body.status ?? null,
          body.totalFee ?? null,
          body.paidAmount ?? null,
          body.llNumber ?? null,
          body.llIssueDate ?? null,
          body.dlCollected ?? null,
          body.dlCollectedDate ?? null,
          body.remarks ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (!rows[0]) return err(404, "Trainee not found");
      return ok(rows[0]);
    } catch (e) {
      ctx.error("traineesUpdate:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
