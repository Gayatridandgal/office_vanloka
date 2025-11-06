import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import type { Driver } from "../../Types/Index";
import { FaFilePdf, FaImage, FaDownload } from "react-icons/fa";
import tenantApi from "../../Services/ApiService";
import useAsset from "../../Hooks/useAsset";

// Helper component for displaying info fields
const InfoField = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => (
  <div>
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

// Helper component for displaying dates
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

// Helper component for file/document display
const DocumentDisplay = ({
  label,
  filePath,
  fileType = "document",
}: {
  label: string;
  filePath?: string | null;
  fileType?: "image" | "document";
}) => {
  if (!filePath) {
    return (
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
          {label}
        </h4>
        <p className="text-gray-500 italic text-sm">Not Uploaded</p>
      </div>
    );
  }

  const fileUrl = `http://localhost/storage/${filePath}`;
  const fileName = filePath.split("/").pop();
  const isImage =
    fileType === "image" || /\.(jpg|jpeg|png|gif)$/i.test(filePath);

  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
        {label}
      </h4>
      <div className="mt-2 p-3 border border-purple-200 rounded-lg bg-purple-50">
        <div className="flex items-center gap-3 mb-3">
          {isImage ? (
            <FaImage className="text-blue-500 text-xl" />
          ) : (
            <FaFilePdf className="text-red-500 text-xl" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-purple-800 hover:text-purple-600 transition"
            title="Download"
          >
            <FaDownload className="text-lg" />
          </a>
        </div>

        {isImage && (
          <div className="mt-3">
            <img
              src={fileUrl}
              alt={label}
              className="h-32 w-48 object-cover rounded border border-purple-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

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
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Driver Details" buttonLink="/drivers" />
        <div className="text-center py-8">Loading driver data...</div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Driver Not Found" buttonLink="/drivers" />
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || "The requested driver could not be found."}
          </p>
          <button
            onClick={() => navigate("/drivers")}
            className="bg-purple-950 text-white px-4 py-2 rounded"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Driver Details" buttonLink="/drivers" />

      <div className="p-8 mx-auto max-w-7xl rounded-lg shadow-sm">
        {/* Header with Profile Info */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {driver.profile_photo && (
                <img
                  src={asset(driver.profile_photo)}
                  alt={`${driver.first_name} ${driver.last_name}`}
                  className="h-24 w-24 rounded-lg object-cover border-2 border-purple-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-purple-950 mb-2">
                  {driver.first_name} {driver.last_name}
                </h1>
                <p className="text-gray-600">
                  License: {driver.driving_license_number}
                </p>
                {driver.license_type && (
                  <p className="text-gray-600">{driver.license_type}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              {driver.status && (
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      driver.status === "active"
                        ? "bg-green-100 text-green-800"
                        : driver.status === "suspended"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {driver.status.charAt(0).toUpperCase() +
                      driver.status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Contact Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Mobile Number" value={driver.mobile_number} />
            <InfoField label="Email" value={driver.email} />
            <InfoField
              label="Emergency Contact"
              value={driver.emergency_contact}
            />
          </div>
        </section>

        {/* Section 2: Personal Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Gender" value={driver.gender} />
            <DateField label="Date of Birth" value={driver.date_of_birth} />
            <InfoField label="Blood Group" value={driver.blood_group} />
            <InfoField label="Marital Status" value={driver.marital_status} />
            <InfoField
              label="Number of Dependents"
              value={driver.number_of_dependents}
            />
          </div>
        </section>

        {/* Section 3: Address Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Address Line 1" value={driver.address_line_1} />
            <InfoField label="Address Line 2" value={driver.address_line_2} />
            <InfoField label="Village / Locality" value={driver.village} />
            <InfoField label="City / Town" value={driver.city} />
            <InfoField label="District" value={driver.district} />
            <InfoField label="State" value={driver.state} />
            <InfoField label="PIN Code" value={driver.pin_code} />
          </div>
        </section>

        {/* Section 4: KYC Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            KYC Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="KYC Document Type"
              value={driver.kyc_document_type}
            />
            <InfoField
              label="KYC Document Number"
              value={driver.kyc_document_number}
            />
          </div>
        </section>

        {/* Section 5: License Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            License Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="License Number"
              value={driver.driving_license_number}
            />
            <InfoField label="License Type" value={driver.license_type} />
            <DateField
              label="License Issue Date"
              value={driver.license_issue_date}
            />
            <DateField
              label="License Expiry Date"
              value={driver.license_expiry_date}
            />
          </div>
        </section>

        {/* Section 6: Professional Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Employment Type" value={driver.employment_type} />
            <InfoField
              label="Driving Experience (Years)"
              value={driver.driving_experience_years}
            />
            <InfoField label="Employee ID" value={driver.employee_id} />
          </div>
        </section>

        {/* Section 7: Compliance & Health */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Compliance & Health Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Safety Training Completed
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  driver.safety_training_completed
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {driver.safety_training_completed ? "Yes" : "No"}
              </span>
            </div>
            <DateField
              label="Safety Training Date"
              value={driver.safety_training_date}
            />
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Permit Verified
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  driver.permit_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {driver.permit_verified ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Medical Fitness Required
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  driver.medical_fitness_required
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {driver.medical_fitness_required ? "Yes" : "No"}
              </span>
            </div>
            <DateField
              label="Medical Fitness Date"
              value={driver.medical_fitness_date}
            />
          </div>
        </section>

        {/* Section 8: Insurance & Emergency */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Insurance & Emergency Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="Insurance Details"
              value={driver.insurance_details}
            />
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Insurance Coverage
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  driver.insurance_coverage
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {driver.insurance_coverage ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </section>

        {/* Section 9: Tracking & Assignment */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Tracking & Assignment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Beacon Assigned" value={driver.beacon_assigned} />
            <InfoField
              label="Vehicle Assigned"
              value={driver.vehicle_assigned}
            />
          </div>
        </section>

        {/* Section 10: Documents */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            Required Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DocumentDisplay
              label="Driving License Document"
              filePath={asset(driver.driving_license_document)}
            />
            <DocumentDisplay
              label="Aadhaar Card Document"
              filePath={asset(driver.aadhaar_card_document)}
            />
            <DocumentDisplay
              label="PAN Card Document"
              filePath={asset(driver.pan_card_document)}
            />
            <DocumentDisplay
              label="Police Verification Document"
              filePath={asset(driver.police_verification_document)}
            />
            <DocumentDisplay
              label="Medical Fitness Document"
              filePath={asset(driver.medical_fitness_document)}
            />
            <DocumentDisplay
              label="Passport Size Photo"
              filePath={asset(driver.passport_size_photo)}
              fileType="image"
            />
            <DocumentDisplay
              label="Address Proof Document"
              filePath={asset(driver.address_proof_document)}
            />
            <DocumentDisplay
              label="Badge PSV Authorization"
              filePath={asset(driver.badge_psv_authorization)}
            />
            <DocumentDisplay
              label="Training Certificate Document"
              filePath={asset(driver.training_certificate_document)}
            />
            <DocumentDisplay
              label="Consent Checkbox Document"
              filePath={asset(driver.consent_checkbox_document)}
            />
          </div>
        </section>

        {/* Section 11: Remarks */}
        {driver.remarks && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
              Remarks & Notes
            </h2>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-950 leading-relaxed">
                {driver.remarks}
              </p>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/drivers/edit/${driver.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Edit Driver
          </button>
          <button
            onClick={() => navigate("/drivers")}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverShowPage;
