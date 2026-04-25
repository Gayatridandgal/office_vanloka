import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("feesList", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "fees",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const page = parseInt(req.query.get("page") ?? "1");
    const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
    const traineeId = req.query.get("traineeId");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      const { rows } = await client.query(
        `SELECT
           f.id, f.amount, f.payment_method, f.receipt_number,
           f.status, f.remarks, f.payment_date, f.created_at,
           f.trainee_id,
           t.first_name || ' ' || t.last_name AS trainee_name
         FROM mds_fee_transactions f
         JOIN mds_trainees t ON t.id = f.trainee_id
         WHERE f.org_id = $1
           AND ($2::uuid IS NULL OR f.trainee_id = $2::uuid)
         ORDER BY f.payment_date DESC
         LIMIT $3 OFFSET $4`,
        [
          auth.user.org_id,
          traineeId ?? null,
          pageSize,
          (page - 1) * pageSize,
        ],
      );

      const { rows: count } = await client.query(
        `SELECT COUNT(*) FROM mds_fee_transactions
         WHERE org_id = $1 AND ($2::uuid IS NULL OR trainee_id = $2::uuid)`,
        [auth.user.org_id, traineeId ?? null],
      );

      return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
    } catch (e) {
      ctx.error("feesList:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
