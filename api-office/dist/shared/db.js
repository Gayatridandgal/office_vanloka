"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.withTenant = withTenant;
const pg_1 = require("pg");
let _pool = null;
function getPool() {
    if (!_pool) {
        _pool = new pg_1.Pool({
            host: process.env.PG_HOST,
            port: parseInt(process.env.PG_PORT || "5432"),
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
            ssl: { rejectUnauthorized: false },
            max: 5,
        });
    }
    return _pool;
}
async function withTenant(client, orgId) {
    await client.query(`SET LOCAL app.current_org_id = ${orgId}`);
}
