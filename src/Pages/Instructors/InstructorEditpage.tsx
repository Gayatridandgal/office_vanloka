import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import SaveButton from "../../Components/Form/SaveButton";
import type { Instructor } from "./Instructor.types";
import tenantApi from "../../Services/ApiService";

type FormInputs = Instructor & {
  profile_photo_file?: FileList;
};

const InstructorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      gender: "Male",
      employment_type: "Full-time",
      blood_group: "O+",
      instructor_type: "Practical",
      insurance: "No",
    },
  });

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const fetchInstructor = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get(`/instructors/${id}`);
      const data = response.data.data;

      // Helper to format dates for input fields
      const formatDate = (date?: string | null) => {
        if (!date) return "";
        return date.split("T")[0];
      };

      // Reset form with fetched data - flatten nested structure
      reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        gender: data.gender || "Male",
        date_of_birth: formatDate(data.date_of_birth),
        profile_photo_path: data.profile_photo_path || "",
        email: data.email || "",
        mobile_number: data.mobile_number || "",
        emergency_contact: data.emergency_contact || "",
        emergency_contact_name: data.emergency_contact_name || "",
        // Address
        address_line_1: data.address?.line_1 || "",
        address_line_2: data.address?.line_2 || "",
        village_locality: data.address?.village_locality || "",
        city_town: data.address?.city_town || "",
        district: data.address?.district || "",
        state: data.address?.state || "",
        pin_code: data.address?.pin_code || "",
        // KYC
        kyc_document_type: data.kyc?.document_type || "",
        kyc_document_number: data.kyc?.document_number || "",
        aadhaar_number: data.kyc?.aadhaar_number || "",
        pan_number: data.kyc?.pan_number || "",
        // Driving License
        driving_license_number: data.driving_license?.number || "",
        license_issue_date: formatDate(data.driving_license?.issue_date),
        license_expiry_date: formatDate(data.driving_license?.expiry_date),
        license_type: data.driving_license?.type || "",
        // Personal
        marital_status: data.marital_status || "",
        no_of_family_dependents: data.no_of_family_dependents || undefined,
        // Employment
        employee_id: data.employment?.employee_id || "",
        employment_type: data.employment?.type || "Full-time",
        driving_experience_years:
          data.employment?.driving_experience_years || undefined,
        // Health
        blood_group: data.health?.blood_group || "O+",
        medical_conditions: data.health?.medical_conditions || "",
        insurance: data.health?.insurance || "No",
        insurance_policy_number: data.health?.insurance_policy_number || "",
        safety_training_completed: data.safety_training_completed || false,
        permit_verified: data.permit_verified || false,
        // Tracking
        beacon_assigned: data.beacon_assigned || "",
        gps_beacon_assigned: data.gps_beacon_assigned || "",
        // Certification
        instructor_certification_number: data.certification?.number || "",
        certification_issuing_authority:
          data.certification?.issuing_authority || "",
        certification_validity_start_date: formatDate(
          data.certification?.validity_start_date,
        ),
        certification_expiry_date: formatDate(data.certification?.expiry_date),
        instructor_type: data.instructor_type || "Practical",
        languages_taught: data.languages_taught || "",
        training_modules_covered: data.training_modules_covered || "",
        no_of_students_trained: data.no_of_students_trained || undefined,
        // Affiliated School
        affiliated_driving_school_name:
          data.affiliated_driving_school?.name || "",
        driving_school_registration_number:
          data.affiliated_driving_school?.registration_number || "",
        instructor_rating_internal:
          data.instructor_rating_internal || undefined,
        last_training_session_date: formatDate(data.last_training_session_date),
        digital_training_consent: data.digital_training_consent || false,
        instructor_remarks_notes: data.instructor_remarks_notes || "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch instructor";
      setError(errorMessage);
      console.error("Error fetching instructor:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();

      // Add _method field for Laravel PUT support
      formData.append("_method", "PUT");

      // Add all text fields
      const textFields = [
        "first_name",
        "last_name",
        "gender",
        "date_of_birth",
        "email",
        "mobile_number",
        "emergency_contact",
        "emergency_contact_name",
        "address_line_1",
        "address_line_2",
        "village_locality",
        "city_town",
        "district",
        "state",
        "pin_code",
        "kyc_document_type",
        "kyc_document_number",
        "driving_license_number",
        "license_issue_date",
        "license_expiry_date",
        "license_type",
        "employment_type",
        "driving_experience_years",
        "employee_id",
        "blood_group",
        "marital_status",
        "no_of_family_dependents",
        "aadhaar_number",
        "pan_number",
        "insurance",
        "insurance_policy_number",
        "medical_conditions",
        "beacon_assigned",
        "gps_beacon_assigned",
        "instructor_certification_number",
        "certification_issuing_authority",
        "certification_validity_start_date",
        "certification_expiry_date",
        "instructor_type",
        "languages_taught",
        "training_modules_covered",
        "no_of_students_trained",
        "affiliated_driving_school_name",
        "driving_school_registration_number",
        "instructor_rating_internal",
        "last_training_session_date",
        "instructor_remarks_notes",
      ];

      textFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Add boolean fields - ALWAYS send as 1 or 0
      const booleanFields = [
        "safety_training_completed",
        "permit_verified",
        "digital_training_consent",
      ];

      booleanFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        // Convert to 1 or 0, always send the value
        formData.append(field, value ? "1" : "0");
      });

      // Add file uploads (only if new files are selected)
      const fileFields = ["profile_photo_file"];

      fileFields.forEach((field) => {
        const files = data[field as keyof FormInputs] as FileList | undefined;
        if (files && files.length > 0) {
          formData.append("profile_photo_path", files[0]);
        }
      });

      const response = await tenantApi.post<{
        success: boolean;
        data: Instructor;
      }>(`/instructors/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert(`Instructor ${data.first_name} updated successfully!`);
        navigate(`/instructors/show/${id}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update instructor";
        alert(`Error: ${errorMessage}`);
        console.error("Validation errors:", error.response?.data?.errors);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  if (loading) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Edit Instructor" buttonLink="/instructors" />
        <div className="text-center py-8">Loading instructor data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Edit Instructor" buttonLink="/instructors" />
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  const RequiredLabel = ({ label }: { label: string }) => (
    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
      {label}
      <span className="text-red-600">*</span>
    </label>
  );

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Edit Instructor" buttonLink="/instructors" />
      <div className="p-10 mx-auto max-w-6xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Basic Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                required="First name is required."
              />
              <StarInputField
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                required="Last name is required."
              />

              <div>
                <RequiredLabel label="Gender" />
                <select
                  {...register("gender", {
                    required: "Gender is required.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <StarInputField
                label="Date of Birth"
                name="date_of_birth"
                register={register}
                errors={errors}
                required="Date of birth is required."
                type="date"
              />

              <StarInputField
                label="Email"
                name="email"
                register={register}
                errors={errors}
                type="email"
                placeholder="example@email.com"
              />

              <StarInputField
                label="Mobile Number"
                name="mobile_number"
                register={register}
                errors={errors}
                required="Mobile number is required."
                placeholder="10-digit number"
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  {...register("emergency_contact")}
                  placeholder="10-digit number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Emergency Contact Name
                </label>
                <input
                  {...register("emergency_contact_name")}
                  placeholder="Name of emergency contact"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Profile Photo
                </label>
                <input
                  type="file"
                  {...register("profile_photo_file")}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
              </div>
            </div>
          </section>

          {/* --- Section 2: Address Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Address Line 1
                </label>
                <input
                  {...register("address_line_1")}
                  placeholder="House No., Street, Landmark"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Address Line 2
                </label>
                <input
                  {...register("address_line_2")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Village / Locality
                </label>
                <input
                  {...register("village_locality")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  City / Town
                </label>
                <input
                  {...register("city_town")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  District
                </label>
                <input
                  {...register("district")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  State
                </label>
                <input
                  {...register("state")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  PIN Code
                </label>
                <input
                  {...register("pin_code")}
                  placeholder="6-digit code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 3: KYC & Identity Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              KYC & Identity Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  KYC Document Type
                </label>
                <select
                  {...register("kyc_document_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="DL">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  KYC Document Number
                </label>
                <input
                  {...register("kyc_document_number")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Aadhaar Number
                </label>
                <input
                  {...register("aadhaar_number")}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  PAN Number
                </label>
                <input
                  {...register("pan_number")}
                  placeholder="10-character PAN"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 4: Driving License Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Driving License Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Driving License Number"
                name="driving_license_number"
                register={register}
                errors={errors}
                required="Driving license number is required."
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  License Issue Date
                </label>
                <input
                  type="date"
                  {...register("license_issue_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  {...register("license_expiry_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  License Type
                </label>
                <select
                  {...register("license_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  <option value="LMV">LMV</option>
                  <option value="HMV">HMV</option>
                  <option value="PSV">PSV</option>
                  <option value="Transport">Transport</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Driving Experience (Years)
                </label>
                <input
                  type="number"
                  {...register("driving_experience_years")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 5: Employment Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Employment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Employee ID
                </label>
                <input
                  {...register("employee_id")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Employment Type
                </label>
                <select
                  {...register("employment_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Self-employed">Self-employed</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Marital Status
                </label>
                <select
                  {...register("marital_status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Number of Family Dependents
                </label>
                <input
                  type="number"
                  {...register("no_of_family_dependents")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 6: Health & Safety --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Health & Safety Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Blood Group
                </label>
                <select
                  {...register("blood_group")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Medical Conditions
                </label>
                <input
                  {...register("medical_conditions")}
                  placeholder="Any medical conditions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Insurance
                </label>
                <select
                  {...register("insurance")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Insurance Policy Number
                </label>
                <input
                  {...register("insurance_policy_number")}
                  placeholder="Policy number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="safety_training_completed"
                  {...register("safety_training_completed")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="safety_training_completed"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  Safety Training Completed
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permit_verified"
                  {...register("permit_verified")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="permit_verified"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  Permit Verified
                </label>
              </div>
            </div>
          </section>

          {/* --- Section 7: Certification Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Instructor Certification Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Instructor Certification Number"
                name="instructor_certification_number"
                register={register}
                errors={errors}
                required="Certification number is required."
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Certification Issuing Authority
                </label>
                <select
                  {...register("certification_issuing_authority")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Authority</option>
                  <option value="RTO">RTO</option>
                  <option value="Accredited Institute">
                    Accredited Institute
                  </option>
                  <option value="Govt Program">Govt Program</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Certification Validity Start Date
                </label>
                <input
                  type="date"
                  {...register("certification_validity_start_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Certification Expiry Date
                </label>
                <input
                  type="date"
                  {...register("certification_expiry_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Instructor Type
                </label>
                <select
                  {...register("instructor_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Simulator">Simulator</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Languages Taught
                </label>
                <input
                  {...register("languages_taught")}
                  placeholder="e.g., Kannada, Hindi, English"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 8: Training Details --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Training Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Training Modules Covered
                </label>
                <input
                  {...register("training_modules_covered")}
                  placeholder="e.g., Road Safety Rules, Vehicle Control"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Number of Students Trained
                </label>
                <input
                  type="number"
                  {...register("no_of_students_trained")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Affiliated Driving School Name
                </label>
                <input
                  {...register("affiliated_driving_school_name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Driving School Registration Number
                </label>
                <input
                  {...register("driving_school_registration_number")}
                  placeholder="UDYAM / RTO / Trust ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Instructor Rating (Internal)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  {...register("instructor_rating_internal")}
                  placeholder="1-5 rating"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Last Training Session Date
                </label>
                <input
                  type="date"
                  {...register("last_training_session_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 9: Tracking & Assignment --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Tracking & Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Beacon Assigned
                </label>
                <input
                  {...register("beacon_assigned")}
                  placeholder="Beacon ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  GPS Beacon Assigned
                </label>
                <input
                  {...register("gps_beacon_assigned")}
                  placeholder="GPS Beacon ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 10: Consent & Remarks --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Consent & Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="digital_training_consent"
                  {...register("digital_training_consent")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="digital_training_consent"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  Digital Training Consent
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Instructor Remarks / Notes
                </label>
                <textarea
                  {...register("instructor_remarks_notes")}
                  placeholder="Performance notes, special conditions..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Form Submission Buttons --- */}
          <div className="flex gap-4">
            <SaveButton
              label={isSubmitting ? "Updating..." : "Update Instructor"}
            />
            <button
              type="button"
              onClick={() => navigate("/instructors")}
              className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorEditPage;
