"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("vehicles", {
    methods: ["GET", "POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "vehicles",
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
                const page = parseInt(req.query.get("page") ?? "1");
                const pageSize = Math.min(parseInt(req.query.get("pageSize") ?? "50"), 100);
                const status = req.query.get("status");
                const vehicleType = req.query.get("vehicleType");
                const search = req.query.get("search");
                const { rows } = await client.query(`SELECT id, vehicle_number, model, manufacturer, vehicle_type, year, fuel_type,
                  seating_capacity, colour, status, gps_device_id, assigned_driver,
                  insurance_expiry, fitness_expiry, pollution_expiry, permit_expiry,
                  created_at
           FROM vl_vehicles
           WHERE org_id = $1
             AND ($2::text IS NULL OR status = $2)
             AND ($3::text IS NULL OR vehicle_type = $3)
             AND ($4::text IS NULL OR
                  vehicle_number ILIKE '%' || $4 || '%' OR
                  model ILIKE '%' || $4 || '%' OR
                  assigned_driver ILIKE '%' || $4 || '%')
           ORDER BY created_at DESC
           LIMIT $5 OFFSET $6`, [auth.user.org_id, status ?? null, vehicleType ?? null, search ?? null, pageSize, (page - 1) * pageSize]);
                const { rows: count } = await client.query(`SELECT COUNT(*)
           FROM vl_vehicles
           WHERE org_id = $1
             AND ($2::text IS NULL OR status = $2)
             AND ($3::text IS NULL OR vehicle_type = $3)
             AND ($4::text IS NULL OR
                  vehicle_number ILIKE '%' || $4 || '%' OR
                  model ILIKE '%' || $4 || '%' OR
                  assigned_driver ILIKE '%' || $4 || '%')`, [auth.user.org_id, status ?? null, vehicleType ?? null, search ?? null]);
                return (0, response_1.ok)(rows, { page, pageSize, total: parseInt(count[0].count) });
            }
            // POST
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            if (!body.vehicleNumber)
                return (0, response_1.err)(400, "vehicleNumber is required");
            const { rows } = await client.query(`INSERT INTO vl_vehicles (
           org_id, vehicle_number, model, manufacturer, vehicle_type,
           year, fuel_type, seating_capacity, colour, status,
           gps_device_id, sim_number, gps_install_date, assigned_driver,
           ownership_type, owner_name, owner_contact, insurance_provider,
           insurance_policy_no, insurance_expiry, permit_type, permit_number,
           permit_issue, permit_expiry, fitness_cert_no, fitness_expiry,
           pollution_cert_no, pollution_expiry, last_service, next_service,
           km_driven, fire_extinguisher, first_aid_kit, cctv, panic_button
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32::boolean, $33::boolean, $34::boolean, $35::boolean)
         RETURNING *`, [
                auth.user.org_id,
                body.vehicleNumber,
                body.model ?? null,
                body.manufacturer ?? null,
                body.vehicleType ?? null,
                body.year ?? null,
                body.fuelType ?? null,
                body.seatingCapacity ?? null,
                body.colour ?? null,
                body.status ?? "Active",
                body.gpsDeviceId ?? null,
                body.simNumber ?? null,
                body.gpsInstallDate ?? null,
                body.assignedDriver ?? null,
                body.ownershipType ?? null,
                body.ownerName ?? null,
                body.ownerContact ?? null,
                body.insuranceProvider ?? null,
                body.insurancePolicyNo ?? null,
                body.insuranceExpiry ?? null,
                body.permitType ?? null,
                body.permitNumber ?? null,
                body.permitIssue ?? null,
                body.permitExpiry ?? null,
                body.fitnessCertNo ?? null,
                body.fitnessExpiry ?? null,
                body.pollutionCertNo ?? null,
                body.pollutionExpiry ?? null,
                body.lastService ?? null,
                body.nextService ?? null,
                body.kmDriven ?? null,
                body.fireExtinguisher ?? false,
                body.firstAidKit ?? false,
                body.cctv ?? false,
                body.panicButton ?? false,
            ]);
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("vehicles:", e);
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
