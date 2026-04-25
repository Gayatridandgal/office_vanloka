"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const response_1 = require("../../shared/response");
functions_1.app.http("mastersDropdowns", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    route: "masters/dropdowns",
    handler: async (req, _ctx) => {
        if (req.method === "OPTIONS")
            return (0, response_1.preflight)();
        const type = req.query.get("type");
        switch (type) {
            case "vehicleTypes":
                return (0, response_1.ok)(["Sedan", "SUV", "Van", "Bus", "Minibus", "Truck", "Auto"]);
            case "fuelTypes":
                return (0, response_1.ok)(["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]);
            case "employmentTypes":
                return (0, response_1.ok)(["Full-time", "Part-time", "Contract", "Temporary"]);
            case "genders":
                return (0, response_1.ok)(["Male", "Female", "Other"]);
            case "statusOptions":
                return (0, response_1.ok)(["Active", "Inactive", "Suspended"]);
            case "driverStatuses":
                return (0, response_1.ok)(["On Duty", "On Break", "Offline", "Active", "Inactive"]);
            case "complianceTypes":
                return (0, response_1.ok)(["Insurance", "Fitness Certificate", "Pollution Certificate", "Permit", "Driver License"]);
            case "deviceTypes":
                return (0, response_1.ok)(["GPS", "BLE"]);
            case "feedbackTypes":
                return (0, response_1.ok)(["Complaint", "Suggestion", "Compliment"]);
            case "bookingStatuses":
                return (0, response_1.ok)(["Pending", "Confirmed", "Completed", "Cancelled"]);
            case "ownershipTypes":
                return (0, response_1.ok)(["Owned", "Leased", "Rented"]);
            case "states":
                return (0, response_1.ok)([
                    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
                ]);
            default:
                return (0, response_1.err)(400, "Unknown dropdown type");
        }
    },
});
