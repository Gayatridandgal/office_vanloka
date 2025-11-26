import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFileAlt,
  FaIdCard,
  FaCreditCard,
  FaUserShield,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import tenantApi from "../../Services/ApiService";
import useAsset from "../../Hooks/useAsset";
import DetailItem from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";
import type { Driver } from "./Driver.types";
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

const StatusBadge = ({ status }:any) => {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-green-100 text-green-800 border-2 border-green-200">
        <FaCheckCircle size={12} />
        active
      </span>
    );
  }
  if (status === "inactive") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-red-100 text-red-800 border-2 border-red-200">
        <FaTimesCircle size={12} />
        inactive
      </span>
    );
  }
};

// Employment Type Badge
const EmploymentTypeBadge = ({ type }: { type?: string | null }) => {
  const getTypeConfig = () => {
    switch (type?.toLowerCase()) {
      case "full-time":
        return { label: "Full-time", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "contract":
        return { label: "Contract", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "self-employed":
        return { label: "Self-employed", color: "bg-purple-100 text-purple-800 border-purple-200" };
      default:
        return { label: type || "N/A", color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const config = getTypeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 p-1 rounded-lg text-sm font-bold uppercase border-2 ${config.color}`}
    >
      <FaBriefcase size={14} />
      {config.label}
    </span>
  );
};

const DriverShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const asset = useAsset();

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<{
        success: boolean;
        data: Driver;
      }>(`/drivers/${id}`);

      if (response.data.success) {
        setDriver(response.data.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch driver details";
      setError(errorMessage);
      console.error("Error fetching driver:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (error || !driver) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Driver Details" buttonLink="/drivers" />

      <div className="space-y-4 mt-4 pb-10 mx-auto max-w-7xl">
        {/* Header Card with Profile and Status */}
        <div className="bg-gray-50 rounded-md p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {driver.profile_photo ? (
                <img
                  src={asset(driver.profile_photo) || ""}
                  alt={`${driver.first_name} ${driver.last_name}`}
                  className="h-24 w-24 rounded-lg object-cover border-4 border-purple-200 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-purple-100 flex items-center justify-center border-4 border-purple-200 shadow-md">
                  <FaUser className="text-purple-500" size={40} />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 uppercase mb-1">
                  {driver.first_name} {driver.last_name}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <FaIdCard size={14} className="text-gray-400" />
                  Employee ID:{" "}
                  <span className="font-mono font-semibold">
                    {driver.employee_id || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FaCalendarAlt size={14} className="text-gray-400" />
                  DOB: {formatDate(driver.date_of_birth)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <EmploymentTypeBadge type={driver.employment_type} />
              <StatusBadge status={driver.status} />
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[70vh] space-y-4 border border-gray-200 p-6 rounded-lg">
          {/* Basic Information Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <SectionHeader icon={<FaUser size={20} />} title="Basic Information" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
            <DetailItem label="First Name" value={driver.first_name} />
            <DetailItem label="Last Name" value={driver.last_name} />
            <DetailItem label="Gender" value={driver.gender} />
            <DetailItem
              label="Date of Birth"
              value={formatDate(driver.date_of_birth)}
            />
            <DetailItem label="Blood Group" value={driver.blood_group} />
            <DetailItem label="Marital Status" value={driver.marital_status} />
            <DetailItem
              label="Number of Dependents"
              value={driver.number_of_dependents}
            />
            <DetailItem label="Mobile Number" value={driver.mobile_number} />
            <DetailItem label="Email" value={driver.email} />
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <SectionHeader
            icon={<FaBriefcase size={20} />}
            title="Professional Information"
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
            <DetailItem label="Employment Type" value={driver.employment_type} />
            <DetailItem label="Employee ID" value={driver.employee_id} />
            <DetailItem
              label="Driving Experience (Years)"
              value={driver.driving_experience}
            />

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                Safety Training Completed
              </h4>
              <YesNoBadge value={driver.safety_training_completion} />
            </div>

            {driver.safety_training_completion === "YES" && (
              <DetailItem
                label="Training Completion Date"
                value={formatDate(driver.safety_training_completion_date)}
              />
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                Medical Fitness Issued
              </h4>
              <YesNoBadge value={driver.medical_fitness} />
            </div>

            {driver.medical_fitness === "YES" && (
              <DetailItem
                label="Medical Fitness Expiry"
                value={formatDate(driver.medical_fitness_exp_date)}
              />
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                Police Verification
              </h4>
              <YesNoBadge value={driver.police_verification} />
            </div>

            {driver.police_verification === "YES" && (
              <DetailItem
                label="Police Verification Date"
                value={formatDate(driver.police_verification_date)}
              />
            )}
          </div>
        </div>

        {/* Assignment Information */}
        {(driver.beacon || driver.vehicle) && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaExclamationTriangle size={20} />}
              title="Tracking & Assignment"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-6">
              <DetailItem label="Beacon Assigned" value={driver.beacon} />
              <DetailItem label="Vehicle Assigned" value={driver.vehicle} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Address Details Section */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaMapMarkerAlt size={20} />}
              title="Address Details"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-6">
              <DetailItem label="Address Line 1" value={driver.address_line_1} />
              <DetailItem label="Address Line 2" value={driver.address_line_2} />
              <DetailItem label="Landmark" value={driver.landmark} />
              <DetailItem label="City" value={driver.city} />
              <DetailItem label="District" value={driver.district} />
              <DetailItem label="State" value={driver.state} />
              <DetailItem label="PIN Code" value={driver.pin_code} />
            </div>
          </div>

          {/* Emergency Contact Persons Section */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaUserShield size={20} />}
              title="Emergency Contact Persons"
            />

            {/* Primary Contact */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-blue-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Primary
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
                <DetailItem label="Name" value={driver.primary_person_name} />
                <DetailItem label="Email" value={driver.primary_person_email} />
                <DetailItem
                  label="Primary Number"
                  value={driver.primary_person_phone_1}
                />
                <DetailItem
                  label="Secondary Number"
                  value={driver.primary_person_phone_2}
                />
              </div>
            </div>

            {/* Secondary Contact */}
            <div>
              <h3 className="text-sm font-bold text-green-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Secondary
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
                <DetailItem label="Name" value={driver.secondary_person_name} />
                <DetailItem label="Email" value={driver.secondary_person_email} />
                <DetailItem
                  label="Primary Number"
                  value={driver.secondary_person_phone_1}
                />
                <DetailItem
                  label="Secondary Number"
                  value={driver.secondary_person_phone_2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <SectionHeader
            icon={<FaCreditCard size={20} />}
            title="Bank Account Details"
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
            <DetailItem label="Bank Name" value={driver.bank_name} />
            <DetailItem
              label="Account Holder Name"
              value={driver.account_holder_name}
            />
            <DetailItem label="Account Number" value={driver.account_number} />
            <DetailItem label="IFSC Code" value={driver.ifsc_code} />
          </div>
        </div>

        {/* License & Insurance Information */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <SectionHeader
            icon={<FaIdCard size={20} />}
            title="License & Insurance Information"
          />
          {driver.license_insurance && driver.license_insurance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {driver.license_insurance.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-bold text-sm text-purple-900 mb-3 uppercase flex items-center gap-2">
                    <FaIdCard size={16} />
                    {item.type?.replace(/_/g, " ") || "Record"}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 uppercase font-semibold">
                        Document Number:
                      </span>
                      <span className="font-mono text-gray-900">
                        {item.number || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 uppercase font-semibold">
                        Issue Date:
                      </span>
                      <span className="text-gray-900">
                        {formatDate(item.issue_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 uppercase font-semibold">
                        Expiry Date:
                      </span>
                      <span className="text-gray-900">
                        {formatDate(item.exp_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
              <FaIdCard className="text-gray-300 mx-auto mb-2" size={32} />
              <p className="text-gray-500 text-sm uppercase">
                No License or Insurance Records Found
              </p>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <SectionHeader icon={<FaFileAlt size={20} />} title="Documents" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {driver.driving_license && (
              <DocumentItem label="Driving License" path={driver.driving_license} />
            )}
            {driver.aadhaar_card && (
              <DocumentItem label="Aadhaar Card" path={driver.aadhaar_card} />
            )}
            {driver.pan_card && (
              <DocumentItem label="PAN Card" path={driver.pan_card} />
            )}
            {driver.police_verification_doc && (
              <DocumentItem
                label="Police Verification"
                path={driver.police_verification_doc}
              />
            )}
            {driver.medical_fitness_certificate && (
              <DocumentItem
                label="Medical Fitness Certificate"
                path={driver.medical_fitness_certificate}
              />
            )}
            {driver.address_proof_doc && (
              <DocumentItem label="Address Proof" path={driver.address_proof_doc} />
            )}
            {driver.training_certificate_doc && (
              <DocumentItem
                label="Training Certificate"
                path={driver.training_certificate_doc}
              />
            )}
          </div>

          {!driver.driving_license &&
            !driver.aadhaar_card &&
            !driver.pan_card &&
            !driver.police_verification_doc &&
            !driver.medical_fitness_certificate &&
            !driver.address_proof_doc &&
            !driver.training_certificate_doc && (
              <div className="p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
                <FaFileAlt className="text-gray-300 mx-auto mb-2" size={32} />
                <p className="text-gray-500 text-sm uppercase">
                  No Documents Uploaded
                </p>
              </div>
            )}
        </div>

        {/* Remarks / Notes */}
        {driver.remarks && (
          <div className="bg-amber-50 rounded-md shadow-sm border-2 border-amber-200 p-6">
            <div className="flex items-start gap-2">
              <MdWarning className="text-amber-600 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-bold text-amber-800 uppercase mb-2">
                  Remarks / Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {driver.remarks}
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

export default DriverShowPage;
