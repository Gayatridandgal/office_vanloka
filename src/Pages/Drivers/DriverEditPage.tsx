import { useState, useEffect } from "react";
import { useFieldArray, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFileAlt,
  FaIdCard,
  FaCreditCard,
  FaExclamationTriangle,
  FaStickyNote,
  FaUserShield,
} from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";

import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import FileInputField from "../../Components/Form/FileInputField";
import tenantApi, { centralUrl } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Driver } from "./Driver.types";
import type { BeaconDevice, FormDropdown, StateDistrict } from "../../Types/Index";
import { SectionHeader } from "../../Components/UI/SectionHeader";
import InputField from "../../Components/Form/InputField";
import SelectInputField from "../../Components/Form/SelectInputField";
import type { Vehicle } from "../Vehicles/Vehicle.types";
import { Loader } from "../../Components/UI/Loader";

type FormInputs = Driver & {
  profile_photo?: FileList;
  driving_license?: FileList;
  aadhaar_card?: FileList;
  pan_card?: FileList;
  police_verification_doc?: FileList;
  medical_fitness_certificate?: FileList;
  address_proof_doc?: FileList;
  training_certificate_doc?: FileList;
};

const DriverEditPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    watch,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "license_insurance",
  });

  // State for dropdown data
  const [genders, setGenders] = useState<FormDropdown[]>([]);
  const [bloodGroups, setBloodGroups] = useState<FormDropdown[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<FormDropdown[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<FormDropdown[]>([]);
  const [filetypes, setFileTypes] = useState<FormDropdown[]>([]);
  const [statuses, setStatuses] = useState<FormDropdown[]>([]);
  const [states, setStates] = useState<StateDistrict[]>([]);
  const [districts, setDistricts] = useState<StateDistrict[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [beacons, setBeacons] = useState<BeaconDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState<Driver | null>(null);

  // Watch state for dependent district dropdown
  const selectedState = useWatch({ control, name: "state" });

  // Fetch driver data and dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) {
        showAlert("Invalid driver ID", "error");
        navigate("/drivers");
        return;
      }

      try {
        setLoading(true);
        const [
          driverResponse,
          gendersRes,
          bloodGroupsRes,
          maritalStatusesRes,
          employmentTypesRes,
          statusesRes,
          fileTypesRes,
          statesRes,
          vehiclesRes,
          beaconsRes,
        ] = await Promise.all([
          tenantApi.get(`/drivers/${id}`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=gender`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=blood_group`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=marital_status`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=employment_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=status`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=driver&field=file_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/states`),
          tenantApi.get(`/active-vehicles/for/dropdown`),
          tenantApi.get(`/beacon-device/for/dropdown`),
        ]);

        const driver = driverResponse.data.data || driverResponse.data;
        setDriverData(driver);

        // Set dropdown data
        setGenders(gendersRes.data || []);
        setBloodGroups(bloodGroupsRes.data || []);
        setMaritalStatuses(maritalStatusesRes.data || []);
        setEmploymentTypes(employmentTypesRes.data || []);
        setStatuses(statusesRes.data || []);
        setFileTypes(fileTypesRes.data || []);
        setStates(statesRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setBeacons(beaconsRes.data || []);

        // Populate form with driver data
        reset(driver);

        // Populate license_insurance array if exists
        if (driver.license_insurance && Array.isArray(driver.license_insurance)) {
          replace(driver.license_insurance);
        }

        // Fetch districts if driver has a state
        if (driver.state) {
          const districtsRes = await axios.get(
            `${centralUrl}/masters/forms/dropdowns/districts/${driver.state}`
          );
          setDistricts(districtsRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
        showAlert("Failed to load driver data. Please try again.", "error");
        navigate("/drivers");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, showAlert, navigate, reset, replace]);

  // Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        setValue("district", "");
        return;
      }

      // Don't refetch if state hasn't changed from initial load
      if (driverData && selectedState === driverData.state && districts.length > 0) {
        return;
      }

      try {
        const response = await axios.get(
          `${centralUrl}/masters/forms/dropdowns/districts/${selectedState}`
        );
        setDistricts(response.data || []);

        // Only clear district if state actually changed
        if (driverData && selectedState !== driverData.state) {
          setValue("district", "");
        }
      } catch (err) {
        showAlert("Failed to load districts", "error");
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [selectedState, setValue, showAlert, driverData, districts.length]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();

      // Add _method for Laravel to handle PUT request with files
      formData.append("_method", "PUT");

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

      // License/Insurance Array
      if (data.license_insurance && data.license_insurance.length > 0) {
        formData.append("license_insurance", JSON.stringify(data.license_insurance));
      }

      // Tracking & Assignment
      if (data.beacon) formData.append("beacon", data.beacon);
      if (data.vehicle) formData.append("vehicle", data.vehicle);

      // Status & Remarks
      if (data.status) formData.append("status", data.status);
      if (data.remarks) formData.append("remarks", data.remarks);

      // File uploads (only if new files are selected)
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

      // Use POST with _method=PUT for Laravel multipart/form-data handling
      const response = await tenantApi.post<{
        success: boolean;
        data: Driver;
        message: string;
      }>(`/drivers/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        showAlert(
          `Driver ${data.first_name} ${data.last_name} updated successfully!`,
          "success"
        );
        navigate("/drivers");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update driver";
        showAlert(`Error: ${errorMessage}`, "error");
        console.error("Validation errors:", error.response?.data?.errors);
      } else {
        showAlert("An unexpected error occurred", "error");
      }
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="px-4 bg-white">
      <PageHeaderBack title="Edit Driver" buttonLink="/drivers" />

      <div className="p-6 mx-auto max-w-7xl border border-gray-200 rounded-lg">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-2 mb-4 rounded-r-lg shadow-sm">
          <div className="flex gap-2">
            <FaCircleInfo className="text-purple-700" size={16} />
            <div>
              <p className="text-xs uppercase font-semibold text-purple-800">
                Update Driver Information
              </p>
              <p className="text-xs uppercase text-purple-800 mt-1">
                Modify driver details below. Files are optional - only upload if replacing existing documents.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Basic Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaUser size={20} />} title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                required
              />

              <SelectInputField
                label="Gender"
                name="gender"
                register={register}
                errors={errors}
                options={genders.map((data) => ({ label: data.value, value: data.value }))}
                disabled={loading}
                required
              />

              <InputField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                register={register}
                errors={errors}
                required
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                register={register}
                errors={errors}
              />

              <InputField
                label="Mobile Number"
                name="mobile_number"
                register={register}
                errors={errors}
                required="Mobile number is required."
              />

              <SelectInputField
                label="Blood Group"
                name="blood_group"
                register={register}
                errors={errors}
                options={bloodGroups.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
              />

              <SelectInputField
                label="Marital Status"
                name="marital_status"
                register={register}
                errors={errors}
                options={maritalStatuses.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
              />

              <InputField
                label="Number of Dependents"
                name="number_of_dependents"
                type="number"
                register={register}
                errors={errors}
              />

              <div>
                <FileInputField
                  label="Profile Photo (Optional)"
                  name="profile_photo"
                  register={register}
                  errors={errors}
                />
                {driverData?.profile_photo && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file uploaded
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact Persons */}
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
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  name="primary_person_name"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Email Address"
                  name="primary_person_email"
                  type="email"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Primary Phone Number"
                  name="primary_person_phone_1"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Secondary Phone Number"
                  name="primary_person_phone_2"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>

            {/* Secondary Contact */}
            <div>
              <h3 className="text-sm font-bold text-green-700 uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Secondary
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  name="secondary_person_name"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Email Address"
                  name="secondary_person_email"
                  type="email"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Primary Phone Number"
                  name="secondary_person_phone_1"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Secondary Phone Number"
                  name="secondary_person_phone_2"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaMapMarkerAlt size={20} />} title="Address Details" />
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

              <SelectInputField
                label="State"
                name="state"
                register={register}
                errors={errors}
                options={states.map((data) => ({ label: data.state, value: data.state }))}
                disabled={loading}
              />

              <SelectInputField
                label="District"
                name="district"
                register={register}
                errors={errors}
                options={districts.map((data) => ({
                  label: data.district,
                  value: data.district,
                }))}
                disabled={loading || districts.length === 0}
              />

              <InputField label="City" name="city" register={register} errors={errors} />

              <InputField
                label="PIN Code"
                name="pin_code"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaBriefcase size={20} />}
              title="Professional Information"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SelectInputField
                label="Employment Type"
                name="employment_type"
                register={register}
                errors={errors}
                options={employmentTypes.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
              />

              <InputField
                label="Employee ID"
                name="employee_id"
                register={register}
                errors={errors}
              />

              <InputField
                label="Driving Experience (Years)"
                name="driving_experience"
                type="number"
                register={register}
                errors={errors}
              />

              {/* Safety Training */}
              <SelectInputField
                label="Safety Training Completed"
                name="safety_training_completion"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />

              {watch("safety_training_completion") === "YES" && (
                <InputField
                  label="Training Completion Date"
                  name="safety_training_completion_date"
                  type="date"
                  register={register}
                  errors={errors}
                />
              )}

              {/* Medical Fitness */}
              <SelectInputField
                label="Medical Fitness Issued"
                name="medical_fitness"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />

              {watch("medical_fitness") === "YES" && (
                <InputField
                  label="Medical Fitness Expiry Date"
                  name="medical_fitness_exp_date"
                  type="date"
                  register={register}
                  errors={errors}
                />
              )}

              {/* Police Verification */}
              <SelectInputField
                label="Police Verification"
                name="police_verification"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />

              {watch("police_verification") === "YES" && (
                <InputField
                  label="Police Verification Date"
                  name="police_verification_date"
                  type="date"
                  register={register}
                  errors={errors}
                />
              )}
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaCreditCard size={20} />}
              title="Bank Account Details"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                label="IFSC Code"
                name="ifsc_code"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* License/Insurance Section */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaIdCard size={20} />}
              title="License / Insurance Information"
            />

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <SelectInputField
                    label="Type"
                    name={`license_insurance.${index}.type`}
                    register={register}
                    errors={errors}
                    options={filetypes.map((data) => ({ label: data.value, value: data.value }))}
                  />

                  <InputField
                    label="Document Number"
                    name={`license_insurance.${index}.number`}
                    register={register}
                    errors={errors}
                  />

                  <InputField
                    label="Issue Date"
                    name={`license_insurance.${index}.issue_date`}
                    type="date"
                    register={register}
                    errors={errors}
                  />

                  <InputField
                    label="Expiry Date"
                    name={`license_insurance.${index}.exp_date`}
                    type="date"
                    register={register}
                    errors={errors}
                  />

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="bg-red-400 w-20 text-sm uppercase text-white font-bold  rounded-lg hover:bg-red-600 transition-colors h-10 flex items-center justify-center"
                  >
                    remove
                  </button>
                </div>
              ))}

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
                className="bg-green-500 text-white uppercase text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tracking & Assignment */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaExclamationTriangle size={20} />}
              title="Tracking & Assignment"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm uppercase font-semibold text-purple-950">Currently Assigned : <span className="text-sm uppercase text-green-700 font-semibold">{driverData?.beacon}</span></span>

                <SelectInputField
                  label=""
                  name="beacon"
                  register={register}
                  errors={errors}
                  options={beacons.map((data) => ({
                    label: data.device_id,
                    value: data.imei_number,
                  }))}
                  disabled={loading}
                />
              </div>

              <SelectInputField
                label="Assign Vehicle"
                name="vehicle"
                register={register}
                errors={errors}
                options={vehicles.map((data) => ({
                  label: `${data.vehicle_number} (${data.vehicle_type})`,
                  value: data.vehicle_number,
                }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaFileAlt size={20} />} title="Documents (Optional)" />

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-start gap-2">
                <FaCircleInfo className="text-blue-700" size={16} />
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-800">
                    Update Documents
                  </p>
                  <p className="text-xs uppercase text-blue-700 mt-1">
                    Upload new files only if you need to replace existing documents. Accepted formats: PDF, JPG, PNG (Max 5MB per file).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <FileInputField
                  label="Driving License"
                  name="driving_license"
                  register={register}
                  errors={errors}
                />
                {driverData?.driving_license && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Aadhaar Card"
                  name="aadhaar_card"
                  register={register}
                  errors={errors}
                />
                {driverData?.aadhaar_card && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="PAN Card"
                  name="pan_card"
                  register={register}
                  errors={errors}
                />
                {driverData?.pan_card && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Police Verification Document"
                  name="police_verification_doc"
                  register={register}
                  errors={errors}
                />
                {driverData?.police_verification_doc && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Medical Fitness Certificate"
                  name="medical_fitness_certificate"
                  register={register}
                  errors={errors}
                />
                {driverData?.medical_fitness_certificate && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Address Proof Document"
                  name="address_proof_doc"
                  register={register}
                  errors={errors}
                />
                {driverData?.address_proof_doc && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Training Certificate"
                  name="training_certificate_doc"
                  register={register}
                  errors={errors}
                />
                {driverData?.training_certificate_doc && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> File uploaded
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status & Remarks */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaStickyNote size={20} />} title="Status & Remarks" />

            <div className="grid grid-cols-1 gap-6">
              <SelectInputField
                label="Status"
                name="status"
                register={register}
                errors={errors}
                options={statuses.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
                ClassName="w-1/2"
              />

              <div>
                <label className="block text-gray-700 uppercase text-sm font-bold mb-2">
                  Remarks / Notes
                </label>
                <textarea
                  {...register("remarks")}
                  placeholder="Enter any additional notes, special requirements, or remarks..."
                  rows={3}
                  className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <SaveButton label={isSubmitting ? "Updating..." : "SAVE"} />
        </form>
      </div>
    </div>
  );
};

export default DriverEditPage;
