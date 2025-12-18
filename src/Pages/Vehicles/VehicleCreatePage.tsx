// src/components/vehicles/VehicleCreatePage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons
import {
  FaTruck,
  FaShieldAlt,
  FaFileAlt,
  FaCog,
  FaClipboardCheck,
  FaUserTie,
  FaStickyNote,
  FaCircle,
} from "react-icons/fa";
import { MdGpsFixed } from "react-icons/md";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import InputField from "../../Components/Form/InputField";
import SelectInputField from "../../Components/Form/SelectInputField";
import FileInputField from "../../Components/Form/FileInputField";
import LoadingSpinner from "../../Components/UI/LoadingSpinner"; // Added for consistency

// Services & Context
import tenantApi, { centralUrl } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";

// Types
import type { Vehicle } from "./Vehicle.types";
import type { FormDropdown, BeaconDevice } from "../../Types/Index";

type FormInputs = Vehicle & {
  insurance_doc?: FileList;
  rc_book_doc?: FileList;
  puc_doc?: FileList;
  fitness_certificate?: FileList;
  permit_copy?: FileList;
  gps_installation_proof?: FileList;
  vendor_pan?: FileList;
  vendor_adhaar?: FileList;
  vendor_bank_proof?: FileList;
  vendor_contract_proof?: FileList;
  vedor_company_registration_doc?: FileList;
  saftey_certificate?: FileList;
};

