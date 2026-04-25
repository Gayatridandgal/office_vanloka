import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { ok, err, preflight } from "../../shared/response";

app.http("mastersDropdowns", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "masters/dropdowns",
  handler: async (
    req: HttpRequest,
    _ctx: InvocationContext,
  ): Promise<HttpResponseInit> => {
    if (req.method === "OPTIONS") return preflight();

    const type = req.query.get("type");

    switch (type) {
      case "vehicleTypes":
        return ok(["Sedan", "SUV", "Van", "Bus", "Minibus", "Truck", "Auto"]);
      case "fuelTypes":
        return ok(["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]);
      case "employmentTypes":
        return ok(["Full-time", "Part-time", "Contract", "Temporary"]);
      case "genders":
        return ok(["Male", "Female", "Other"]);
      case "statusOptions":
        return ok(["Active", "Inactive", "Suspended"]);
      case "driverStatuses":
        return ok(["On Duty", "On Break", "Offline", "Active", "Inactive"]);
      case "complianceTypes":
        return ok(["Insurance", "Fitness Certificate", "Pollution Certificate", "Permit", "Driver License"]);
      case "deviceTypes":
        return ok(["GPS", "BLE"]);
      case "feedbackTypes":
        return ok(["Complaint", "Suggestion", "Compliment"]);
      case "bookingStatuses":
        return ok(["Pending", "Confirmed", "Completed", "Cancelled"]);
      case "ownershipTypes":
        return ok(["Owned", "Leased", "Rented"]);
      case "states":
        return ok([
          "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
          "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
          "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
          "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
          "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
          "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
        ]);
      default:
        return err(400, "Unknown dropdown type");
    }
  },
});
