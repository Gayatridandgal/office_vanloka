import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import bcrypt from "bcryptjs";
import { getPool } from "../../shared/db";
import { ok, err, preflight } from "../../shared/response";
import { signToken } from "../../shared/auth";

app.http("authLogin", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const body = (await req.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;
    if (!body?.email || !body?.password) {
      return err(400, "Email and password required");
    }

    const client = await getPool().connect();
    try {
      const { rows } = await client.query(
        `SELECT id, org_id, role_name, login_email, login_password,
                access_level, permissions, status
         FROM vl_roles
         WHERE login_email = $1 AND status = 'Active'
         LIMIT 1`,
        [body.email.trim()],
      );

      const role = rows[0];
      if (!role) return err(401, "Invalid credentials");

      const valid = await bcrypt.compare(body.password, role.login_password);
      if (!valid) return err(401, "Invalid credentials");

      const permissions: string[] = role.permissions || [];
      const accessLevel = role.access_level;
      const isOwner = accessLevel === "Root Access";

      const token = signToken({
        sub: role.id,
        email: role.login_email,
        org_id: role.org_id,
        role_name: role.role_name,
        permissions: permissions,
        access_level: accessLevel,
        is_owner: isOwner,
      });

      return ok({
        token,
        user: {
          id: role.id,
          email: role.login_email,
          orgId: role.org_id,
          roleName: role.role_name,
          permissions: permissions,
          accessLevel: accessLevel,
          isOwner,
        },
      });
    } catch (e: any) {
      ctx.error("authLogin:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