const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const {
    register,
    control, // Added for useWatch
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      status: "active",
    },
  });

  // State for dropdown data
  const [vehicleTypes, setVehicleTypes] = useState<FormDropdown[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FormDropdown[]>([]);
  const [permitTypes, setPermitTypes] = useState<FormDropdown[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<FormDropdown[]>([]);
  const [statuses, setStatuses] = useState<FormDropdown[]>([]);
  const [gps, setBeacons] = useState<BeaconDevice[]>([]);
  const [loading, setLoading] = useState(true);

  // Watch ownership type for conditional vendor fields
  const ownershipType = useWatch({ control, name: "ownership_type" });

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [
          vehicleTypes,
          fuelTypes,
          permitTypes,
          ownershipTypes,
          statuses,
          gps,
        ] = await Promise.all([
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=vehicle_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=fuel_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=permit_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=ownership_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=status`),
          tenantApi.get(`/gps-device/for/dropdown`),
        ]);

        setVehicleTypes(vehicleTypes.data || []);
        setFuelTypes(fuelTypes.data || []);
        setPermitTypes(permitTypes.data || []);
        setOwnershipTypes(ownershipTypes.data || []);
        setStatuses(statuses.data || []);
        setBeacons(gps.data || []);
      } catch (error) {
        console.error("Error fetching form data:", error);
        showAlert("Failed to load form data. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [showAlert]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();

      // Basic Information
      const basicFields = [
        "vehicle_number", "vehicle_type", "rc_number", "rc_isued_date",
        "rc_expiry_date", "manufacturer", "vehicle_model", "manufacturing_year",
        "fuel_type", "seating_capacity", "vehicle_color", "kilometers_driven",
        "driver", "route", "tax_renewable_date",
      ];
      basicFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Tracking
      const trackingFields = ["gps_device", "gps_installation_date"];
      trackingFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Permit & Compliance
      const permitFields = [
        "permit_type", "permit_number", "permit_issue_date", "permit_expiry_date",
      ];
      permitFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Ownership
      const ownershipFields = [
        "ownership_type", "vendor_name", "vendor_aadhar_number",
        "vendor_pan_number", "vendor_contact_number", "vendor_organization_name",
      ];
      ownershipFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Insurance & Fitness
      const insuranceFields = [
        "insurance_provider_name", "insurance_policy_number", "insurance_issued_date",
        "insurance_expiry_date", "fitness_certificate_number", "fitness_issued_date",
        "fitness_expiry_date", "pollution_certificate_number", "pollution_issued_date",
        "pollution_expiry_date",
      ];
      insuranceFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Service & Maintenance
      const serviceFields = [
        "last_service_date", "next_service_due_date",
        "tyre_replacement_due_date", "battery_replacement_due_date",
      ];
      serviceFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Safety
      const safetyFields = [
        "fire_extinguisher", "first_aid_kit",
        "cctv_installed", "panic_button_installed",
      ];
      safetyFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Status & Remarks
      if (data.status) formData.append("status", data.status);
      if (data.remarks) formData.append("vehicle_remarks", data.remarks);

      // File uploads
      const fileFields: Array<keyof FormInputs> = [
        "insurance_doc", "rc_book_doc", "puc_doc", "fitness_certificate",
        "permit_copy", "gps_installation_proof", "vendor_pan", "vendor_adhaar",
        "vendor_bank_proof", "vendor_contract_proof", "vedor_company_registration_doc",
        "saftey_certificate",
      ];

      fileFields.forEach((field) => {
        const files = data[field] as FileList | undefined;
        if (files && files.length > 0) {
          formData.append(field, files[0]);
        }
      });

      const response = await tenantApi.post<{ success: boolean; data: Vehicle; message: string; }>(
        "/vehicles",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        showAlert(`Vehicle ${data.vehicle_number} created successfully!`, "success");
        navigate("/vehicles");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to create vehicle";
        showAlert(`Error: ${errorMessage}`, "error");
      } else {
        showAlert("An unexpected error occurred", "error");
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* 1. Sticky Header */}

      <PageHeaderBack title="Add Vehicle" buttonLink="/vehicles" />


      {/* 2. Main Container */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* 3. The Form Card */}
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">

            {/* Card Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaTruck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Add Vehicle Details
                </h2>
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

              {/* SECTION: Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaTruck className="text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Vehicle Number" name="vehicle_number" register={register} errors={errors} required="Required" />
                    <SelectInputField label="Vehicle Type" name="vehicle_type" register={register} errors={errors} options={vehicleTypes.map(d => ({ label: d.value, value: d.value }))} required />

                    <InputField label="RC Number" name="rc_number" register={register} errors={errors} required="Required" />
                    <InputField label="RC Issued Date" name="rc_isued_date" type="date" register={register} errors={errors} required="Required" />
                    <InputField label="RC Expiry Date" name="rc_expiry_date" type="date" register={register} errors={errors} required="Required" />

                    <InputField label="Manufacturer" name="manufacturer" register={register} errors={errors} required="Required" />
                    <InputField label="Vehicle Model" name="vehicle_model" register={register} errors={errors} />
                    <InputField label="Mfg Year" name="manufacturing_year" type="number" register={register} errors={errors} />

                    <SelectInputField label="Fuel Type" name="fuel_type" register={register} errors={errors} options={fuelTypes.map(d => ({ label: d.value, value: d.value }))} />
                    <InputField label="Seating Capacity" name="seating_capacity" type="number" register={register} errors={errors} />
                    <InputField label="Color" name="vehicle_color" register={register} errors={errors} />
                    <InputField label="Current Odometer (KM)" name="kilometers_driven" type="number" register={register} errors={errors} />
                    <InputField label="Assign Route" name="route" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* SECTION: Device Assignment */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MdGpsFixed className="text-red-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Device Assignment</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectInputField label="GPS Device" name="gps_device" register={register} errors={errors} options={gps.map(d => ({ label: `${d.device_id} (${d.imei_number})`, value: d.imei_number }))} />
                    <InputField label="Installation Date" name="gps_installation_date" type="date" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* SECTION: Ownership */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaUserTie className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ownership Details</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <SelectInputField label="Ownership Type" name="ownership_type" register={register} errors={errors} options={ownershipTypes.map(d => ({ label: d.value, value: d.value }))} />
                  </div>

                  {/* Conditional Vendor Fields */}
                  {(ownershipType === "Contract" || ownershipType === "contract") && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                        <FaCircle size={8} /> Vendor Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Vendor Name" name="vendor_name" register={register} errors={errors} />
                        <InputField label="Organization Name" name="vendor_organization_name" register={register} errors={errors} />
                        <InputField label="Aadhaar Number" name="vendor_aadhar_number" register={register} errors={errors} />
                        <InputField label="PAN Number" name="vendor_pan_number" register={register} errors={errors} />
                        <InputField label="Contact Number" name="vendor_contact_number" register={register} errors={errors} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: Permits & Compliance */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaClipboardCheck className="text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Permits & Compliance</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100 space-y-6">

                  {/* Permit */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SelectInputField label="Permit Type" name="permit_type" register={register} errors={errors} options={permitTypes.map(d => ({ label: d.value, value: d.value }))} />
                    <InputField label="Permit Number" name="permit_number" register={register} errors={errors} />
                    <InputField label="Issue Date" name="permit_issue_date" type="date" register={register} errors={errors} />
                    <InputField label="Expiry Date" name="permit_expiry_date" type="date" register={register} errors={errors} />
                  </div>


                  {/* Insurance */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Insurance Provider" name="insurance_provider_name" register={register} errors={errors} />
                    <InputField label="Policy Number" name="insurance_policy_number" register={register} errors={errors} />
                    <InputField label="Ins. Issue Date" name="insurance_issued_date" type="date" register={register} errors={errors} />
                    <InputField label="Ins. Expiry Date" name="insurance_expiry_date" type="date" register={register} errors={errors} />
                  </div>

                  {/* Fitness & PUC */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Fitness Cert No." name="fitness_certificate_number" register={register} errors={errors} />
                    <InputField label="Fit. Issued" name="fitness_issued_date" type="date" register={register} errors={errors} />
                    <InputField label="Fit. Expiry" name="fitness_expiry_date" type="date" register={register} errors={errors} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <InputField label="PUC Number" name="pollution_certificate_number" register={register} errors={errors} />
                    <InputField label="PUC Issued" name="pollution_issued_date" type="date" register={register} errors={errors} />
                    <InputField label="PUC Expiry" name="pollution_expiry_date" type="date" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* SECTION: Service & Maintenance */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaCog className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Service & Maintenance</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InputField label="Last Service Date" name="last_service_date" type="date" register={register} errors={errors} />
                    <InputField label="Next Service Due" name="next_service_due_date" type="date" register={register} errors={errors} />
                    <InputField label="Tyre Replacement Due" name="tyre_replacement_due_date" type="date" register={register} errors={errors} />
                    <InputField label="Battery Replacement Due" name="battery_replacement_due_date" type="date" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* SECTION: Safety Features */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaShieldAlt className="text-red-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Safety Features</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SelectInputField label="Fire Extinguisher" name="fire_extinguisher" register={register} errors={errors} options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]} />
                    <SelectInputField label="First Aid Kit" name="first_aid_kit" register={register} errors={errors} options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]} />
                    <SelectInputField label="CCTV Installed" name="cctv_installed" register={register} errors={errors} options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]} />
                    <SelectInputField label="Panic Button" name="panic_button_installed" register={register} errors={errors} options={[{ label: "YES", value: "YES" }, { label: "NO", value: "NO" }]} />
                  </div>
                </div>
              </div>

              {/* SECTION: Documents */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaFileAlt className="text-green-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Required Documents</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FileInputField label="Insurance Document" name="insurance_doc" register={register} errors={errors} required="Required" />
                    <FileInputField label="RC Book" name="rc_book_doc" register={register} errors={errors} required="Required" />
                    <FileInputField label="PUC Document" name="puc_doc" register={register} errors={errors} />
                    <FileInputField label="Fitness Certificate" name="fitness_certificate" register={register} errors={errors} />
                    <FileInputField label="Permit Copy" name="permit_copy" register={register} errors={errors} />
                    <FileInputField label="Safety Certificate" name="saftey_certificate" register={register} errors={errors} />
                    <FileInputField label="GPS Install Proof" name="gps_installation_proof" register={register} errors={errors} />
                  </div>

                  {(ownershipType === "Contract") && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                        <FaCircle size={8} /> Vendor Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FileInputField label="Vendor PAN" name="vendor_pan" register={register} errors={errors} />
                        <FileInputField label="Vendor Aadhaar" name="vendor_adhaar" register={register} errors={errors} />
                        <FileInputField label="Bank Proof" name="vendor_bank_proof" register={register} errors={errors} />
                        <FileInputField label="Contract Agreement" name="vendor_contract_proof" register={register} errors={errors} />
                        <FileInputField label="Company Reg. Doc" name="vedor_company_registration_doc" register={register} errors={errors} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: Remarks & Status */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaStickyNote className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status & Remarks</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <SelectInputField label="Status" name="status" register={register} errors={errors} options={statuses.map(d => ({ label: d.value, value: d.value }))} />
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

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-3 border-t border-slate-200 flex flex-col-reverse md:flex-row justify-start items-center gap-4">

              <SaveButton label="Save" isSaving={isSubmitting} onClick={handleSubmit(onSubmit)} />
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleCreatePage;