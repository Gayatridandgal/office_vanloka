import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("feesCreate", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "fees",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const body: any = await req.json().catch(() => null);
    if (!body) return err(400, "Invalid request body");
    if (!body.traineeId) return err(400, "traineeId is required");
    if (!body.amount) return err(400, "amount is required");

    const client = await getPool().connect();
    try {
      await withTenant(client, auth.user.org_id);

      // Insert transaction
      const { rows } = await client.query(
        `INSERT INTO mds_fee_transactions (
           org_id, trainee_id, amount, payment_method,
           receipt_number, status, remarks, payment_date
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, amount, status, payment_date, created_at`,
        [
          auth.user.org_id,
          body.traineeId,
          body.amount,
          body.paymentMethod ?? null,
          body.receiptNumber ?? null,
          body.status ?? "Completed",
          body.remarks ?? null,
          body.paymentDate ?? new Date().toISOString().slice(0, 10),
        ],
      );

      // Update trainee paid_amount and last_payment_date
      await client.query(
        `UPDATE mds_trainees
         SET paid_amount       = paid_amount + $1,
             last_payment_date = $2,
             updated_at        = now()
         WHERE id = $3 AND org_id = $4`,
        [body.amount, body.paymentDate ?? new Date().toISOString().slice(0, 10),
          body.traineeId, auth.user.org_id],
      );

      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("feesCreate:", e);
      if (e.code === "23503") return err(404, "Trainee not found");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
