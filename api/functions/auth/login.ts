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
    if (!body?.email || !body?.password)
      return err(400, "Email and password required");

    const client = await getPool().connect();
    try {
      const { rows } = await client.query(
        `SELECT id, org_id, role_name, department, access_level,
                permissions, status, login_email, login_password
         FROM mds_roles
         WHERE LOWER(login_email) = LOWER($1) AND status = 'Active'
         LIMIT 1`,
        [body.email.trim()],
      );

      const role = rows[0];
      if (!role) return err(401, "Invalid email or password");

      const valid = role.login_password?.startsWith("$2")
        ? await bcrypt.compare(body.password, role.login_password)
        : body.password === role.login_password;

      if (!valid) return err(401, "Invalid email or password");

      const permissions: string[] = role.permissions ?? [];
      const isOwner =
        role.access_level === "Root Access" || permissions.length >= 20;

      const token = signToken({
        sub: role.id,
        email: role.login_email,
        org_id: role.org_id,
        role_name: role.role_name,
        permissions: isOwner ? ["*"] : permissions,
        access_level: role.access_level,
        is_owner: isOwner,
      });

      return ok({
        token,
        user: {
          name: role.role_name,
          email: role.login_email,
          orgId: role.org_id,
          permissions: isOwner ? ["*"] : permissions,
          accessLevel: role.access_level,
          isOwner,
        },
      });
    } catch (e) {
      ctx.error("authLogin:", e);
      return err(500, "Server error");
    } finally {
      client.release();
    }
  },
});
