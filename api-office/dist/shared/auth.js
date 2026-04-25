"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.requireAuth = requireAuth;
exports.hasPermission = hasPermission;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? "86400"),
    });
}
function requireAuth(req) {
    try {
        const header = req.headers.get("Authorization") ?? "";
        if (!header.startsWith("Bearer "))
            return { error: "Missing token" };
        const token = header.replace("Bearer ", "");
        const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
        return { user };
    }
    catch (e) {
        return {
            error: e instanceof Error && e.message === "jwt expired"
                ? "Session expired"
                : "Invalid token",
        };
    }
}
function hasPermission(user, permission) {
    if (user.is_owner)
        return true;
    if (user.permissions.includes("*"))
        return true;
    return user.permissions.includes(permission);
}
