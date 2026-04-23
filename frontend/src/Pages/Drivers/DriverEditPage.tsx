// src/components/drivers/DriverEditPage.tsx
import { useState, useEffect } from "react";
import { useFieldArray, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Icons
import {
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFileAlt,
  FaIdCard,
  FaCreditCard,
  FaExclamationTriangle,
  FaStickyNote,
  FaTrash,
  FaPlus,
  FaUserCircle
} from "react-icons/fa";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import InputField from "../../Components/Form/InputField";
import FileInputField from "../../Components/Form/FileInputField";
import SaveButton from "../../Components/Form/SaveButton";
import CancelButton from "../../Components/Form/CancelButton";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";

// Services & Context
import tenantApi, { centralUrl, tenantAsset } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";

// Types
import type { Driver } from "./Driver.types";
import type { BeaconDevice, FormDropdown, StateDistrict } from "../../Types/Index";
import type { Vehicle } from "../Vehicles/Vehicle.types";
import SelectInputField from "../../Components/Form/SelectInputField";

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
  const { id } = useParams<{ id: string }>();
  const { showAlert } = useAlert();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "license_insurance",
  });

  // Data State
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [dropdowns, setDropdowns] = useState({
    genders: [] as FormDropdown[],
    bloodGroups: [] as FormDropdown[],
    maritalStatuses: [] as FormDropdown[],
    employmentTypes: [] as FormDropdown[],
    fileTypes: [] as FormDropdown[],
    statuses: [] as FormDropdown[],
    states: [] as StateDistrict[],
    vehicles: [] as Vehicle[],
    beacons: [] as BeaconDevice[],
  });
  const [districts, setDistricts] = useState<StateDistrict[]>([]);

  // Watchers
  const selectedState = useWatch({ control, name: "state" });
  const hasSafetyTraining = watch("safety_training_completion");
  const hasMedicalFitness = watch("medical_fitness");
  const hasPoliceVerification = watch("police_verification");

  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);


  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [
          driverRes, genders, bloodGroups, maritalStatuses, employmentTypes, statuses, fileTypes, states, vehicles, beacons
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

        const driver = driverRes.data.data || driverRes.data;
        console.log(driver);
        setDriverData(driver);
        setCurrentPhoto(driver.profile_photo);
        reset(driver);

        if (driver.license_insurance && Array.isArray(driver.license_insurance)) {
          replace(driver.license_insurance);
        }

        setDropdowns({
          genders: genders.data || [],
          bloodGroups: bloodGroups.data || [],
          maritalStatuses: maritalStatuses.data || [],
          employmentTypes: employmentTypes.data || [],
          statuses: statuses.data || [],
          fileTypes: fileTypes.data || [],
          states: states.data || [],
          vehicles: vehicles.data || [],
          beacons: beacons.data || [],
        });

        // Pre-fetch districts if state exists
        if (driver.state) {
          const districtRes = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${driver.state}`);
          setDistricts(districtRes.data || []);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert("Failed to load driver data.", "error");
        navigate("/drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, showAlert, navigate, reset, replace]);

  // 2. Fetch Districts on State Change
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        return;
      }
      // Avoid re-fetching on initial load if data already exists
      if (driverData && selectedState === driverData.state && districts.length > 0) return;

      try {
        const response = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${selectedState}`);
        setDistricts(response.data || []);
        // Reset district selection if state changed by user
        if (driverData && selectedState !== driverData.state) setValue("district", "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistricts();
  }, [selectedState]); // Removed driverData from deps to prevent loop

  // 3. Submit Handler
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT"); // Laravel method spoofing

      // Append simple fields
      Object.keys(data).forEach((key) => {
        const k = key as keyof FormInputs;
        const value = data[k];

        if (value instanceof FileList) return;
        if (Array.isArray(value) && k === 'license_insurance') return;

        if (value !== undefined && value !== null && value !== "") {
          formData.append(k, String(value));
        }
      });

      // Append Complex Fields
      if (data.license_insurance?.length) {
        formData.append("license_insurance", JSON.stringify(data.license_insurance));
      }

      // Append Files
      const fileFields = [
        "profile_photo", "driving_license", "aadhaar_card", "pan_card",
        "police_verification_doc", "medical_fitness_certificate",
        "address_proof_doc", "training_certificate_doc"
      ] as const;

      fileFields.forEach((field) => {
        const files = data[field] as FileList | undefined;
        if (files && files.length > 0) {
          formData.append(field, files[0]);
        }
      });

      const response = await tenantApi.post(`/drivers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        showAlert("Driver updated successfully!", "success");
        navigate("/drivers");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update driver";
      showAlert(msg, "error");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-white-50 pb-12">
      
        <PageHeaderBack title="Edit Driver" buttonLink="/drivers" />
    

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden">

            {/* Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaUser size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Edit Driver Details
                </h2>

              </div>
            </div>

            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

              <div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">

                  {/* Current Photo Preview */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
                    <div className="relative">
                      {currentPhoto ? (
                        <img
                          src={`${tenantAsset}${currentPhoto}`}
                          alt="Current Profile"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-md text-blue-400">
                          <FaUserCircle size={48} />
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase">Current Photo</h4>
                      <p className="text-xs uppercase text-slate-500 mt-1">
                        This is the image currently displayed on driver profile.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileInputField
                      label="Photo"
                      name="profile_photo"
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>

              {/* 1. Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaUser className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <InputField label="First Name" name="first_name" register={register} errors={errors} required />
                  <InputField label="Last Name" name="last_name" register={register} errors={errors} required />
                  <InputField label="Email" name="email" type="email" register={register} errors={errors} />
                  <InputField label="Mobile Number" name="mobile_number" register={register} errors={errors} required />
                  <InputField label="Date of Birth" name="date_of_birth" type="date" register={register} errors={errors} required />

                  <SelectInputField
                    label="Gender"
                    name="gender"
                    register={register}
                    errors={errors}
                    options={dropdowns.genders.map(d => ({ label: d.value, value: d.value }))}
                    required
                  />
                  <SelectInputField
                    label="Blood Group"
                    name="blood_group"
                    register={register}
                    errors={errors}
                    options={dropdowns.bloodGroups.map(d => ({ label: d.value, value: d.value }))}
                  />
                  <SelectInputField
                    label="Marital Status"
                    name="marital_status"
                    register={register}
                    errors={errors}
                    options={dropdowns.maritalStatuses.map(d => ({ label: d.value, value: d.value }))}
                  />

                  <InputField label="Number of Dependants" name="number_of_dependents" type="text" register={register} errors={errors} />

                </div>
              </div>

              {/* 2. Address Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaMapMarkerAlt className="text-red-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Address Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <InputField label="Address Line 1" name="address_line_1" register={register} errors={errors} />
                  <InputField label="Address Line 2" name="address_line_2" register={register} errors={errors} />
                  <InputField label="Landmark" name="landmark" register={register} errors={errors} />

                  <SelectInputField
                    label="State"
                    name="state"
                    register={register}
                    errors={errors}
                    options={dropdowns.states.map(s => ({ label: s.state, value: s.state }))}
                  />
                  <SelectInputField
                    label="District"
                    name="district"
                    register={register}
                    errors={errors}
                    options={districts.map(d => ({ label: d.district, value: d.district }))}
                    disabled={!selectedState}
                  />
                  <InputField label="City" name="city" register={register} errors={errors} />


                  <InputField label="PIN Code" name="pin_code" register={register} errors={errors} />
                </div>
              </div>

              {/* 3. Professional Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaBriefcase className="text-green-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Professional Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <SelectInputField
                    label="Employment Type"
                    name="employment_type"
                    register={register}
                    errors={errors}
                    options={dropdowns.employmentTypes.map(d => ({ label: d.value, value: d.value }))}
                  />
                  <InputField label="Employee ID" name="employee_id" register={register} errors={errors} />
                  <InputField label="Experience (Years)" name="driving_experience" type="number" register={register} errors={errors} />

                  {/* Conditional Fields */}
                  <SelectInputField
                    label="Safety Training?"
                    name="safety_training_completion"
                    register={register}
                    errors={errors}
                    options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]}
                  />
                  {hasSafetyTraining === "YES" && (
                    <InputField label="Training Date" name="safety_training_completion_date" type="date" register={register} errors={errors} />
                  )}

                  <SelectInputField
                    label="Medical Fitness?"
                    name="medical_fitness"
                    register={register}
                    errors={errors}
                    options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]}
                  />
                  {hasMedicalFitness === "YES" && (
                    <InputField label="Fitness Expiry Date" name="medical_fitness_exp_date" type="date" register={register} errors={errors} />
                  )}

                  <SelectInputField
                    label="Police Verification?"
                    name="police_verification"
                    register={register}
                    errors={errors}
                    options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]}
                  />
                  {hasPoliceVerification === "YES" && (
                    <InputField label="Verification Date" name="police_verification_date" type="date" register={register} errors={errors} />
                  )}
                </div>
              </div>

              {/* 4. Bank  */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaCreditCard className="text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bank Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <InputField label="Account Holder Name" name="account_holder_name" register={register} errors={errors} />
                  <InputField label="Bank Name" name="bank_name" register={register} errors={errors} />
                  <InputField label="Account No" name="account_number" register={register} errors={errors} />
                  <InputField label="IFSC Code" name="ifsc_code" register={register} errors={errors} />
                </div>
              </div>

              {/* 4. Emergency Contact Person */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaCreditCard className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Emergency Contact Person</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FaUser className="text-green-400" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Person</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
                    <InputField label="Name" name="primary_person_name" register={register} errors={errors} />
                    <InputField label="Primary Phone" name="primary_person_phone_1" register={register} errors={errors} />
                    <InputField label="Secondary Phone" name="primary_person_phone_2" register={register} errors={errors} />
                    <InputField label="Email" name="primary_person_email" register={register} errors={errors} />
                  </div>
                  <div className="flex items-center gap-2 mt-4 mb-4">
                    <FaUser className="text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Secondary Person</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
                    <InputField label="Name" name="secondary_person_name" register={register} errors={errors} />
                    <InputField label="primary Phone" name="secondary_person_phone_1" register={register} errors={errors} />
                    <InputField label="secondary Phone" name="secondary_person_phone_2" register={register} errors={errors} />
                    <InputField label="Email" name="secondary_person_email" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* 5. Licenses (Dynamic Array) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaIdCard className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Licenses & Insurance</h3>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-3 rounded-lg border border-slate-200">
                      <SelectInputField
                        label="Type"
                        name={`license_insurance.${index}.type`}
                        register={register}
                        errors={errors}
                        options={dropdowns.fileTypes.map(d => ({ label: d.value, value: d.value }))}
                      />
                      <InputField label="Doc Number" name={`license_insurance.${index}.number`} register={register} errors={errors} />
                      <InputField label="Issue Date" name={`license_insurance.${index}.issue_date`} type="date" register={register} errors={errors} />
                      <InputField label="Expiry Date" name={`license_insurance.${index}.exp_date`} type="date" register={register} errors={errors} />

                      <div>
                        <button type="button" onClick={() => remove(index)} className=" bg-red-50 text-red-600 p-3 rounded-lg hover:bg-red-100 transition-colors">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => append({ type: "", number: "", issue_date: "", exp_date: "" })}
                    className="text-xs font-bold uppercase flex items-center gap-1 bg-blue-700 p-1 rounded-md text-white "
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              </div>

              {/* 6. Assignments */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaExclamationTriangle className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Assignments</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <SelectInputField
                    label="Assign Vehicle"
                    name="vehicle"
                    register={register}
                    errors={errors}
                    options={dropdowns.vehicles.map(v => ({ label: `${v.vehicle_number} (${v.vehicle_type})`, value: v.vehicle_number }))}
                  />

                  <div>
                    <SelectInputField
                      label="Assign Beacon"
                      name="beacon_id"
                      register={register}
                      errors={errors}
                      options={dropdowns.beacons.map(b => ({ label: `${b.device_id} (${b.imei_number})`, value: b.imei_number }))}
                    />
                    {driverData?.beacon_id && <p className="text-xs font-semibold uppercase text-amber-600 mt-1">Assigned Beacon {driverData.beacon_id}</p>}
                  </div>
                </div>
              </div>

              {/* 7. Documents */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaFileAlt className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Upload Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div>
                    <FileInputField label="Driving License" name="driving_license" register={register} errors={errors} />
                    {driverData?.driving_license && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
                  </div>
                  <div>
                    <FileInputField label="Aadhaar Card" name="aadhaar_card" register={register} errors={errors} />
                    {driverData?.aadhaar_card && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
                  </div>
                  <div>
                    <FileInputField label="PAN Card" name="pan_card" register={register} errors={errors} />
                    {driverData?.pan_card && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
                  </div>
                  <div>
                    <FileInputField label="Police Verification" name="police_verification_doc" register={register} errors={errors} />
                    {driverData?.police_verification_doc && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
                  </div>
                </div>
              </div>

              {/* 8. Remarks & Status */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaStickyNote className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Remarks</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="mb-4">
                    <SelectInputField
                      label="Status"
                      name="status"
                      register={register}
                      errors={errors}
                      options={dropdowns.statuses.map(d => ({ label: d.value, value: d.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-950 mb-2 uppercase">Additional Notes</label>
                    <textarea
                      {...register("remarks")}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={1}
                      placeholder="Enter any remarks..."
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-3 border-t border-slate-200 flex flex-wrap items-center gap-4">
              <CancelButton label="cancel" type="button" onClick={() => navigate("/drivers")} />
              <SaveButton label="save" isSaving={isSubmitting} onClick={handleSubmit(onSubmit)} />
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEditPage;