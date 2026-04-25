"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preflight = exports.err = exports.ok = void 0;
const cors = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
};
const ok = (data, meta) => ({
    status: 200,
    headers: cors,
    body: JSON.stringify({
        success: true,
        data,
        meta: meta ?? null,
        error: null,
    }),
});
exports.ok = ok;
const err = (status, message) => ({
    status,
    headers: cors,
    body: JSON.stringify({ success: false, data: null, error: { message } }),
});
exports.err = err;
const preflight = () => ({
    status: 204,
    headers: cors,
    body: "",
});
exports.preflight = preflight;
