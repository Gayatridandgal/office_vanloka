import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaTruck,
  FaShieldAlt,
  FaFileAlt,
  FaCog,
  FaClipboardCheck,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaGasPump,
  FaUsers,
} from "react-icons/fa";
import { MdGpsFixed, MdWarning } from "react-icons/md";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import tenantApi from "../../Services/ApiService";
import useAsset from "../../Hooks/useAsset";
import DetailItem from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";
import type { Vehicle } from "./Vehicle.types";
import { SectionHeader } from "../../Components/UI/SectionHeader";
import { Loader } from "../../Components/UI/Loader";

// Utility function for date formatting
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Yes/No Badge with Icons
const YesNoBadge = ({ value }: { value?: string | null }) => {
  if (value === "YES") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-800 border-2 border-green-200">
        <FaCheckCircle size={12} />
        YES
      </span>
    );
  }
  if (value === "NO") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 border-2 border-red-200">
        <FaTimesCircle size={12} />
        NO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-800 border-2 border-gray-200">
      N/A
    </span>
  );
};

// Status Badge
const StatusBadge = ({ status }: any) => {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-green-100 text-green-800 border-2 border-green-200">
        <FaCheckCircle size={12} />
        Active
      </span>
    );
  }
  if (status === "inactive") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-red-100 text-red-800 border-2 border-red-200">
        <FaTimesCircle size={12} />
        Inactive
      </span>
    );
  }
  if (status === "under_maintenance") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-amber-100 text-amber-800 border-2 border-amber-200">
        <MdWarning size={12} />
        Under Maintenance
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-gray-100 text-gray-800 border-2 border-gray-200">
      N/A
    </span>
  );
};

