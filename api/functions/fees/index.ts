import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

// GET  /api/fees
// POST /api/fees
app.http("fees", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "fees",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();
    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);
    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);
      if (req.method === "GET") {
        const page = parseInt(req.query.get("page") ?? "1");
        const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
        const traineeId = req.query.get("traineeId");
        const { rows } = await client.query(
          `SELECT f.id, f.amount, f.payment_method, f.receipt_number,
                  f.status, f.remarks, f.payment_date, f.created_at,
                  f.trainee_id, t.first_name || ' ' || t.last_name AS trainee_name
           FROM mds_fee_transactions f
           JOIN mds_trainees t ON t.id = f.trainee_id
           WHERE f.org_id=$1 AND ($2::uuid IS NULL OR f.trainee_id=$2::uuid)
           ORDER BY f.payment_date DESC LIMIT $3 OFFSET $4`,
          [auth.user.org_id, traineeId??null, pageSize, (page-1)*pageSize],
        );
        const { rows: count } = await client.query(
          `SELECT COUNT(*) FROM mds_fee_transactions
           WHERE org_id=$1 AND ($2::uuid IS NULL OR trainee_id=$2::uuid)`,
          [auth.user.org_id, traineeId??null],
        );
        return ok(rows, { page, pageSize, total: parseInt(count[0].count) });
      }
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");
      if (!body.traineeId) return err(400, "traineeId is required");
      if (!body.amount) return err(400, "amount is required");
      const { rows } = await client.query(
        `INSERT INTO mds_fee_transactions (
           org_id,trainee_id,amount,payment_method,receipt_number,status,remarks,payment_date
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, amount, status, payment_date, created_at`,
        [
          auth.user.org_id, body.traineeId, body.amount, body.paymentMethod??null,
          body.receiptNumber??null, body.status??"Completed", body.remarks??null,
          body.paymentDate ?? new Date().toISOString().slice(0, 10),
        ],
      );
      await client.query(
        `UPDATE mds_trainees SET paid_amount=paid_amount+$1, last_payment_date=$2, updated_at=now()
         WHERE id=$3 AND org_id=$4`,
        [body.amount, body.paymentDate ?? new Date().toISOString().slice(0, 10), body.traineeId, auth.user.org_id],
      );
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("fees:", e);
      if (e.code === "23503") return err(404, "Trainee not found");
      return err(500, "Server error");
    } finally { client.release(); }
  },
});
