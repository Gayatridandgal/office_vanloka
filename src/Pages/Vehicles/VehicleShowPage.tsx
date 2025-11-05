import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import tenantApi from "../../Services/ApiService";

// ===== VEHICLE TYPES =====
export interface Vehicle {
  id: string | number;
  vehicle_number?: string;
  vehicle_type?: string;
  manufacturer?: string;
  vehicle_model?: string;
  manufacturing_year?: number;
  fuel_type?: string;
  seating_capacity?: number;
  vehicle_color?: string;
  kilometers_driven?: number;
  gps_device_id?: string;
  sim_number?: string;
  beacon_count?: number;
  assigned_driver_id?: string;
  assigned_route_id?: string;
  permit_type?: string;
  permit_number?: string;
  permit_issue_date?: string;
  permit_expiry_date?: string;
  ownership_type?: string;
  owner_name?: string;
  owner_contact_number?: string;
  vendor_name?: string;
  vendor_contact_number?: string;
  organization_name?: string;
  gps_installation_date?: string;
  insurance_provider_name?: string;
  insurance_policy_number?: string;
  insurance_expiry_date?: string;
  fitness_certificate_number?: string;
  fitness_expiry_date?: string;
  pollution_certificate_number?: string;
  pollution_expiry_date?: string;
  last_service_date?: string;
  next_service_due_date?: string;
  tyre_replacement_due_date?: string;
  battery_replacement_due_date?: string;
  fire_extinguisher_status?: string;
  first_aid_kit_status?: string;
  cctv_installed?: boolean;
  panic_button_installed?: boolean;
  vehicle_remarks?: string;
  created_at?: string;
  updated_at?: string;
}

// ===== APP USER TYPES =====
export interface AppUser {
  id: string | number;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  profile_photo?: string;
  email?: string;
  mobile_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  village?: string;
  city?: string;
  district?: string;
  state?: string;
  pin_code?: string;
  kyc_document_type?: string;
  kyc_document_number?: string;
  referral_code?: string;
  preferred_language?: string;
  interest?: string;
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  travellers?: Traveller[];
  created_at?: string;
  updated_at?: string;
}

export interface Traveller {
  id: string | number;
  app_user_id: string | number;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  profile_photo?: string;
  relationship?: string;
  beacon_id?: string;
  aadhaar_number?: string;
  blood_group?: string;
  remarks_notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper component for displaying field info
const InfoField = ({
  label,
  value,
  colSpan = 1,
}: {
  label: string;
  value?: string | number | boolean | null;
  colSpan?: number;
}) => (
  <div className={`col-span-${colSpan}`}>
    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">{label}</h4>
    <p className="text-sm text-purple-950 font-medium">
      {value === null || value === undefined || value === ""
        ? "—"
        : typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : value}
    </p>
  </div>
);

// Helper component for dates
const DateField = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return <InfoField label={label} value={null} />;
  const date = new Date(value);
  const isExpired = new Date() > date;
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </h4>
      <p
        className={`text-sm font-medium ${
          isExpired ? "text-red-600" : "text-purple-950"
        }`}
      >
        {date.toLocaleDateString("en-IN")}
        {isExpired && (
          <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded">
            Expired
          </span>
        )}
      </p>
    </div>
  );
};

