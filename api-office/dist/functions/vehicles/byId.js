"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const db_1 = require("../../shared/db");
const response_1 = require("../../shared/response");
const auth_1 = require("../../shared/auth");
functions_1.app.http("vehiclesById", {
    methods: ["PUT", "DELETE", "OPTIONS"],
    authLevel: "anonymous",
    route: "vehicles/{id}",
    handler: async (req, ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const auth = (0, auth_1.requireAuth)(req);
        if ("error" in auth)
            return (0, response_1.err)(401, auth.error);
        const id = req.params.id;
        const client = await (0, db_1.getPool)().connect();
        try {
            await (0, db_1.withTenant)(client, auth.user.org_id);
            if (req.method === "DELETE") {
                const { rowCount } = await client.query(`DELETE FROM vl_vehicles WHERE id = $1 AND org_id = $2`, [id, auth.user.org_id]);
                if (rowCount === 0)
                    return (0, response_1.err)(404, "Not found");
                return (0, response_1.ok)({ deleted: true });
            }
            // PUT
            const body = await req.json().catch(() => null);
            if (!body)
                return (0, response_1.err)(400, "Invalid request body");
            const { rows } = await client.query(`UPDATE vl_vehicles SET
           vehicle_number      = COALESCE($1, vehicle_number),
           model               = COALESCE($2, model),
           manufacturer        = COALESCE($3, manufacturer),
           vehicle_type        = COALESCE($4, vehicle_type),
           year                = COALESCE($5, year),
           fuel_type           = COALESCE($6, fuel_type),
           seating_capacity    = COALESCE($7, seating_capacity),
           colour              = COALESCE($8, colour),
           status              = COALESCE($9, status),
           gps_device_id       = COALESCE($10, gps_device_id),
           sim_number          = COALESCE($11, sim_number),
           gps_install_date    = COALESCE($12, gps_install_date),
           assigned_driver     = COALESCE($13, assigned_driver),
           ownership_type      = COALESCE($14, ownership_type),
           owner_name          = COALESCE($15, owner_name),
           owner_contact       = COALESCE($16, owner_contact),
           insurance_provider  = COALESCE($17, insurance_provider),
           insurance_policy_no = COALESCE($18, insurance_policy_no),
           insurance_expiry    = COALESCE($19, insurance_expiry),
           permit_type         = COALESCE($20, permit_type),
           permit_number       = COALESCE($21, permit_number),
           permit_issue        = COALESCE($22, permit_issue),
           permit_expiry       = COALESCE($23, permit_expiry),
           fitness_cert_no     = COALESCE($24, fitness_cert_no),
           fitness_expiry      = COALESCE($25, fitness_expiry),
           pollution_cert_no   = COALESCE($26, pollution_cert_no),
           pollution_expiry    = COALESCE($27, pollution_expiry),
           last_service        = COALESCE($28, last_service),
           next_service        = COALESCE($29, next_service),
           km_driven           = COALESCE($30, km_driven),
           fire_extinguisher   = COALESCE($31::boolean, fire_extinguisher),
           first_aid_kit       = COALESCE($32::boolean, first_aid_kit),
           cctv                = COALESCE($33::boolean, cctv),
           panic_button        = COALESCE($34::boolean, panic_button),
           updated_at          = NOW()
         WHERE id = $35 AND org_id = $36
         RETURNING *`, [
                body.vehicleNumber ?? null,
                body.model ?? null,
                body.manufacturer ?? null,
                body.vehicleType ?? null,
                body.year ?? null,
                body.fuelType ?? null,
                body.seatingCapacity ?? null,
                body.colour ?? null,
                body.status ?? null,
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
                body.fireExtinguisher ?? null,
                body.firstAidKit ?? null,
                body.cctv ?? null,
                body.panicButton ?? null,
                id,
                auth.user.org_id,
            ]);
            if (rows.length === 0)
                return (0, response_1.err)(404, "Not found");
            return (0, response_1.ok)(rows[0]);
        }
        catch (e) {
            ctx.error("vehiclesById:", e);
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