// Vehicle Type Badge
const VehicleTypeBadge = ({ type }: { type?: string | null }) => {
  const getTypeConfig = () => {
    switch (type?.toLowerCase()) {
      case "bus":
        return { label: "Bus", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "van":
        return { label: "Van", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "car":
        return { label: "Car", color: "bg-green-100 text-green-800 border-green-200" };
      case "suv":
        return { label: "SUV", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "mini_bus":
        return { label: "Mini Bus", color: "bg-cyan-100 text-cyan-800 border-cyan-200" };
      case "tempo":
        return { label: "Tempo", color: "bg-amber-100 text-amber-800 border-amber-200" };
      default:
        return { label: type || "N/A", color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const config = getTypeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 p-1 rounded-lg text-sm font-bold uppercase border-2 ${config.color}`}
    >
      <FaTruck size={14} />
      {config.label}
    </span>
  );
};


const VehicleShowPage = () => {
  const { id } = useParams<{ id: string }>();
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
    return <Loader />;
  }

  if (error || !vehicle) {
    return <Loader />;
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Vehicle Details" buttonLink="/vehicles" />

      <div className="space-y-4 mt-4 pb-10 mx-auto max-w-7xl">
        {/* Header Card with Vehicle Info and Status */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-lg bg-blue-100 flex items-center justify-center border-4 border-blue-300 shadow-lg">
                <FaTruck className="text-blue-600" size={40} />
              </div>
              <div>
                <h1 className="text-md font-bold text-gray-900 uppercase">
                  {vehicle.vehicle_number}
                </h1>
                <div className="space-y-1 uppercase">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <FaTruck size={14} className="text-gray-400" />
                    Manufacturer:{" "}
                    <span className="font-semibold">
                      {vehicle.manufacturer || "N/A"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <FaGasPump size={14} className="text-gray-400" />
                    Fuel Type:{" "}
                    <span className="font-semibold uppercase">
                      {vehicle.fuel_type || "N/A"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <FaUsers size={14} className="text-gray-400" />
                    Seating Capacity:{" "}
                    <span className="font-semibold">
                      {vehicle.seating_capacity || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <VehicleTypeBadge type={vehicle.vehicle_type} />
              <StatusBadge status={vehicle.status} />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[73vh] space-y-4 border border-gray-200 p-6 rounded-lg">
          {/* Basic Information Section */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaTruck size={20} />} title="Basic Information" />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
              <DetailItem label="Vehicle Number" value={vehicle.vehicle_number} />
              <DetailItem label="Vehicle Type" value={vehicle.vehicle_type} />
              <DetailItem label="RC Number" value={vehicle.rc_number} />
              <DetailItem
                label="RC Issued Date"
                value={formatDate(vehicle.rc_isued_date)}
              />
              <DetailItem
                label="RC Expiry Date"
                value={formatDate(vehicle.rc_expiry_date)}
              />
              <DetailItem label="Manufacturer" value={vehicle.manufacturer} />
              <DetailItem label="Vehicle Model" value={vehicle.vehicle_model} />
              <DetailItem
                label="Manufacturing Year"
                value={vehicle.manufacturing_year}
              />
              <DetailItem label="Fuel Type" value={vehicle.fuel_type} />
              <DetailItem
                label="Seating Capacity"
                value={vehicle.seating_capacity}
              />
              <DetailItem label="Vehicle Color" value={vehicle.vehicle_color} />
              <DetailItem
                label="Kilometers Driven"
                value={vehicle.kilometers_driven}
              />
              <DetailItem label="Assigned Route" value={vehicle.route} />
              <DetailItem
                label="Tax Renewal Date"
                value={formatDate(vehicle.tax_renewable_date)}
              />
            </div>
          </div>

          {/* GPS & Device Assignment */}
          {(vehicle.gps_device || vehicle.gps_installation_date) && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <SectionHeader
                icon={<MdGpsFixed size={20} />}
                title="Device Assignment"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-6">
                <DetailItem label="GPS Device" value={vehicle.gps_device} />
                <DetailItem
                  label="GPS Installation Date"
                  value={formatDate(vehicle.gps_installation_date)}
                />
              </div>
            </div>
          )}

          {/* Ownership Details */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaUserTie size={20} />}
              title="Ownership Details"
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
              <DetailItem
                label="Ownership Type"
                value={vehicle.ownership_type}
              />
            </div>

            {/* Conditional Vendor Information */}
            {vehicle.ownership_type === "contract" && (
              <>
                <h3 className="text-sm font-bold text-indigo-700 uppercase mt-6 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                  <DetailItem label="Vendor Name" value={vehicle.vendor_name} />
                  <DetailItem
                    label="Vendor Aadhaar Number"
                    value={vehicle.vendor_aadhar_number}
                  />
                  <DetailItem
                    label="Vendor PAN Number"
                    value={vehicle.vendor_pan_number}
                  />
                  <DetailItem
                    label="Vendor Contact Number"
                    value={vehicle.vendor_contact_number}
                  />
                  <DetailItem
                    label="Vendor Organization"
                    value={vehicle.vendor_organization_name}
                  />
                </div>
              </>
            )}
          </div>

          {/* Permits & Compliance */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaClipboardCheck size={20} />}
              title="Permits & Compliance"
            />

            {/* Permit Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-purple-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Permit Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
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
              </div>
            </div>

            {/* Insurance Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-blue-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Insurance Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Insurance Provider"
                  value={vehicle.insurance_provider_name}
                />
                <DetailItem
                  label="Policy Number"
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
              </div>
            </div>

            {/* Fitness Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-green-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Fitness Certificate
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
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
              </div>
            </div>

            {/* PUC Section */}
            <div>
              <h3 className="text-sm font-bold text-orange-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Pollution Certificate (PUC)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Service & Maintenance */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaCog size={20} />}
              title="Service & Maintenance"
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
              <DetailItem
                label="Last Service Date"
                value={formatDate(vehicle.last_service_date)}
              />
              <DetailItem
                label="Next Service Due Date"
                value={formatDate(vehicle.next_service_due_date)}
              />
              <DetailItem
                label="Tyre Replacement Due"
                value={formatDate(vehicle.tyre_replacement_due_date)}
              />
              <DetailItem
                label="Battery Replacement Due"
                value={formatDate(vehicle.battery_replacement_due_date)}
              />
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaShieldAlt size={20} />}
              title="Safety Features"
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Fire Extinguisher
                </h4>
                <YesNoBadge value={vehicle.fire_extinguisher} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  First Aid Kit
                </h4>
                <YesNoBadge value={vehicle.first_aid_kit} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  CCTV Installed
                </h4>
                <YesNoBadge value={vehicle.cctv_installed} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Panic Button Installed
                </h4>
                <YesNoBadge value={vehicle.panic_button_installed} />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaFileAlt size={20} />} title="Documents" />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vehicle.insurance_doc && (
                <DocumentItem
                  label="Insurance Document"
                  path={vehicle.insurance_doc}
                />
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
              {vehicle.saftey_certificate && (
                <DocumentItem
                  label="Safety Certificate"
                  path={vehicle.saftey_certificate}
                />
              )}
              {vehicle.gps_installation_proof && (
                <DocumentItem
                  label="GPS Installation Proof"
                  path={vehicle.gps_installation_proof}
                />
              )}
            </div>

            {/* Conditional Vendor Documents */}
            {vehicle.ownership_type === "contract" && (
              <>
                <h3 className="text-sm font-bold text-indigo-700 uppercase mt-6 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Vendor Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vehicle.vendor_pan && (
                    <DocumentItem
                      label="Vendor PAN Card"
                      path={vehicle.vendor_pan}
                    />
                  )}
                  {vehicle.vendor_adhaar && (
                    <DocumentItem
                      label="Vendor Aadhaar Card"
                      path={vehicle.vendor_adhaar}
                    />
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
                </div>
              </>
            )}

            {!vehicle.insurance_doc &&
              !vehicle.rc_book_doc &&
              !vehicle.puc_doc &&
              !vehicle.fitness_certificate &&
              !vehicle.permit_copy &&
              !vehicle.saftey_certificate &&
              !vehicle.gps_installation_proof &&
              (!vehicle.ownership_type ||
                vehicle.ownership_type !== "contract" ||
                (!vehicle.vendor_pan &&
                  !vehicle.vendor_adhaar &&
                  !vehicle.vendor_bank_proof &&
                  !vehicle.vendor_contract_proof &&
                  !vehicle.vedor_company_registration_doc)) && (
                <div className="p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
                  <FaFileAlt className="text-gray-300 mx-auto mb-2" size={32} />
                  <p className="text-gray-500 text-sm uppercase">
                    No Documents Uploaded
                  </p>
                </div>
              )}
          </div>

          {/* Remarks / Notes */}
          {vehicle.remarks && (
            <div className="bg-amber-50 rounded-md shadow-sm border-2 border-amber-200 p-6">
              <div className="flex items-start gap-2">
                <MdWarning className="text-amber-600 mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-amber-800 uppercase mb-2">
                    Remarks / Notes
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {vehicle.remarks}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleShowPage;
