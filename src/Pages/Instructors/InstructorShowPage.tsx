import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import type { Instructor } from "./Instructor.types";
import {
  FaStar,
  FaGraduationCap,
  FaCertificate,
  FaUsers,
} from "react-icons/fa";
import tenantApi, { tenantAsset } from "../../Services/ApiService";

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
  const daysUntilExpiry = Math.ceil(
    (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </h4>
      <p
        className={`text-sm font-medium ${
          isExpired
            ? "text-red-600"
            : isExpiringSoon
              ? "text-orange-600"
              : "text-purple-950"
        }`}
      >
        {date.toLocaleDateString("en-IN")}
        {isExpired && (
          <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded">
            Expired
          </span>
        )}
        {isExpiringSoon && (
          <span className="ml-2 text-xs bg-orange-100 px-2 py-1 rounded">
            Expiring Soon
          </span>
        )}
      </p>
    </div>
  );
};

// Card component for highlight sections
const HighlightCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  className = "",
}: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}) => (
  <div
    className={`p-4 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 ${className}`}
  >
    <div className="flex items-start gap-3">
      <Icon className="text-purple-600 text-2xl mt-1" />
      <div>
        <h4 className="text-xs font-bold text-gray-600 uppercase">{title}</h4>
        <p className="text-lg font-bold text-purple-950 mt-1">{value || "—"}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const InstructorShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const fetchInstructor = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get(`/instructors/${id}`);

      if (response.data.data) {
        setInstructor(response.data.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch instructor details";
      setError(errorMessage);
      console.error("Error fetching instructor:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Instructor Details" buttonLink="/instructors" />
        <div className="text-center py-8">Loading instructor data...</div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack
          title="Instructor Not Found"
          buttonLink="/instructors"
        />
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || "The requested instructor could not be found."}
          </p>
          <button
            onClick={() => navigate("/instructors")}
            className="bg-purple-950 text-white px-4 py-2 rounded"
          >
            Back to Instructors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Instructor Details" buttonLink="/instructors" />

      <div className="p-8 mx-auto max-w-7xl rounded-lg shadow-sm">
        {/* Header with Profile Info */}
        <div className="mb-8 pb-6 border-b-2 border-purple-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {instructor.profile_photo_path && (
                <img
                  src={`${tenantAsset}${instructor.profile_photo_path}`}
                  alt={`${instructor.first_name} ${instructor.last_name}`}
                  className="h-24 w-24 rounded-lg object-cover border-4 border-purple-300 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-purple-950 mb-2">
                  {instructor.first_name} {instructor.last_name}
                </h1>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Certification:</span>{" "}
                  {instructor.instructor_certification_number || "—"}
                </p>
                {instructor.instructor_type && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Type:</span>{" "}
                    {instructor.instructor_type}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              {instructor.instructor_rating_internal && (
                <div className="bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200 mb-3">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <FaStar className="text-yellow-500 text-lg" />
                    <span className="text-2xl font-bold text-purple-950">
                      {instructor.instructor_rating_internal}
                    </span>
                    <span className="text-gray-600 text-sm">/5.0</span>
                  </div>
                  <p className="text-xs text-gray-600">Internal Rating</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightCard
            icon={FaUsers}
            title="Students Trained"
            value={instructor.no_of_students_trained || 0}
          />
          <HighlightCard
            icon={FaGraduationCap}
            title="Instructor Type"
            value={instructor.instructor_type || "—"}
          />
          <HighlightCard
            icon={FaCertificate}
            title="Experience"
            value={`${instructor.driving_experience_years || 0} yrs`}
          />
          <HighlightCard
            icon={FaStar}
            title="License Type"
            value={instructor.license_type || "—"}
          />
        </section>

        {/* Section 1: Contact Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            📞 Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Mobile Number" value={instructor.mobile_number} />
            <InfoField label="Email" value={instructor.email} />
            <InfoField
              label="Emergency Contact"
              value={instructor.emergency_contact}
            />
            <InfoField
              label="Emergency Contact Name"
              value={instructor.emergency_contact_name}
            />
          </div>
        </section>

        {/* Section 2: Personal Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            👤 Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Gender" value={instructor.gender} />
            <DateField label="Date of Birth" value={instructor.date_of_birth} />
            <InfoField label="Blood Group" value={instructor.blood_group} />
            <InfoField
              label="Marital Status"
              value={instructor.marital_status}
            />
            <InfoField
              label="Number of Family Dependents"
              value={instructor.no_of_family_dependents}
            />
          </div>
        </section>

        {/* Section 3: Address Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            📍 Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="Address Line 1"
              value={instructor.address_line_1}
            />
            <InfoField
              label="Address Line 2"
              value={instructor.address_line_2}
            />
            <InfoField
              label="Village / Locality"
              value={instructor.village_locality}
            />
            <InfoField label="City / Town" value={instructor.city_town} />
            <InfoField label="District" value={instructor.district} />
            <InfoField label="State" value={instructor.state} />
            <InfoField label="PIN Code" value={instructor.pin_code} />
          </div>
        </section>

        {/* Section 4: KYC Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            🆔 KYC & Identity Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="KYC Document Type"
              value={instructor.kyc_document_type}
            />
            <InfoField
              label="KYC Document Number"
              value={instructor.kyc_document_number}
            />
            <InfoField
              label="Aadhaar Number"
              value={instructor.aadhaar_number}
            />
            <InfoField label="PAN Number" value={instructor.pan_number} />
          </div>
        </section>

        {/* Section 5: Driving License Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            🚗 Driving License Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="License Number"
              value={instructor.driving_license_number}
            />
            <InfoField label="License Type" value={instructor.license_type} />
            <DateField
              label="License Issue Date"
              value={instructor.license_issue_date}
            />
            <DateField
              label="License Expiry Date"
              value={instructor.license_expiry_date}
            />
          </div>
        </section>

        {/* Section 6: Employment Information */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            💼 Employment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Employee ID" value={instructor.employee_id} />
            <InfoField
              label="Employment Type"
              value={instructor.employment_type}
            />
            <InfoField
              label="Driving Experience (Years)"
              value={instructor.driving_experience_years}
            />
          </div>
        </section>

        {/* Section 7: Instructor Certification */}
        <section className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-blue-200">
            🎓 Instructor Certification Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="Certification Number"
              value={instructor.instructor_certification_number}
            />
            <InfoField
              label="Issuing Authority"
              value={instructor.certification_issuing_authority}
            />
            <InfoField
              label="Instructor Type"
              value={instructor.instructor_type}
            />
            <DateField
              label="Validity Start Date"
              value={instructor.certification_validity_start_date}
            />
            <DateField
              label="Expiry Date"
              value={instructor.certification_expiry_date}
            />
            <InfoField
              label="Languages Taught"
              value={instructor.languages_taught}
            />
          </div>
        </section>

        {/* Section 8: Training Details */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            📚 Training Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Training Modules Covered"
              value={instructor.training_modules_covered}
            />
            <InfoField
              label="Number of Students Trained"
              value={instructor.no_of_students_trained}
            />
            <InfoField
              label="Affiliated School Name"
              value={instructor.affiliated_driving_school_name}
            />
            <InfoField
              label="School Registration Number"
              value={instructor.driving_school_registration_number}
            />
            <DateField
              label="Last Training Session"
              value={instructor.last_training_session_date}
            />
          </div>
        </section>

        {/* Section 9: Health & Safety */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            🏥 Health & Safety Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Blood Group" value={instructor.blood_group} />
            <InfoField
              label="Medical Conditions"
              value={instructor.medical_conditions}
            />
            <InfoField label="Insurance" value={instructor.insurance} />
            <InfoField
              label="Insurance Policy Number"
              value={instructor.insurance_policy_number}
            />
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Safety Training Completed
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  instructor.safety_training_completed
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {instructor.safety_training_completed ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Permit Verified
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  instructor.permit_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {instructor.permit_verified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </section>

        {/* Section 10: Tracking & Assignment */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            📡 Tracking & Assignment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Beacon Assigned"
              value={instructor.beacon_assigned}
            />
            <InfoField
              label="GPS Beacon Assigned"
              value={instructor.gps_beacon_assigned}
            />
          </div>
        </section>

        {/* Section 11: Consent */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
            ✅ Consent & Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                Digital Training Consent
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  instructor.digital_training_consent
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {instructor.digital_training_consent ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </section>

        {/* Remarks */}
        {instructor.instructor_remarks_notes && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-950 mb-4 pb-2 border-b-2 border-purple-200">
              📝 Remarks & Notes
            </h2>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-950 leading-relaxed">
                {instructor.instructor_remarks_notes}
              </p>
            </div>
          </section>
        )}

        {/* Section 12: Timestamps */}
        <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Created At"
              value={
                instructor.created_at
                  ? new Date(instructor.created_at).toLocaleString("en-IN")
                  : "—"
              }
            />
            <InfoField
              label="Updated At"
              value={
                instructor.updated_at
                  ? new Date(instructor.updated_at).toLocaleString("en-IN")
                  : "—"
              }
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t-2 border-purple-200">
          <button
            onClick={() => navigate(`/instructors/edit/${instructor.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
          >
            Edit Instructor
          </button>
          <button
            onClick={() => navigate("/instructors")}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorShowPage;
