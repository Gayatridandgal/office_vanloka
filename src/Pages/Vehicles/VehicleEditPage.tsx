import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaTruck,
  FaShieldAlt,
  FaFileAlt,
  FaCog,
  FaClipboardCheck,
  FaUserTie,
  FaStickyNote,
} from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { MdGpsFixed } from "react-icons/md";

import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import InputField from "../../Components/Form/InputField";
import SelectInputField from "../../Components/Form/SelectInputField";
import FileInputField from "../../Components/Form/FileInputField";
import { SectionHeader } from "../../Components/UI/SectionHeader";
import tenantApi, { centralUrl } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Vehicle } from "./Vehicle.types";
import type { FormDropdown, GpsDevice } from "../../Types/Index";

const VehicleEditPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    watch,
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
  const ownershipType = watch("ownership_type");

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

        console.log(response);

        if (response.data.success) {
          const vehicle = response.data.data;
          setVehicleData(vehicle);

          const formData: any = {
            ...vehicle,
            // Format dates for input[type="date"]
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

          // Remove file path fields as they will be handled separately
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
        "vehicle_number",
        "vehicle_type",
        "rc_number",
        "rc_isued_date",
        "rc_expiry_date",
        "manufacturer",
        "vehicle_model",
        "manufacturing_year",
        "fuel_type",
        "seating_capacity",
        "vehicle_color",
        "kilometers_driven",
        "driver",
        "route",
        "tax_renewable_date",
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
        "permit_type",
        "permit_number",
        "permit_issue_date",
        "permit_expiry_date",
      ];
      permitFields.forEach((field) => {
        const value = data[field as keyof Vehicle];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Ownership
      const ownershipFields = [
        "ownership_type",
        "vendor_name",
        "vendor_aadhar_number",
        "vendor_pan_number",
        "vendor_contact_number",
        "vendor_organization_name",
      ];
      ownershipFields.forEach((field) => {
        const value = data[field as keyof Vehicle];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Insurance & Fitness
      const insuranceFields = [
        "insurance_provider_name",
        "insurance_policy_number",
        "insurance_issued_date",
        "insurance_expiry_date",
        "fitness_certificate_number",
        "fitness_issued_date",
        "fitness_expiry_date",
        "pollution_certificate_number",
        "pollution_issued_date",
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
        "last_service_date",
        "next_service_due_date",
        "tyre_replacement_due_date",
        "battery_replacement_due_date",
      ];
      serviceFields.forEach((field) => {
        const value = data[field as keyof Vehicle];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Safety
      const safetyFields = [
        "fire_extinguisher",
        "first_aid_kit",
        "cctv_installed",
        "panic_button_installed",
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

      // File uploads - only append if new files are selected
      const fileFields: Array<keyof Vehicle> = [
        "insurance_doc",
        "rc_book_doc",
        "puc_doc",
        "fitness_certificate",
        "permit_copy",
        "gps_installation_proof",
        "vendor_pan",
        "vendor_adhaar",
        "vendor_bank_proof",
        "vendor_contract_proof",
        "vedor_company_registration_doc",
        "saftey_certificate",
      ];

      fileFields.forEach((field) => {
        const files = data[field] as FileList | undefined;
        if (files && files.length > 0) {
          formData.append(field, files[0]);
        }
      });

      // Laravel requires _method for PUT via FormData
      formData.append("_method", "PUT");

      const response = await tenantApi.post<{
        success: boolean;
        data: Vehicle;
        message: string;
      }>(`/vehicles/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        showAlert(
          `Vehicle ${data.vehicle_number} updated successfully!`,
          "success"
        );
        navigate("/vehicles");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update vehicle";
        showAlert(`Error: ${errorMessage}`, "error");
        console.error("Validation errors:", error.response?.data?.errors);
      } else {
        showAlert("An unexpected error occurred", "error");
      }
    }
  };

  // Show loading state while fetching vehicle data
  if (fetchingVehicle) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Edit Vehicle" buttonLink="/vehicles" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading vehicle data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white">
      <PageHeaderBack title="Edit Vehicle" buttonLink="/vehicles" />

      <div className="p-6 mx-auto max-w-7xl border border-gray-200 rounded-lg">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-2 mb-4 rounded-r-lg shadow-sm">
          <div className="flex gap-2">
            <FaCircleInfo className="text-amber-700" size={16} />
            <div>
              <p className="text-xs uppercase font-semibold text-amber-800">
                Update Vehicle Information
              </p>
              <p className="text-xs uppercase text-amber-800 mt-1">
                Modify the fields you want to update. Leave file fields empty to keep existing documents.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 overflow-y-auto max-h-[75vh]"
        >
          {/* Basic Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaTruck size={20} />} title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Vehicle Number"
                name="vehicle_number"
                register={register}
                errors={errors}
                required="Vehicle number is required."
              />

              <SelectInputField
                label="Vehicle Type"
                name="vehicle_type"
                register={register}
                errors={errors}
                options={vehicleTypes.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
                required
              />

              <InputField
                label="RC Number"
                name="rc_number"
                register={register}
                errors={errors}
                required="RC number is required."
              />

              <InputField
                label="RC Issued Date"
                name="rc_isued_date"
                type="date"
                register={register}
                errors={errors}
                required="RC issued date is required."
              />

              <InputField
                label="RC Expiry Date"
                name="rc_expiry_date"
                type="date"
                register={register}
                errors={errors}
                required="RC expiry date is required."
              />

              <InputField
                label="Manufacturer"
                name="manufacturer"
                register={register}
                errors={errors}
                required="Manufacturer is required."
              />

              <InputField
                label="Vehicle Model"
                name="vehicle_model"
                register={register}
                errors={errors}
              />

              <InputField
                label="Manufacturing Year"
                name="manufacturing_year"
                type="number"
                register={register}
                errors={errors}
              />

              <SelectInputField
                label="Fuel Type"
                name="fuel_type"
                register={register}
                errors={errors}
                options={fuelTypes.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
              />

              <InputField
                label="Seating Capacity"
                name="seating_capacity"
                type="number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Vehicle Color"
                name="vehicle_color"
                register={register}
                errors={errors}
              />

              <InputField
                label="Kilometers Driven"
                name="kilometers_driven"
                type="number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Assign Route"
                name="route"
                type="text"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* GPS Tracking */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<MdGpsFixed size={20} />}
              title="Device Assignment"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <span className="text-sm uppercase font-semibold text-purple-950">Assigned GPS <span className="text-sm uppercase text-green-700 font-semibold">{vehicleData?.gps_device}</span></span>
                <SelectInputField
                label=""
                name="gps_device"
                register={register}
                errors={errors}
                options={gps.map((data) => ({
                  label: data.device_id,
                  value: data.imei_number,
                }))}
                disabled={loading}
              />
              </div>

              <InputField
                label="GPS Installation Date"
                name="gps_installation_date"
                type="date"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* Ownership */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaUserTie size={20} />} title="Ownership Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SelectInputField
                label="Ownership Type"
                name="ownership_type"
                register={register}
                errors={errors}
                options={ownershipTypes.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
              />
            </div>

            {/* Conditional Vendor Fields */}
            {ownershipType === "contract" && (
              <>
                <h3 className="text-sm font-bold text-indigo-700 uppercase mt-6 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="Vendor Name"
                    name="vendor_name"
                    register={register}
                    errors={errors}
                  />

                  <InputField
                    label="Vendor Aadhaar Number"
                    name="vendor_aadhar_number"
                    register={register}
                    errors={errors}
                  />

                  <InputField
                    label="Vendor PAN Number"
                    name="vendor_pan_number"
                    register={register}
                    errors={errors}
                  />

                  <InputField
                    label="Vendor Contact Number"
                    name="vendor_contact_number"
                    register={register}
                    errors={errors}
                  />

                  <InputField
                    label="Vendor Organization Name"
                    name="vendor_organization_name"
                    register={register}
                    errors={errors}
                  />
                </div>
              </>
            )}
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader
              icon={<FaClipboardCheck size={20} />}
              title="Permits & Compliance"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Permit Section */}
              <SelectInputField
                label="Permit Type"
                name="permit_type"
                register={register}
                errors={errors}
                options={permitTypes.map((data) => ({
                  label: data.value,
                  value: data.value,
                }))}
                disabled={loading}
              />

              <InputField
                label="Permit Number"
                name="permit_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Permit Issue Date"
                name="permit_issue_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Permit Expiry Date"
                name="permit_expiry_date"
                type="date"
                register={register}
                errors={errors}
              />

              {/* Insurance Section */}
              <InputField
                label="Insurance Provider Name"
                name="insurance_provider_name"
                register={register}
                errors={errors}
              />

              <InputField
                label="Insurance Policy Number"
                name="insurance_policy_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Insurance Issued Date"
                name="insurance_issued_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Insurance Expiry Date"
                name="insurance_expiry_date"
                type="date"
                register={register}
                errors={errors}
              />

              {/* Fitness Section */}
              <InputField
                label="Fitness Certificate Number"
                name="fitness_certificate_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Fitness Issued Date"
                name="fitness_issued_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Fitness Expiry Date"
                name="fitness_expiry_date"
                type="date"
                register={register}
                errors={errors}
              />

              {/* PUC Section */}
              <InputField
                label="PUC Number"
                name="pollution_certificate_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="PUC Issued Date"
                name="pollution_issued_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="PUC Expiry Date"
                name="pollution_expiry_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Tax Pay Renewal Date"
                name="tax_renewable_date"
                type="date"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* Service & Maintenance */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaCog size={20} />} title="Service & Maintenance" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Last Service Date"
                name="last_service_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Next Service Due Date"
                name="next_service_due_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Tyre Replacement Due Date"
                name="tyre_replacement_due_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputField
                label="Battery Replacement Due Date"
                name="battery_replacement_due_date"
                type="date"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaShieldAlt size={20} />} title="Safety Features" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SelectInputField
                label="Fire Extinguisher"
                name="fire_extinguisher"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />

              <SelectInputField
                label="First Aid Kit"
                name="first_aid_kit"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />

              <SelectInputField
                label="CCTV Installed"
                name="cctv_installed"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />

              <SelectInputField
                label="Panic Button Installed"
                name="panic_button_installed"
                register={register}
                errors={errors}
                options={[
                  { label: "YES", value: "YES" },
                  { label: "NO", value: "NO" },
                ]}
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <SectionHeader icon={<FaFileAlt size={20} />} title="Documents" />

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-start gap-2">
                <FaCircleInfo className="text-blue-700" size={16} />
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-800">
                    Document Update Guidelines
                  </p>
                  <p className="text-xs uppercase text-blue-700 mt-1">
                    Upload new files only if you want to replace existing documents. Leave empty to keep current files.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <FileInputField
                  label="Insurance Document"
                  name="insurance_doc"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.insurance_doc && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="RC Book"
                  name="rc_book_doc"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.rc_book_doc && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="PUC Document"
                  name="puc_doc"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.puc_doc && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Fitness Certificate"
                  name="fitness_certificate"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.fitness_certificate && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Permit Copy"
                  name="permit_copy"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.permit_copy && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="Safety Certificate"
                  name="saftey_certificate"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.saftey_certificate && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>

              <div>
                <FileInputField
                  label="GPS Installation Proof"
                  name="gps_installation_proof"
                  register={register}
                  errors={errors}
                />
                {vehicleData?.gps_installation_proof && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Current file exists
                  </p>
                )}
              </div>
            </div>

            {/* Conditional Vendor Documents */}
            {ownershipType === "contract" && (
              <>
                <h3 className="text-sm font-bold text-indigo-700 uppercase mt-6 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Vendor Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <FileInputField
                      label="Vendor PAN Card"
                      name="vendor_pan"
                      register={register}
                      errors={errors}
                    />
                    {vehicleData?.vendor_pan && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>✓</span> Current file exists
                      </p>
                    )}
                  </div>

                  <div>
                    <FileInputField
                      label="Vendor Aadhaar Card"
                      name="vendor_adhaar"
                      register={register}
                      errors={errors}
                    />
                    {vehicleData?.vendor_adhaar && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>✓</span> Current file exists
                      </p>
                    )}
                  </div>

                  <div>
                    <FileInputField
                      label="Vendor Bank Proof"
                      name="vendor_bank_proof"
                      register={register}
                      errors={errors}
                    />
                    {vehicleData?.vendor_bank_proof && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>✓</span> Current file exists
                      </p>
                    )}
                  </div>

                  <div>
                    <FileInputField
                      label="Contract Agreement"
                      name="vendor_contract_proof"
                      register={register}
                      errors={errors}
                    />
                    {vehicleData?.vendor_contract_proof && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>✓</span> Current file exists
                      </p>
                    )}
                  </div>

                  <div>
                    <FileInputField
                      label="Company Registration"
                      name="vedor_company_registration_doc"
                      register={register}
                      errors={errors}
                    />
                    {vehicleData?.vedor_company_registration_doc && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span>✓</span> Current file exists
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
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
                  className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <SaveButton label={isSubmitting ? "Updating..." : "save"} />
            <button
              type="button"
              onClick={() => navigate("/vehicles")}
              className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors uppercase text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEditPage;
