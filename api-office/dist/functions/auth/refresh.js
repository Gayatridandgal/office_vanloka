"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("authRefresh", {
    methods: ["POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "auth/refresh",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const token = (0, auth_1.signToken)({
            sub: auth.user.sub,
            email: auth.user.email,
            org_id: auth.user.org_id,
            role_name: auth.user.role_name,
            permissions: auth.user.permissions,
            access_level: auth.user.access_level,
            is_owner: auth.user.is_owner,
        });
        return (0, response_1.ok)({ token });
    },
});
