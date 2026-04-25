import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getPool, withTenant } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth } from "../../shared/auth";

app.http("travellersById", {
  methods: ["PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "travellers/{id}",
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

      if (req.method === "DELETE") {
        const { rowCount } = await client.query(
          `DELETE FROM vl_travellers WHERE id = $1 AND org_id = $2`,
          [id, auth.user.org_id],
        );
        if (rowCount === 0) return err(404, "Not found");
        return ok({ deleted: true });
      }

      // PUT
      const body: any = await req.json().catch(() => null);
      if (!body) return err(400, "Invalid request body");

      const { rows } = await client.query(
        `UPDATE vl_travellers SET
           first_name     = COALESCE($1, first_name),
           last_name      = COALESCE($2, last_name),
           gender         = COALESCE($3, gender),
           email          = COALESCE($4, email),
           phone          = COALESCE($5, phone),
           profile_photo  = COALESCE($6, profile_photo),
           route          = COALESCE($7, route),
           boarding_point = COALESCE($8, boarding_point),
           beacon_id      = COALESCE($9, beacon_id),
           status         = COALESCE($10, status),
           updated_at     = NOW()
         WHERE id = $11 AND org_id = $12
         RETURNING *`,
        [
          body.firstName ?? null,
          body.lastName ?? null,
          body.gender ?? null,
          body.email ?? null,
          body.phone ?? null,
          body.profilePhoto ?? null,
          body.route ?? null,
          body.boardingPoint ?? null,
          body.beaconId ?? null,
          body.status ?? null,
          id,
          auth.user.org_id,
        ],
      );

      if (rows.length === 0) return err(404, "Not found");
      return ok(rows[0]);
    } catch (e: any) {
      ctx.error("travellersById:", e);
      if (e.code === "23505") return err(409, "Record already exists");
      if (e.code === "23503") return err(404, "Related record not found");
      if (e.code === "23502") return err(400, "Required field missing");
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
