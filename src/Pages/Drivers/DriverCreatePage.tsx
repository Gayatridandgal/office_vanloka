import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import SaveButton from "../../Components/Form/SaveButton";
import type { Driver } from "../../Types/Index";
import tenantApi from "../../Services/ApiService";

type FormInputs = Driver & {
  // File fields for react-hook-form
  driving_license_document?: FileList;
  aadhaar_card_document?: FileList;
  pan_card_document?: FileList;
  police_verification_document?: FileList;
  medical_fitness_document?: FileList;
  passport_size_photo?: FileList;
  address_proof_document?: FileList;
  badge_psv_authorization?: FileList;
  training_certificate_document?: FileList;
  consent_checkbox_document?: FileList;
};

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      gender: "male",
      employment_type: "Full-time",
      status: "active",
      blood_group: "O+",
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add all text fields
      const textFields = [
        "first_name",
        "last_name",
        "gender",
        "date_of_birth",
        "email",
        "mobile_number",
        "emergency_contact",
        "address_line_1",
        "address_line_2",
        "village",
        "city",
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
        "number_of_dependents",
        "insurance_details",
        "beacon_assigned",
        "vehicle_assigned",
        "status",
        "remarks",
      ];

      textFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Add boolean fields
      const booleanFields = [
        "safety_training_completed",
        "permit_verified",
        "medical_fitness_required",
        "insurance_coverage",
      ];

      booleanFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null) {
          formData.append(field, String(value));
        }
      });

      // Add file uploads
      const fileFields = [
        "profile_photo",
        "driving_license_document",
        "aadhaar_card_document",
        "pan_card_document",
        "police_verification_document",
        "medical_fitness_document",
        "passport_size_photo",
        "address_proof_document",
        "badge_psv_authorization",
        "training_certificate_document",
        "consent_checkbox_document",
      ];

      fileFields.forEach((field) => {
        const files = data[field as keyof FormInputs] as FileList | undefined;
        if (files && files.length > 0) {
          formData.append(field, files[0]);
        }
      });

      const response = await tenantApi.post<{
        success: boolean;
        data: Driver;
      }>("/drivers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert(
          `Driver ${data.first_name} ${data.last_name} created successfully!`,
        );
        navigate("/drivers");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to create driver";
        alert(`Error: ${errorMessage}`);
        console.error("Validation errors:", error.response?.data?.errors);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  // Helper component for required label
  const RequiredLabel = ({ label }: { label: string }) => (
    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
      {label}
      <span className="text-red-600">*</span>
    </label>
  );

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add Driver" buttonLink="/drivers" />
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
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
                  Profile Photo
                </label>
                <input
                  type="file"
                  {...register("profile_photo")}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
                  {...register("village")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  City / Town
                </label>
                <input
                  {...register("city")}
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

          {/* --- Section 3: KYC & License Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              KYC & License Information
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
                  <option value="aadhaar">Aadhaar</option>
                  <option value="pan">PAN</option>
                  <option value="dl">Driving License</option>
                  <option value="voter_id">Voter ID</option>
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
            </div>
          </section>

          {/* --- Section 4: Professional Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Driving Experience (Years)
                </label>
                <input
                  type="number"
                  {...register("driving_experience_years")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Employee ID
                </label>
                <input
                  {...register("employee_id")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 5: Compliance & Health --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Compliance & Health Information
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

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Safety Training Date
                </label>
                <input
                  type="date"
                  {...register("safety_training_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="medical_fitness_required"
                  {...register("medical_fitness_required")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="medical_fitness_required"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  Medical Fitness Required
                </label>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Medical Fitness Date
                </label>
                <input
                  type="date"
                  {...register("medical_fitness_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 6: Emergency & Insurance --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Emergency & Insurance Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Number of Dependents
                </label>
                <input
                  type="number"
                  {...register("number_of_dependents")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Insurance Details
                </label>
                <input
                  {...register("insurance_details")}
                  placeholder="Policy details"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="insurance_coverage"
                  {...register("insurance_coverage")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="insurance_coverage"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  Insurance Coverage
                </label>
              </div>
            </div>
          </section>

          {/* --- Section 7: Tracking & Assignment --- */}
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
                  Vehicle Assigned
                </label>
                <input
                  {...register("vehicle_assigned")}
                  placeholder="Vehicle ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Section 8: Documents --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Required Documents<span className="text-red-600">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <RequiredLabel label="Driving License Document" />
                <input
                  type="file"
                  {...register("driving_license_document", {
                    required: "Driving license is required",
                  })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                {errors.driving_license_document && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.driving_license_document.message}
                  </p>
                )}
              </div>

              <div>
                <RequiredLabel label="Aadhaar Card Document" />
                <input
                  type="file"
                  {...register("aadhaar_card_document", {
                    required: "Aadhaar card is required",
                  })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                {errors.aadhaar_card_document && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.aadhaar_card_document.message}
                  </p>
                )}
              </div>

              <div>
                <RequiredLabel label="PAN Card Document" />
                <input
                  type="file"
                  {...register("pan_card_document", {
                    required: "PAN card is required",
                  })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                {errors.pan_card_document && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pan_card_document.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Police Verification Document
                </label>
                <input
                  type="file"
                  {...register("police_verification_document")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Medical Fitness Document
                </label>
                <input
                  type="file"
                  {...register("medical_fitness_document")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Passport Size Photo
                </label>
                <input
                  type="file"
                  {...register("passport_size_photo")}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Address Proof Document
                </label>
                <input
                  type="file"
                  {...register("address_proof_document")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Badge PSV Authorization
                </label>
                <input
                  type="file"
                  {...register("badge_psv_authorization")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Training Certificate Document
                </label>
                <input
                  type="file"
                  {...register("training_certificate_document")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Consent Checkbox Document
                </label>
                <input
                  type="file"
                  {...register("consent_checkbox_document")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>
          </section>

          {/* --- Section 9: Status & Remarks --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Status & Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Remarks / Notes
                </label>
                <textarea
                  {...register("remarks")}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* --- Form Submission Button --- */}
          <SaveButton label={isSubmitting ? "Saving..." : "Save Driver"} />
        </form>
      </div>
    </div>
  );
};

export default DriverCreatePage;
