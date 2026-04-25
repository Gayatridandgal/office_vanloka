"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("roles", {
    methods: ["GET", "POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "roles",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            if (req.method === "GET") {
                const status = req.query.get("status");
                const { rows } = await client.query(`SELECT id, role_name, department, access_level, description, permissions, status, login_email, created_at
           FROM vl_roles
           WHERE org_id = $1 AND ($2::text IS NULL OR status = $2)
           ORDER BY role_name ASC`, [auth.user.org_id, status ?? null]);
                return (0, response_1.ok)(rows);
            }
            // POST
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            if (!body.roleName)
                return (0, response_1.err)(400, "roleName is required");
            let hashedPassword = null;
            if (body.loginPassword) {
                const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
                hashedPassword = await bcrypt.hash(body.loginPassword, 10);
            }
            const { rows } = await client.query(`INSERT INTO vl_roles (
           org_id, role_name, department, access_level, description, permissions, status, login_email, login_password
         ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
         RETURNING id, role_name, department, access_level, description, permissions, status, login_email, created_at`, [
                auth.user.org_id,
                body.roleName,
                body.department ?? null,
                body.accessLevel ?? "Partial Access",
                body.description ?? null,
                JSON.stringify(body.permissions ?? []),
                body.status ?? "Active",
                body.loginEmail ?? null,
                hashedPassword,
            ]);
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("roles:", e);
            if (e.code === "23505")
                return (0, response_1.err)(409, "Record already exists");
            if (e.code === "23503")
                return (0, response_1.err)(404, "Related record not found");
            if (e.code === "23502")
                return (0, response_1.err)(400, "Required field missing");
            return (0, response_1.err)(500, "Server error");
        }
        finally {
            client.release();
        }
    },
});