// Helper component for status badges
const StatusBadge = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return <InfoField label={label} value={null} />;

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    Maintenance: "bg-yellow-100 text-yellow-800",
    Installed: "bg-green-100 text-green-800",
    Available: "bg-green-100 text-green-800",
    Expired: "bg-red-100 text-red-800",
    "Not Installed": "bg-gray-100 text-gray-800",
    Missing: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </h4>
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          statusColors[value] || "bg-gray-100 text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const VehicleShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<{
        success: boolean;
        data: Vehicle;
      }>(`/vehicles/${id}`);

      if (response.data.success) {
        setVehicle(response.data.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch vehicle details";
      setError(errorMessage);
      console.error("Error fetching vehicle:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Vehicle Details" buttonLink="/vehicles" />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Vehicle Not Found" buttonLink="/vehicles" />
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || "The requested vehicle could not be found."}
          </p>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-purple-950 text-white px-4 py-2 rounded"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  // Helper function to determine vehicle status
  const getVehicleStatus = (): string => {
    const now = new Date();
    if (
      vehicle.permit_expiry_date &&
      new Date(vehicle.permit_expiry_date) < now
    ) {
      return "Inactive";
    }
    if (
      vehicle.insurance_expiry_date &&
      new Date(vehicle.insurance_expiry_date) < now
    ) {
      return "Inactive";
    }
    if (
      vehicle.next_service_due_date &&
      new Date(vehicle.next_service_due_date) < now
    ) {
      return "Maintenance";
    }
    return "Active";
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Vehicle Details" buttonLink="/vehicles" />

      <div className="p-8 mx-auto max-w-7xl rounded-lg shadow-sm">
        {/* Header with Vehicle Number and Status */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-950 mb-2">
                {vehicle.vehicle_number}
              </h1>
              <p className="text-gray-600">
                {vehicle.manufacturer} {vehicle.vehicle_model} •{" "}
                {vehicle.fuel_type}
              </p>
            </div>
            <StatusBadge label="Status" value={getVehicleStatus()} />
          </div>
        </div>

        {/* Section 1: Vehicle Basic Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Vehicle Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Vehicle Type" value={vehicle.vehicle_type} />
            <InfoField
              label="Manufacturer (OEM)"
              value={vehicle.manufacturer}
            />
            <InfoField label="Vehicle Model" value={vehicle.vehicle_model} />
            <InfoField
              label="Manufacturing Year"
              value={vehicle.manufacturing_year}
            />
            <InfoField label="Fuel Type" value={vehicle.fuel_type} />
            <InfoField
              label="Seating Capacity"
              value={vehicle.seating_capacity}
            />
            <InfoField label="Vehicle Color" value={vehicle.vehicle_color} />
            <InfoField
              label="Kilometers Driven"
              value={vehicle.kilometers_driven}
            />
          </div>
        </section>

        {/* Section 2: Tracking & Assignment */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Tracking & Assignment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="GPS Device ID" value={vehicle.gps_device_id} />
            <InfoField label="SIM Number" value={vehicle.sim_number} />
            <InfoField label="Beacon Count" value={vehicle.beacon_count} />
            <InfoField
              label="Assigned Driver ID"
              value={vehicle.assigned_driver_id}
            />
            <InfoField
              label="Assigned Route ID"
              value={vehicle.assigned_route_id}
            />
            <DateField
              label="GPS Installation Date"
              value={vehicle.gps_installation_date}
            />
          </div>
        </section>

        {/* Section 3: Permit & Compliance */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Permit & Compliance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Permit Type" value={vehicle.permit_type} />
            <InfoField label="Permit Number" value={vehicle.permit_number} />
            <DateField
              label="Permit Issue Date"
              value={vehicle.permit_issue_date}
            />
            <DateField
              label="Permit Expiry Date"
              value={vehicle.permit_expiry_date}
            />
          </div>
        </section>

        {/* Section 4: Ownership & Contact */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Ownership & Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusBadge
              label="Ownership Type"
              value={vehicle.ownership_type}
            />
            <InfoField label="Owner Name" value={vehicle.owner_name} />
            <InfoField
              label="Owner Contact Number"
              value={vehicle.owner_contact_number}
            />
            <InfoField label="Vendor Name" value={vehicle.vendor_name} />
            <InfoField
              label="Vendor Contact Number"
              value={vehicle.vendor_contact_number}
            />
            <InfoField
              label="Organization / Fleet Name"
              value={vehicle.organization_name}
            />
          </div>
        </section>

        {/* Section 5: Insurance & Fitness */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Insurance & Fitness Certificates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="Insurance Provider Name"
              value={vehicle.insurance_provider_name}
            />
            <InfoField
              label="Insurance Policy Number"
              value={vehicle.insurance_policy_number}
            />
            <DateField
              label="Insurance Expiry Date"
              value={vehicle.insurance_expiry_date}
            />
            <InfoField
              label="Fitness Certificate Number"
              value={vehicle.fitness_certificate_number}
            />
            <DateField
              label="Fitness Expiry Date"
              value={vehicle.fitness_expiry_date}
            />
            <InfoField
              label="Pollution Certificate Number"
              value={vehicle.pollution_certificate_number}
            />
            <DateField
              label="Pollution Expiry Date"
              value={vehicle.pollution_expiry_date}
            />
          </div>
        </section>

        {/* Section 6: Service & Maintenance */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Service & Maintenance Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DateField
              label="Last Service Date"
              value={vehicle.last_service_date}
            />
            <DateField
              label="Next Service Due Date"
              value={vehicle.next_service_due_date}
            />
            <DateField
              label="Tyre Replacement Due Date"
              value={vehicle.tyre_replacement_due_date}
            />
            <DateField
              label="Battery Replacement Due Date"
              value={vehicle.battery_replacement_due_date}
            />
          </div>
        </section>

        {/* Section 7: Safety Features & Status */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Safety Features & Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusBadge
              label="Fire Extinguisher Status"
              value={vehicle.fire_extinguisher_status}
            />
            <StatusBadge
              label="First Aid Kit Status"
              value={vehicle.first_aid_kit_status}
            />
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                CCTV Installed
              </h4>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.cctv_installed
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {vehicle.cctv_installed ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Panic Button Installed
              </h4>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.panic_button_installed
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {vehicle.panic_button_installed ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </section>

        {/* Section 8: Remarks */}
        {vehicle.vehicle_remarks && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
              Additional Remarks
            </h2>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-950 leading-relaxed">
                {vehicle.vehicle_remarks}
              </p>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Edit Vehicle
          </button>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleShowPage;
