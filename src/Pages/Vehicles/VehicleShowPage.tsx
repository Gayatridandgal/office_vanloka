import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import type { Vehicle } from "./Vehicle.types";
import tenantApi from "../../Services/ApiService";
import DetailItem from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";

// Utility Components
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md">
    {title}
  </h2>
);

// Helper for Yes/No badge display
const YesNoBadge = ({ value }: { value?: string | null }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${value === "YES"
      ? "bg-green-100 text-green-800"
      : value === "NO"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-800"
      }`}
  >
    {value || "NO"}
  </span>
);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 uppercase text-sm">
            Loading Vehicle Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="px-4 bg-white min-h-screen text-center py-10">
        <h1 className="text-2xl font-bold uppercase">Vehicle not found.</h1>
        <p className="text-red-600 mt-4 uppercase">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Back" buttonLink="/vehicles" />

      <div className="p-10 mx-auto max-w-7xl rounded-lg shadow-lg bg-white border border-gray-200">
        {/* Header with Vehicle Number and Status */}
        <div className="mb-8 pb-6 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-purple-950 uppercase">
              {vehicle.vehicle_number || "N/A"}
            </h1>
            <p className="text-gray-600 text-sm uppercase mt-1">
              {vehicle.manufacturer} {vehicle.vehicle_model} • {vehicle.fuel_type}
            </p>
            <p className="text-gray-600 text-sm uppercase">
              {vehicle.vehicle_type}
            </p>
          </div>
          <div className="text-right">
            {vehicle.status && (
              <span
                className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase ${vehicle.status === "active"
                  ? "bg-green-100 text-green-800"
                  : vehicle.status === "under_maintenance"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                {vehicle.status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <SectionHeader title="Basic Information" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="Vehicle Number" value={vehicle.vehicle_number} />
            <DetailItem label="Vehicle Type" value={vehicle.vehicle_type} />
            <DetailItem label="RC Number" value={vehicle.rc_number} />
            <DetailItem label="RC Issued Date" value={formatDate(vehicle.rc_isued_date)} />
            <DetailItem label="RC Expiry Date" value={formatDate(vehicle.rc_expiry_date)} />
            <DetailItem label="Manufacturer" value={vehicle.manufacturer} />
            <DetailItem label="Vehicle Model" value={vehicle.vehicle_model} />
            <DetailItem label="Manufacturing Year" value={vehicle.manufacturing_year} />
            <DetailItem label="Fuel Type" value={vehicle.fuel_type} />
            <DetailItem label="Seating Capacity" value={vehicle.seating_capacity} />
            <DetailItem label="Vehicle Color" value={vehicle.vehicle_color} />
            <DetailItem label="Kilometers Driven" value={vehicle.kilometers_driven} />
            <DetailItem label="Driver Assigned" value={vehicle.driver} />
            <DetailItem label="Route Assigned" value={vehicle.route} />
          </div>

          {/* GPS Tracking */}
          <SectionHeader title="Device" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="GPS Device" value={vehicle.gps_device} />
            <DetailItem
              label="GPS Installation Date"
              value={formatDate(vehicle.gps_installation_date)}
            />
          </div>

          {/* Ownership Information */}
          <SectionHeader title="Ownership Information" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="Ownership Type" value={vehicle.ownership_type} />
          </div>

          {/* Conditional Vendor Details */}
          {vehicle.ownership_type === "contract" && (
            <>

              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
                <DetailItem label="Vendor Name" value={vehicle.vendor_name} />
                <DetailItem
                  label="Vendor Aadhaar Number"
                  value={vehicle.vendor_aadhar_number}
                />
                <DetailItem label="Vendor PAN Number" value={vehicle.vendor_pan_number} />
                <DetailItem
                  label="Vendor Contact Number"
                  value={vehicle.vendor_contact_number}
                />
                <DetailItem
                  label="Vendor Organization Name"
                  value={vehicle.vendor_organization_name}
                />
              </div>
            </>
          )}

          {/* Insurance Information */}
          <SectionHeader title="Compliance" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="Permit Type" value={vehicle.permit_type} />
            <DetailItem label="Permit Number" value={vehicle.permit_number} />
            <DetailItem
              label="Permit Issue Date"
              value={formatDate(vehicle.permit_issue_date)}
            />
            <DetailItem
              label="Permit Expiry Date"
              value={formatDate(vehicle.permit_expiry_date)}
            />
            <DetailItem
              label="Insurance Provider Name"
              value={vehicle.insurance_provider_name}
            />
            <DetailItem
              label="Insurance Policy Number"
              value={vehicle.insurance_policy_number}
            />
            <DetailItem
              label="Insurance Issued Date"
              value={formatDate(vehicle.insurance_issued_date)}
            />
            <DetailItem
              label="Insurance Expiry Date"
              value={formatDate(vehicle.insurance_expiry_date)}
            />
            <DetailItem
              label="Fitness Certificate Number"
              value={vehicle.fitness_certificate_number}
            />
            <DetailItem
              label="Fitness Issued Date"
              value={formatDate(vehicle.fitness_issued_date)}
            />
            <DetailItem
              label="Fitness Expiry Date"
              value={formatDate(vehicle.fitness_expiry_date)}
            />
            <DetailItem
              label="PUC Number"
              value={vehicle.pollution_certificate_number}
            />
            <DetailItem
              label="PUC Issued Date"
              value={formatDate(vehicle.pollution_issued_date)}
            />
            <DetailItem
              label="PUC Expiry Date"
              value={formatDate(vehicle.pollution_expiry_date)}
            />
          </div>

          {/* Service & Maintenance */}
          <SectionHeader title="Service & Maintenance" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem
              label="Last Service Date"
              value={formatDate(vehicle.last_service_date)}
            />
            <DetailItem
              label="Next Service Due Date"
              value={formatDate(vehicle.next_service_due_date)}
            />
            <DetailItem
              label="Tyre Replacement Due Date"
              value={formatDate(vehicle.tyre_replacement_due_date)}
            />
            <DetailItem
              label="Battery Replacement Due Date"
              value={formatDate(vehicle.battery_replacement_due_date)}
            />
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Fire Extinguisher
              </h4>
              <YesNoBadge value={vehicle.fire_extinguisher} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                First Aid Kit
              </h4>
              <YesNoBadge value={vehicle.first_aid_kit} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                CCTV Installed
              </h4>
              <YesNoBadge value={vehicle.cctv_installed} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Panic Button Installed
              </h4>
              <YesNoBadge value={vehicle.panic_button_installed} />
            </div>
          </div>

          {/* Documents */}
          <SectionHeader title="Documents" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {vehicle.insurance_doc && (
              <DocumentItem label="Insurance Document" path={vehicle.insurance_doc} />
            )}
            {vehicle.rc_book_doc && (
              <DocumentItem label="RC Book" path={vehicle.rc_book_doc} />
            )}
            {vehicle.puc_doc && (
              <DocumentItem label="PUC Document" path={vehicle.puc_doc} />
            )}
            {vehicle.fitness_certificate && (
              <DocumentItem
                label="Fitness Certificate"
                path={vehicle.fitness_certificate}
              />
            )}
            {vehicle.permit_copy && (
              <DocumentItem label="Permit Copy" path={vehicle.permit_copy} />
            )}
            {vehicle.gps_installation_proof && (
              <DocumentItem
                label="GPS Installation Proof"
                path={vehicle.gps_installation_proof}
              />
            )}
            {vehicle.ownership_type === "contract" && (
              <>
                {vehicle.vendor_pan && (
                  <DocumentItem label="Vendor PAN Card" path={vehicle.vendor_pan} />
                )}
                {vehicle.vendor_adhaar && (
                  <DocumentItem label="Vendor Aadhaar" path={vehicle.vendor_adhaar} />
                )}
                {vehicle.vendor_bank_proof && (
                  <DocumentItem
                    label="Vendor Bank Proof"
                    path={vehicle.vendor_bank_proof}
                  />
                )}
                {vehicle.vendor_contract_proof && (
                  <DocumentItem
                    label="Contract Agreement"
                    path={vehicle.vendor_contract_proof}
                  />
                )}
                {vehicle.vedor_company_registration_doc && (
                  <DocumentItem
                    label="Company Registration"
                    path={vehicle.vedor_company_registration_doc}
                  />
                )}
              </>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap uppercase">
              Remarks  {vehicle.remarks}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/vehicles")}
            className="px-6 py-2 bg-gray-600 font-bold text-white text-sm rounded-md hover:bg-gray-500 uppercase"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleShowPage;
