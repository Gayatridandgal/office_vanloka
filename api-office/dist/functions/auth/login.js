"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("authLogin", {
    methods: ["POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "auth/login",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const body = (await req.json().catch(() => null));
        if (!body?.email || !body?.password) {
            return (0, response_1.err)(400, "Email and password required");
        }
        const client = await (0, db_1.getPool)().connect();
        try {
            const { rows } = await client.query(`SELECT id, org_id, role_name, login_email, login_password,
                access_level, permissions, status
         FROM vl_roles
         WHERE login_email = $1 AND status = 'Active'
         LIMIT 1`, [body.email.trim()]);
            const role = rows[0];
            if (!role)
                return (0, response_1.err)(401, "Invalid credentials");
            const valid = await bcryptjs_1.default.compare(body.password, role.login_password);
            if (!valid)
                return (0, response_1.err)(401, "Invalid credentials");
            const permissions = role.permissions || [];
            const accessLevel = role.access_level;
            const isOwner = accessLevel === "Root Access";
            const token = (0, auth_1.signToken)({
                sub: role.id,
                email: role.login_email,
                org_id: role.org_id,
                role_name: role.role_name,
                permissions: permissions,
                access_level: accessLevel,
                is_owner: isOwner,
            });
            return (0, response_1.ok)({
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
        }
        catch (e) {
            ctx.error("authLogin:", e);
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
