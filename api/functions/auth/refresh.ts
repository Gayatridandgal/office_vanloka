import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { ok, err, preflight } from "../../shared/response";
import { requireAuth, signToken } from "../../shared/auth";

app.http("authRefresh", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "auth/refresh",
  handler: async (
    req: HttpRequest,
    _ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const auth = requireAuth(req);
    if ("error" in auth) return err(401, auth.error);

    const newToken = signToken({
      sub: auth.user.sub,
      email: auth.user.email,
      org_id: auth.user.org_id,
      role_name: auth.user.role_name,
      permissions: auth.user.permissions,
      access_level: auth.user.access_level,
      is_owner: auth.user.is_owner,
    });

    return ok({ token: newToken });
  },
});
