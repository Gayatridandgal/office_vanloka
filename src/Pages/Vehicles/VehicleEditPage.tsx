import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import SaveButton from "../../Components/Form/SaveButton";
import tenantApi from "../../Services/ApiService";
import InputField from "../../Components/Form/InputField";
import type { Vehicle } from "./Vehicle.types";

type FormInputs = Vehicle & {
  // File fields for react-hook-form
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

const VehicleEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await tenantApi.get<{
          success: boolean;
          data: Vehicle;
        }>(`/vehicles/${id}`);

        if (response.data.success) {
          const vehicle = response.data.data;

          // Prepare data for form - exclude file fields and format dates
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
        console.error("Error fetching vehicle:", error);
        alert("Failed to fetch vehicle data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
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
        "permit_type",
        "permit_number",
        "permit_issue_date",
        "permit_expiry_date",
      ];
      permitFields.forEach((field) => {
        const value = data[field as keyof FormInputs];
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
        const value = data[field as keyof FormInputs];
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
        const value = data[field as keyof FormInputs];
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
        const value = data[field as keyof FormInputs];
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
        const value = data[field as keyof FormInputs];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(field, String(value));
        }
      });

      // Status & Remarks
      if (data.status) formData.append("status", data.status);
      if (data.remarks) formData.append("remarks", data.remarks);

      // File uploads (only if new files are selected)
      const fileFields: Array<keyof FormInputs> = [
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
        alert(`Vehicle ${data.vehicle_number} updated successfully!`);
        navigate("/vehicles");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update vehicle";
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

  // Watch ownership type for conditional vendor fields
  const ownershipType = watch("ownership_type");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 uppercase text-sm">
            Loading Vehicle Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Edit Vehicle" buttonLink="/vehicles" />
      <div className="p-10 mx-auto max-w-7xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Basic Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StarInputField
                label="Vehicle Number"
                name="vehicle_number"
                register={register}
                errors={errors}
                required="Vehicle number is required."
              />

              <div>
                <RequiredLabel label="Vehicle Type" />
                <select
                  {...register("vehicle_type", {
                    required: "Vehicle type is required.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="bus">Bus</option>
                  <option value="van">Van</option>
                  <option value="car">Car</option>
                  <option value="suv">SUV</option>
                  <option value="mini_bus">Mini Bus</option>
                  <option value="tempo">Tempo</option>
                </select>
                {errors.vehicle_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vehicle_type.message}
                  </p>
                )}
              </div>

              <StarInputField
                label="RC Number"
                name="rc_number"
                register={register}
                errors={errors}
                required="RC number is required."
              />

              <StarInputField
                label="RC Issued Date"
                name="rc_isued_date"
                register={register}
                errors={errors}
                required="RC issued date is required."
                type="date"
              />

              <StarInputField
                label="RC Expiry Date"
                name="rc_expiry_date"
                register={register}
                errors={errors}
                required="RC expiry date is required."
                type="date"
              />

              <StarInputField
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
                register={register}
                errors={errors}
                type="number"
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Fuel Type
                </label>
                <select
                  {...register("fuel_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <InputField
                label="Seating Capacity"
                name="seating_capacity"
                register={register}
                errors={errors}
                type="number"
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
                register={register}
                errors={errors}
                type="number"
              />

              <InputField
                label="Driver"
                name="driver"
                register={register}
                errors={errors}
              />

              <InputField
                label="Route"
                name="route"
                register={register}
                errors={errors}
              />
            </div>
          </section>

          {/* --- Section 2: GPS Tracking --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Device Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="GPS Device ID"
                name="gps_device"
                register={register}
                errors={errors}
              />

              <InputField
                label="GPS Installation Date"
                name="gps_installation_date"
                register={register}
                errors={errors}
                type="date"
              />
            </div>
          </section>

          {/* --- Section 4: Ownership --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Ownership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Ownership Type
                </label>
                <select
                  {...register("ownership_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option>Select</option>
                  <option value="owned">Owned</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Conditional Vendor Fields */}
            {ownershipType === "contract" && (
              <>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </section>

          {/* --- Section 5: Insurance & Fitness --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Permit Type
                </label>
                <select
                  {...register("permit_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="all_india">All India</option>
                  <option value="state">State</option>
                  <option value="regional">Regional</option>
                  <option value="tourist">Tourist</option>
                </select>
              </div>

              <InputField
                label="Permit Number"
                name="permit_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Permit Issue Date"
                name="permit_issue_date"
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="Permit Expiry Date"
                name="permit_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />

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
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="Insurance Expiry Date"
                name="insurance_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />
              <InputField
                label="Fitness Certificate Number"
                name="fitness_certificate_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Fitness Issued Date"
                name="fitness_issued_date"
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="Fitness Expiry Date"
                name="fitness_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />
              <InputField
                label="PUC Number"
                name="pollution_certificate_number"
                register={register}
                errors={errors}
              />

              <InputField
                label="PUC Issued Date"
                name="pollution_issued_date"
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="PUC Expiry Date"
                name="pollution_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />
              <InputField
                label="Tax Pay Renewal Date"
                name="tax_renewable_date"
                register={register}
                errors={errors}
                type="date"
              />
            </div>
          </section>

          {/* --- Section 6: Service & Maintenance --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Service & Maintenance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Last Service Date"
                name="last_service_date"
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="Next Service Due Date"
                name="next_service_due_date"
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="Tyre Replacement Due Date"
                name="tyre_replacement_due_date"
                register={register}
                errors={errors}
                type="date"
              />

              <InputField
                label="Battery Replacement Due Date"
                name="battery_replacement_due_date"
                register={register}
                errors={errors}
                type="date"
              />
            </div>
          </section>

          {/* --- Section 7: Safety Features --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Safety Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Fire Extinguisher
                </label>
                <select
                  {...register("fire_extinguisher")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  First Aid Kit
                </label>
                <select
                  {...register("first_aid_kit")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  CCTV Installed
                </label>
                <select
                  {...register("cctv_installed")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Panic Button Installed
                </label>
                <select
                  {...register("panic_button_installed")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="">Select</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </div>
          </section>

          {/* --- Section 8: Documents --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Insurance Document
                </label>
                <input
                  type="file"
                  {...register("insurance_doc")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  RC Book
                </label>
                <input
                  type="file"
                  {...register("rc_book_doc")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  PUC Document
                </label>
                <input
                  type="file"
                  {...register("puc_doc")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Fitness Certificate
                </label>
                <input
                  type="file"
                  {...register("fitness_certificate")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Permit Copy
                </label>
                <input
                  type="file"
                  {...register("permit_copy")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Safety Certificate
                </label>
                <input
                  type="file"
                  {...register("saftey_certificate")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  GPS Installation Proof
                </label>
                <input
                  type="file"
                  {...register("gps_installation_proof")}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1 uppercase">
                  Leave blank to keep current document
                </p>
              </div>
            </div>

            {/* Conditional Vendor Documents */}
            {ownershipType === "contract" && (
              <>
                <h3 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mt-6 mb-4">
                  Vendor Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                      PAN Card
                    </label>
                    <input
                      type="file"
                      {...register("vendor_pan")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 mt-1 uppercase">
                      Leave blank to keep current document
                    </p>
                  </div>

                  <div>
                    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                      Aadhaar Card
                    </label>
                    <input
                      type="file"
                      {...register("vendor_adhaar")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 mt-1 uppercase">
                      Leave blank to keep current document
                    </p>
                  </div>

                  <div>
                    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                      Bank Proof
                    </label>
                    <input
                      type="file"
                      {...register("vendor_bank_proof")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 mt-1 uppercase">
                      Leave blank to keep current document
                    </p>
                  </div>

                  <div>
                    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                      Contract Agreement
                    </label>
                    <input
                      type="file"
                      {...register("vendor_contract_proof")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 mt-1 uppercase">
                      Leave blank to keep current document
                    </p>
                  </div>

                  <div>
                    <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                      Company Registration
                    </label>
                    <input
                      type="file"
                      {...register("vedor_company_registration_doc")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-500 mt-1 uppercase">
                      Leave blank to keep current document
                    </p>
                  </div>
                </div>
              </>
            )}
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
                  className="w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under_maintenance">Under Maintenance</option>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400 uppercase"
                />
              </div>
            </div>
          </section>

          {/* --- Form Submission Button --- */}
          <div className="flex gap-4">
            <SaveButton label={isSubmitting ? "Updating..." : "save"} />
            <button
              type="button"
              onClick={() => navigate("/vehicles")}
              className="px-2 py-1 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors uppercase"
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
