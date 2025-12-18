// src/components/vehicles/VehicleEditPage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
  FaCheckCircle,
} from "react-icons/fa";
import { MdGpsFixed } from "react-icons/md";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import InputField from "../../Components/Form/InputField";
import SelectInputField from "../../Components/Form/SelectInputField";
import FileInputField from "../../Components/Form/FileInputField";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";

// Services & Context
import tenantApi, { centralUrl } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";

// Types
import type { Vehicle } from "./Vehicle.types";
import type { FormDropdown, GpsDevice } from "../../Types/Index";

const VehicleEditPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Vehicle>();

  // State for dropdown data
  const [vehicleTypes, setVehicleTypes] = useState<FormDropdown[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FormDropdown[]>([]);
  const [permitTypes, setPermitTypes] = useState<FormDropdown[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<FormDropdown[]>([]);
  const [statuses, setStatuses] = useState<FormDropdown[]>([]);
  const [gps, setGps] = useState<GpsDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingVehicle, setFetchingVehicle] = useState(true);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

  // Watch ownership type for conditional vendor fields
  const ownershipType = useWatch({ control, name: "ownership_type" });

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch existing vehicle data
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setFetchingVehicle(true);
        const response = await tenantApi.get<{ success: boolean; data: Vehicle }>(
          `/vehicles/${id}`
        );

        if (response.data.success) {
          const vehicle = response.data.data;
          setVehicleData(vehicle);

          const formData: any = {
            ...vehicle,
            rc_isued_date: formatDateForInput(vehicle.rc_isued_date),
            rc_expiry_date: formatDateForInput(vehicle.rc_expiry_date),
            gps_installation_date: formatDateForInput(vehicle.gps_installation_date),
            permit_issue_date: formatDateForInput(vehicle.permit_issue_date),
            permit_expiry_date: formatDateForInput(vehicle.permit_expiry_date),
            insurance_issued_date: formatDateForInput(vehicle.insurance_issued_date),
            insurance_expiry_date: formatDateForInput(vehicle.insurance_expiry_date),
            fitness_issued_date: formatDateForInput(vehicle.fitness_issued_date),
            fitness_expiry_date: formatDateForInput(vehicle.fitness_expiry_date),
            pollution_issued_date: formatDateForInput(vehicle.pollution_issued_date),
            pollution_expiry_date: formatDateForInput(vehicle.pollution_expiry_date),
            last_service_date: formatDateForInput(vehicle.last_service_date),
            next_service_due_date: formatDateForInput(vehicle.next_service_due_date),
            tyre_replacement_due_date: formatDateForInput(vehicle.tyre_replacement_due_date),
            battery_replacement_due_date: formatDateForInput(vehicle.battery_replacement_due_date),
            tax_renewable_date: formatDateForInput(vehicle.tax_renewable_date),
          };

          // Remove file fields so they don't overwrite with strings
          delete formData.insurance_doc;
          delete formData.rc_book_doc;
          delete formData.puc_doc;
          delete formData.fitness_certificate;
          delete formData.permit_copy;
          delete formData.gps_installation_proof;
          delete formData.vendor_pan;
          delete formData.vendor_adhaar;
          delete formData.vendor_bank_proof;
          delete formData.vendor_contract_proof;
          delete formData.vedor_company_registration_doc;
          delete formData.saftey_certificate;

          reset(formData);
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        showAlert("Failed to load vehicle data", "error");
        navigate("/vehicles");
      } finally {
        setFetchingVehicle(false);
      }
    };

    if (id) {
      fetchVehicleData();
    }
  }, [id, reset, showAlert, navigate]);

  // Fetch dropdown data
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
        setGps(gps.data || []);
      } catch (error) {
        console.error("Error fetching form data:", error);
        showAlert("Failed to load form data. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [showAlert]);

  const onSubmit: SubmitHandler<Vehicle> = async (data) => {
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
        const value = data[field as keyof Vehicle];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Tracking
      const trackingFields = ["gps_device", "gps_installation_date"];
      trackingFields.forEach((field) => {
        const value = data[field as keyof Vehicle];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Permit & Compliance
      const permitFields = [
        "permit_type", "permit_number", "permit_issue_date", "permit_expiry_date",
      ];
      permitFields.forEach((field) => {
        const value = data[field as keyof Vehicle];
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
        const value = data[field as keyof Vehicle];
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
        const value = data[field as keyof Vehicle];
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
        const value = data[field as keyof Vehicle];
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
        const value = data[field as keyof Vehicle];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Status & Remarks
      if (data.status) formData.append("status", data.status);
      if (data.remarks) formData.append("vehicle_remarks", data.remarks);

      // File uploads
      const fileFields: Array<keyof Vehicle> = [
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

      formData.append("_method", "PUT");

      const response = await tenantApi.post<{ success: boolean; data: Vehicle; message: string; }>(
        `/vehicles/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        showAlert(`Vehicle ${data.vehicle_number} updated successfully!`, "success");
        navigate("/vehicles");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to update vehicle";
        showAlert(`Error: ${errorMessage}`, "error");
      } else {
        showAlert("An unexpected error occurred", "error");
      }
    }
  };

  if (loading || fetchingVehicle) return <LoadingSpinner fullScreen />;

  // Helper component for file existing status
  const FileStatus = ({ hasFile }: { hasFile?: boolean | string }) => (
    hasFile ? (
      <p className="text-[10px] uppercase font-bold text-green-600 mt-2 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded border border-green-200">
        <FaCheckCircle size={10} /> Current file exists
      </p>
    ) : null
  );

  return (
    <div className="min-h-screen bg-white pb-12">
     
        <PageHeaderBack title="Back" buttonLink="/vehicles" />
    

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaTruck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Edit Vehicle Details
                </h2>
              </div>
            </div>

            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

              {/* 1. Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaTruck className="text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <InputField label="Odometer (KM)" name="kilometers_driven" type="number" register={register} errors={errors} />
                    <InputField label="Assign Route" name="route" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* 2. Device Assignment */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MdGpsFixed className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Device Assignment</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                      {vehicleData?.gps_device && (
                        <div className="mb-2 text-xs font-semibold text-purple-900 bg-purple-100 px-3 py-1 rounded inline-block">
                          Currently Assigned: {vehicleData.gps_device}
                        </div>
                      )}
                      <SelectInputField label="Change GPS Device" name="gps_device" register={register} errors={errors} options={gps.map(d => ({ label: `${d.device_id} (${d.imei_number})`, value: d.imei_number }))} />
                    </div>
                    <InputField label="Installation Date" name="gps_installation_date" type="date" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* 3. Ownership */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaUserTie className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ownership Details</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <SelectInputField label="Ownership Type" name="ownership_type" register={register} errors={errors} options={ownershipTypes.map(d => ({ label: d.value, value: d.value }))} />
                  </div>

                  {(ownershipType === "Contract" || ownershipType === "contract") && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                        <FaCircle size={8} /> Vendor Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* 4. Permits & Compliance */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaClipboardCheck className="text-blue-400" />
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">                    
                      <InputField label="Fitness Cert No." name="fitness_certificate_number" register={register} errors={errors} />
                      <InputField label="Fit. Issued" name="fitness_issued_date" type="date" register={register} errors={errors} />
                      <InputField label="Fit. Expiry" name="fitness_expiry_date" type="date" register={register} errors={errors} />                 
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <InputField label="PUC Number" name="pollution_certificate_number" register={register} errors={errors} />
                    <InputField label="PUC Issued" name="pollution_issued_date" type="date" register={register} errors={errors} />
                    <InputField label="PUC Expiry" name="pollution_expiry_date" type="date" register={register} errors={errors} />
                    <InputField label="Tax Renewal Date" name="tax_renewable_date" type="date" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* 5. Service & Maintenance */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaCog className="text-yellow-400" />
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

              {/* 6. Safety Features */}
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

              {/* 7. Documents */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaFileAlt className="text-green-600" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Documents</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-4 italic">Leave fields empty to keep existing documents.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <FileInputField label="Insurance Document" name="insurance_doc" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.insurance_doc} />
                    </div>
                    <div>
                      <FileInputField label="RC Book" name="rc_book_doc" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.rc_book_doc} />
                    </div>
                    <div>
                      <FileInputField label="PUC Document" name="puc_doc" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.puc_doc} />
                    </div>
                    <div>
                      <FileInputField label="Fitness Certificate" name="fitness_certificate" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.fitness_certificate} />
                    </div>
                    <div>
                      <FileInputField label="Permit Copy" name="permit_copy" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.permit_copy} />
                    </div>
                    <div>
                      <FileInputField label="Safety Certificate" name="saftey_certificate" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.saftey_certificate} />
                    </div>
                    <div>
                      <FileInputField label="GPS Install Proof" name="gps_installation_proof" register={register} errors={errors} />
                      <FileStatus hasFile={vehicleData?.gps_installation_proof} />
                    </div>
                  </div>

                  {(ownershipType === "Contract" || ownershipType === "contract") && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                        <FaCircle size={8} /> Vendor Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <FileInputField label="Vendor PAN" name="vendor_pan" register={register} errors={errors} />
                          <FileStatus hasFile={vehicleData?.vendor_pan} />
                        </div>
                        <div>
                          <FileInputField label="Vendor Aadhaar" name="vendor_adhaar" register={register} errors={errors} />
                          <FileStatus hasFile={vehicleData?.vendor_adhaar} />
                        </div>
                        <div>
                          <FileInputField label="Bank Proof" name="vendor_bank_proof" register={register} errors={errors} />
                          <FileStatus hasFile={vehicleData?.vendor_bank_proof} />
                        </div>
                        <div>
                          <FileInputField label="Contract Agreement" name="vendor_contract_proof" register={register} errors={errors} />
                          <FileStatus hasFile={vehicleData?.vendor_contract_proof} />
                        </div>
                        <div>
                          <FileInputField label="Company Reg. Doc" name="vedor_company_registration_doc" register={register} errors={errors} />
                          <FileStatus hasFile={vehicleData?.vedor_company_registration_doc} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 8. Remarks & Status */}
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
             
              <SaveButton label="save" isSaving={isSubmitting} onClick={handleSubmit(onSubmit)} />
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEditPage;