import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import SaveButton from "../../Components/Form/SaveButton";
import tenantApi from "../../Services/ApiService";
import InputField from "../../Components/Form/InputField";
import type { Driver } from "./Driver.types";
import { ImCross, ImPlus } from "react-icons/im";

type FormInputs = Driver & {
  // File fields for react-hook-form
  profile_photo?: FileList;
  driving_license?: FileList;
  aadhaar_card?: FileList;
  pan_card?: FileList;
  police_verification_doc?: FileList;
  medical_fitness_certificate?: FileList;
  address_proof_doc?: FileList;
  training_certificate_doc?: FileList;
};

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    watch,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "license_insurance",
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();

      // Basic Information
      const basicFields = [
        "first_name",
        "last_name",
        "gender",
        "date_of_birth",
        "email",
        "mobile_number",
        "blood_group",
        "marital_status",
        "number_of_dependents",
      ];

      basicFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Emergency Contacts
      const contactFields = [
        "primary_person_name",
        "primary_person_email",
        "primary_person_phone_1",
        "primary_person_phone_2",
        "secondary_person_name",
        "secondary_person_email",
        "secondary_person_phone_1",
        "secondary_person_phone_2",
      ];

      contactFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Address
      const addressFields = [
        "address_line_1",
        "address_line_2",
        "landmark",
        "city",
        "district",
        "state",
        "pin_code",
      ];

      addressFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Professional Information
      const professionalFields = [
        "employment_type",
        "employee_id",
        "safety_training_completion",
        "safety_training_completion_date",
        "medical_fitness",
        "medical_fitness_exp_date",
        "driving_experience",
        "police_verification",
        "police_verification_date",
        
      ];

      professionalFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Bank Information
      const bankAccountFields = [
        "bank_name",
        "account_number",
        "ifsc_code",
        "account_holder_name",
      ];

      bankAccountFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // License/Insurance Array (JSON string)
      if (data.license_insurance && data.license_insurance.length > 0) {
        formData.append("license_insurance", JSON.stringify(data.license_insurance));
      }

      // Tracking & Assignment
      if (data.beacon) formData.append("beacon", data.beacon);
      if (data.vehicle) formData.append("vehicle", data.vehicle);

      // Status & Remarks
      if (data.status) formData.append("status", data.status);
      if (data.remarks) formData.append("remarks", data.remarks);

      // File uploads
      const fileFields: Array<keyof FormInputs> = [
        "profile_photo",
        "driving_license",
        "aadhaar_card",
        "pan_card",
        "police_verification_doc",
        "medical_fitness_certificate",
        "address_proof_doc",
        "training_certificate_doc",
      ];

      fileFields.forEach((field) => {
        const files = data[field] as FileList | undefined;
        if (files && files.length > 0) {
          formData.append(field, files[0]);
        }
      });

      const response = await tenantApi.post<{
        success: boolean;
        data: Driver;
        message: string;
      }>("/drivers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert(
          `Driver ${data.first_name} ${data.last_name} created successfully!`
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
      <div className="p-10 mx-auto max-w-7xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Basic Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <option value="">Select</option>
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
              />

              <StarInputField
                label="Mobile Number"
                name="mobile_number"
                register={register}
                errors={errors}
                required="Mobile number is required."
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Blood Group
                </label>
                <select
                  {...register("blood_group")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select</option>
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
                  Marital Status
                </label>
                <select
                  {...register("marital_status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select</option>
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
                  Profile Photo
                </label>
                <input
                  type="file"
                  {...register("profile_photo")}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none file:text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              Emergency Contact Person
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="primary_person_name"
                register={register}
                errors={errors}
              />
              <InputField
                label="Primary Phone"
                name="primary_person_phone_1"
                register={register}
                errors={errors}
              />
              <InputField
                label="Secondary Phone"
                name="primary_person_phone_2"
                register={register}
                errors={errors}
              />
              <InputField
                label="Email"
                name="primary_person_email"
                type="email"
                register={register}
                errors={errors}
              />
            </div>

            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mt-4 mb-4">
              Secondary Contact Person
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="secondary_person_name"
                register={register}
                errors={errors}
              />
              <InputField
                label="Primary Phone"
                name="secondary_person_phone_1"
                register={register}
                errors={errors}
              />
              <InputField
                label="Secondary Phone"
                name="secondary_person_phone_2"
                register={register}
                errors={errors}
              />
              <InputField
                label="Email"
                name="secondary_person_email"
                type="email"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* --- Section 2: Address Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Address Line 1"
                name="address_line_1"
                register={register}
                errors={errors}
              />
              <InputField
                label="Address Line 2"
                name="address_line_2"
                register={register}
                errors={errors}
              />
              <InputField
                label="Landmark"
                name="landmark"
                register={register}
                errors={errors}
              />
              <InputField
                label="State"
                name="state"
                register={register}
                errors={errors}
              />
              <InputField
                label="District"
                name="district"
                register={register}
                errors={errors}
              />
              <InputField
                label="City"
                name="city"
                register={register}
                errors={errors}
              />
              <InputField
                label="PIN Code"
                name="pin_code"
                register={register}
                errors={errors}
              />
            </div>
          </section>

          {/* --- Section 4: Professional Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Employment Type
                </label>
                <select
                  {...register("employment_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Self-employed">Self-employed</option>
                </select>
              </div>

              <InputField
                label="Employee ID"
                name="employee_id"
                register={register}
                errors={errors}
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Driving Experience (Years)
                </label>
                <input
                  type="number"
                  {...register("driving_experience")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Safety Training Completed */}
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Safety Training Completed
                </label>
                <select
                  {...register("safety_training_completion")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              {/* Conditional: Show date only if YES */}
              {watch("safety_training_completion") === "YES" && (
                <div>
                  <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                    Training Completion Date
                  </label>
                  <input
                    type="date"
                    {...register("safety_training_completion_date")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Medical Fitness Issued */}
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Medical Fitness Issued
                </label>
                <select
                  {...register("medical_fitness")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              {/* Conditional: Show expiry date only if YES */}
              {watch("medical_fitness") === "YES" && (
                <div>
                  <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                    Medical Fitness Expiry Date
                  </label>
                  <input
                    type="date"
                    {...register("medical_fitness_exp_date")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Police Verification */}
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Police Verification
                </label>
                <select
                  {...register("police_verification")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              {/* Conditional: Show verification date only if YES */}
              {watch("police_verification") === "YES" && (
                <div>
                  <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                    Police Verification Date
                  </label>
                  <input
                    type="date"
                    {...register("police_verification_date")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          </section>

          {/* --- Section 2: Address Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Bank Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <InputField
                label="Bank Name"
                name="bank_name"
                register={register}
                errors={errors}
              />
              <InputField
                label="Account Holder Name"
                name="account_holder_name"
                register={register}
                errors={errors}
              />
               <InputField
                label="Account Number"
                name="account_number"
                register={register}
                errors={errors}
              />
              <InputField
                label="Ifsc code"
                name="ifsc_code"
                register={register}
                errors={errors}
              />
            </div>
          </section>

          {/* License/Insurance Section */}
          <div className="mb-6">
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              License / Insurance Information
            </h2>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4 mb-3 items-end bg-gray-50 p-3 rounded border border-gray-200"
              >
                {/* Type Dropdown */}
                <div>
                  <label className="block text-purple-950 uppercase text-xs font-bold mb-1">
                    Type
                  </label>
                  <select
                    {...register(`license_insurance.${index}.type`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">SELECT</option>
                    <option value="life_insurance">Life Insurance</option>
                    <option value="license">License</option>
                    <option value="health_insurance">Health Insurance</option>
                  </select>
                </div>

                {/* Number */}
                <InputField
                  label="Document Number"
                  name={`license_insurance.${index}.number`}
                  register={register}
                  errors={errors}
                />

                {/* Issue Date */}
                <div>
                  <label className="block text-purple-950 uppercase text-xs font-bold mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    {...register(`license_insurance.${index}.issue_date`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Exp Date */}
                <div>
                  <label className="block text-purple-950 uppercase text-xs font-bold mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    {...register(`license_insurance.${index}.exp_date`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-500 w-10 text-white font-bold px-3 py-2 rounded-lg hover:bg-red-600 transition-colors h-10"
                >
                  <ImCross />
                </button>
              </div>
            ))}

            {/* Add Button */}
            <button
              type="button"
              onClick={() =>
                append({
                  type: "",
                  number: "",
                  issue_date: "",
                  exp_date: "",
                })
              }
              className="bg-green-300 text-purple-950 uppercase text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors"
            >
              <ImPlus className="inline mr-1" /> Add Entry
            </button>
          </div>

          {/* --- Section 7: Tracking & Assignment --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Tracking & Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Beacon Assigned"
                name="beacon"
                register={register}
                errors={errors}
              />
              <InputField
                label="Vehicle Assigned"
                name="vehicle"
                register={register}
                errors={errors}
              />
            </div>
          </section>

          {/* --- Section 8: Documents --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Required Documents<span className="text-red-600">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <RequiredLabel label="Driving License" />
                <input
                  type="file"
                  {...register("driving_license", {
                    required: "Driving license is required",
                  })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                {errors.driving_license && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.driving_license.message as string}
                  </p>
                )}
              </div>

              <div>
                <RequiredLabel label="Aadhaar Card" />
                <input
                  type="file"
                  {...register("aadhaar_card", {
                    required: "Aadhaar card is required",
                  })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                {errors.aadhaar_card && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.aadhaar_card.message as string}
                  </p>
                )}
              </div>

              <div>
                <RequiredLabel label="PAN Card" />
                <input
                  type="file"
                  {...register("pan_card", {
                    required: "PAN card is required",
                  })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                {errors.pan_card && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pan_card.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Police Verification Document
                </label>
                <input
                  type="file"
                  {...register("police_verification_doc")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Medical Fitness Certificate
                </label>
                <input
                  type="file"
                  {...register("medical_fitness_certificate")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Address Proof Document
                </label>
                <input
                  type="file"
                  {...register("address_proof_doc")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Training Certificate
                </label>
                <input
                  type="file"
                  {...register("training_certificate_doc")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>
          </section>

          {/* --- Section 9: Status & Remarks --- */}
          <section>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <SaveButton label={isSubmitting ? "Saving..." : "save"} />
        </form>
      </div>
    </div>
  );
};

export default DriverCreatePage;
