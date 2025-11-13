import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import tenantApi from "../../Services/ApiService";
import useAsset from "../../Hooks/useAsset";
import DetailItem from "../../Components/UI/DetailItem";
import type { Driver } from "./Driver.types";
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
    {value || "N/A"}
  </span>
);

const DriverShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 uppercase text-sm">Loading Driver Details...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="px-4 bg-white min-h-screen text-center py-10">
        <h1 className="text-2xl font-bold uppercase">Driver not found.</h1>
        <p className="text-red-600 mt-4 uppercase">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white  min-h-screen">
      <PageHeaderBack title="Back" buttonLink="/drivers" />

      <div className="p-10 mx-auto max-w-7xl rounded-lg shadow-md bg-white border border-gray-200">
        {/* Header with Profile Photo and Status */}
        <div className="mb-8 pb-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-start gap-4">
            {driver.profile_photo && (
              <img
                src={asset(driver.profile_photo) || ""}
                alt={`${driver.first_name} ${driver.last_name}`}
                className="h-24 w-24 rounded-lg object-cover border-2 border-purple-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-purple-950 uppercase">
                {driver.first_name} {driver.last_name}
              </h1>
              <p className="text-gray-600 text-sm uppercase mt-1">
                Employee ID: {driver.employee_id || "N/A"}
              </p>
              <p className="text-gray-600 text-sm uppercase">
                {driver.employment_type || "N/A"}
              </p>
            </div>
          </div>
          <div className="text-right">
            {driver.status && (
              <span
                className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase ${driver.status === "active"
                  ? "bg-green-100 text-green-800"
                  : driver.status === "suspended"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                {driver.status}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <SectionHeader title="Basic Information" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="First Name" value={driver.first_name} />
            <DetailItem label="Last Name" value={driver.last_name} />
            <DetailItem label="Gender" value={driver.gender} />
            <DetailItem label="Date of Birth" value={formatDate(driver.date_of_birth)} />
            <DetailItem label="Blood Group" value={driver.blood_group} />
            <DetailItem label="Marital Status" value={driver.marital_status} />
            <DetailItem label="Number of Dependents" value={driver.number_of_dependents} />
            <DetailItem label="Mobile Number" value={driver.mobile_number} />
            <DetailItem label="Email" value={driver.email} />
            <DetailItem label="Beacon Assigned" value={driver.beacon} />
            <DetailItem label="Vehicle Assigned" value={driver.vehicle} />
          </div>


          {/* Emergency Contact Persons */}
          <SectionHeader title="Emergency Contact Person" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="Name" value={driver.primary_person_name} />
            <DetailItem label="Email" value={driver.primary_person_email} />
            <DetailItem label="Primary Number" value={driver.primary_person_phone_1} />
            <DetailItem label="Secondary Number" value={driver.primary_person_phone_2} />
            <DetailItem label="Name" value={driver.secondary_person_name} />
            <DetailItem label="Email" value={driver.secondary_person_email} />
            <DetailItem label="Primary Number" value={driver.secondary_person_phone_1} />
            <DetailItem label="Secondary Number" value={driver.secondary_person_phone_2} />
          </div>


          {/* Address Details */}
          <SectionHeader title="Address Details" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="Address Line 1" value={driver.address_line_1} />
            <DetailItem label="Address Line 2" value={driver.address_line_2} />
            <DetailItem label="Landmark" value={driver.landmark} />
            <DetailItem label="City" value={driver.city} />
            <DetailItem label="District" value={driver.district} />
            <DetailItem label="State" value={driver.state} />
            <DetailItem label="PIN Code" value={driver.pin_code} />
          </div>

          {/* Professional Information */}
          <SectionHeader title="Professional Information" />
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2">
            <DetailItem label="Employment Type" value={driver.employment_type} />
            <DetailItem label="Employee ID" value={driver.employee_id} />
            <DetailItem label="Driving Experience (Years)" value={driver.driving_experience} />
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
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
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
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
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
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

          {/* License & Insurance Information */}
          <SectionHeader title="License & Insurance Information" />
          {driver.license_insurance && driver.license_insurance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-2">
              {driver.license_insurance.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase">
                    {item.type?.replace(/_/g, " ") || "Record"}
                  </h4>
                  <div className="space-y-2">

                    <p className="text-xs text-gray-600 uppercase">
                      <span className="font-semibold">Document Number:</span> {item.number || "-"}
                    </p>
                    <p className="text-xs text-gray-600 uppercase">
                      <span className="font-semibold">Issue Date:</span>{" "}
                      {formatDate(item.issue_date)}
                    </p>
                    <p className="text-xs text-gray-600 uppercase">
                      <span className="font-semibold">Expiry Date:</span>{" "}
                      {formatDate(item.exp_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg text-center px-2">
              <p className="text-gray-500 text-sm uppercase">
                No License or Insurance Records Found
              </p>
            </div>
          )}



          {/* Documents */}
          <SectionHeader title="Documents" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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


          {/* Remarks / Notes */}
          {driver.remarks && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap uppercase">
                Remarks: {driver.remarks}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/drivers")}
            className="px-6 py-2 bg-gray-500 font-bold text-white text-sm rounded-md hover:bg-gray-600 uppercase"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverShowPage;
