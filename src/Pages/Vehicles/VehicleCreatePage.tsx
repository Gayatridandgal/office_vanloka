import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import SaveButton from "../../Components/Form/SaveButton";
import type { Vehicle } from "../../Types/Index";
import tenantApi from "../../Services/ApiService";

type FormInputs = {
  // Basic Information
  vehicle_number: string;
  vehicle_type: string;
  manufacturer: string;
  vehicle_model?: string;
  manufacturing_year?: number;
  fuel_type?: string;
  seating_capacity?: number;
  vehicle_color?: string;

  // Tracking
  kilometers_driven?: number;
  gps_device_id?: string;
  sim_number?: string;
  beacon_count?: number;

  // Assignment
  assigned_driver_id?: string;
  assigned_route_id?: string;

  // Permit & Compliance
  permit_type?: string;
  permit_number?: string;
  permit_issue_date?: string;
  permit_expiry_date?: string;

  // Ownership
  ownership_type?: string;
  owner_name?: string;
  owner_contact_number?: string;
  vendor_name?: string;
  vendor_contact_number?: string;
  organization_name?: string;

  // Insurance & Fitness
  gps_installation_date?: string;
  insurance_provider_name?: string;
  insurance_policy_number?: string;
  insurance_expiry_date?: string;
  fitness_certificate_number?: string;
  fitness_expiry_date?: string;
  pollution_certificate_number?: string;
  pollution_expiry_date?: string;

  // Service & Maintenance
  last_service_date?: string;
  next_service_due_date?: string;
  tyre_replacement_due_date?: string;
  battery_replacement_due_date?: string;

  // Safety
  fire_extinguisher_status?: string;
  first_aid_kit_status?: string;
  cctv_installed?: boolean;
  panic_button_installed?: boolean;
  vehicle_remarks?: string;
};

const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      vehicle_type: "",
      fuel_type: "Petrol",
      ownership_type: "Owned",
      fire_extinguisher_status: "Installed",
      first_aid_kit_status: "Available",
      cctv_installed: false,
      panic_button_installed: false,
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const response = await tenantApi.post<{
        success: boolean;
        data: Vehicle;
      }>("/vehicles", data);

      if (response.data.success) {
        alert(`Vehicle ${data.vehicle_number} created successfully!`);
        navigate("/vehicles");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to create vehicle";
        alert(`Error: ${errorMessage}`);
        console.error("Validation errors:", error.response?.data?.errors);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add Vehicle" buttonLink="/vehicles" />
      <div className="p-10 mx-auto max-w-6xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Vehicle Basic Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Vehicle Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Vehicle Number"
                name="vehicle_number"
                register={register}
                errors={errors}
                required="Vehicle number is required."
                placeholder="e.g., MH01AB1234"
              />
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Vehicle Type<span className="text-red-600">*</span>
                </label>
                <select
                  {...register("vehicle_type", {
                    required: "Vehicle type is required.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  <option value="Bus">Bus</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Car">Car</option>
                  <option value="Auto">Auto</option>
                  <option value="Two-wheeler">Two-wheeler</option>
                  <option value="Other">Other</option>
                </select>
                {errors.vehicle_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vehicle_type.message}
                  </p>
                )}
              </div>

              <StarInputField
                label="Manufacturer (OEM)"
                name="manufacturer"
                register={register}
                errors={errors}
                required="Manufacturer is required."
                placeholder="e.g., Tata, Maruti, Mahindra"
              />
              <StarInputField
                label="Vehicle Model"
                name="vehicle_model"
                register={register}
                errors={errors}
                placeholder="e.g., Nexon, Ertiga"
              />

              <StarInputField
                label="Manufacturing Year"
                name="manufacturing_year"
                register={register}
                errors={errors}
                type="number"
                placeholder={new Date().getFullYear().toString()}
              />

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Fuel Type
                </label>
                <select
                  {...register("fuel_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <StarInputField
                label="Seating Capacity"
                name="seating_capacity"
                register={register}
                errors={errors}
                type="number"
                placeholder="e.g., 5, 8, 50"
              />

              <StarInputField
                label="Vehicle Color"
                name="vehicle_color"
                register={register}
                errors={errors}
                placeholder="e.g., White, Red, Blue"
              />
            </div>
          </section>

          {/* --- Section 2: Tracking & Assignment --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Tracking & Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Kilometers Driven"
                name="kilometers_driven"
                register={register}
                errors={errors}
                type="number"
                placeholder="e.g., 5000"
              />

              <StarInputField
                label="GPS Device ID"
                name="gps_device_id"
                register={register}
                errors={errors}
                placeholder="e.g., GPS001"
              />

              <StarInputField
                label="SIM Number"
                name="sim_number"
                register={register}
                errors={errors}
                placeholder="Enter SIM number"
              />

              <StarInputField
                label="Beacon Count"
                name="beacon_count"
                register={register}
                errors={errors}
                type="number"
                placeholder="e.g., 2"
              />

              <StarInputField
                label="Assigned Driver ID"
                name="assigned_driver_id"
                register={register}
                errors={errors}
                placeholder="Driver ID"
              />

              <StarInputField
                label="Assigned Route ID"
                name="assigned_route_id"
                register={register}
                errors={errors}
                placeholder="Route ID"
              />
            </div>
          </section>

          {/* --- Section 3: Permit & Compliance --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Permit & Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Permit Type
                </label>
                <select
                  {...register("permit_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Permit Type</option>
                  <option value="School">School</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Factory">Factory</option>
                  <option value="Tourist">Tourist</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <StarInputField
                label="Permit Number"
                name="permit_number"
                register={register}
                errors={errors}
                placeholder="RTO Permit Number"
              />

              <StarInputField
                label="Permit Issue Date"
                name="permit_issue_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
                label="Permit Expiry Date"
                name="permit_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />
            </div>
          </section>

          {/* --- Section 4: Ownership & Contact --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Ownership & Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Ownership Type
                </label>
                <select
                  {...register("ownership_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Owned">Owned</option>
                  <option value="Contract">Contract</option>
                  <option value="Leased">Leased</option>
                </select>
              </div>

              <StarInputField
                label="Owner Name"
                name="owner_name"
                register={register}
                errors={errors}
                placeholder="Full name"
              />

              <StarInputField
                label="Owner Contact Number"
                name="owner_contact_number"
                register={register}
                errors={errors}
                placeholder="10-digit number"
              />

              <StarInputField
                label="Vendor Name"
                name="vendor_name"
                register={register}
                errors={errors}
                placeholder="Vendor name"
              />

              <StarInputField
                label="Vendor Contact Number"
                name="vendor_contact_number"
                register={register}
                errors={errors}
                placeholder="10-digit number"
              />

              <StarInputField
                label="Organization / Fleet Name"
                name="organization_name"
                register={register}
                errors={errors}
                placeholder="Organization name"
              />
            </div>
          </section>

          {/* --- Section 5: Insurance & Fitness --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Insurance & Fitness Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="GPS Installation Date"
                name="gps_installation_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
                label="Insurance Provider Name"
                name="insurance_provider_name"
                register={register}
                errors={errors}
                placeholder="e.g., ICICI Lombard"
              />

              <StarInputField
                label="Insurance Policy Number"
                name="insurance_policy_number"
                register={register}
                errors={errors}
                placeholder="Policy number"
              />

              <StarInputField
                label="Insurance Expiry Date"
                name="insurance_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
                label="Fitness Certificate Number"
                name="fitness_certificate_number"
                register={register}
                errors={errors}
                placeholder="RTO Fitness No."
              />

              <StarInputField
                label="Fitness Expiry Date"
                name="fitness_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
                label="Pollution Certificate Number"
                name="pollution_certificate_number"
                register={register}
                errors={errors}
                placeholder="PUC number"
              />

              <StarInputField
                label="Pollution Expiry Date"
                name="pollution_expiry_date"
                register={register}
                errors={errors}
                type="date"
              />
            </div>
          </section>

          {/* --- Section 6: Service & Maintenance --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Service & Maintenance Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Last Service Date"
                name="last_service_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
                label="Next Service Due Date"
                name="next_service_due_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
                label="Tyre Replacement Due Date"
                name="tyre_replacement_due_date"
                register={register}
                errors={errors}
                type="date"
              />

              <StarInputField
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
              Safety Features & Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  Fire Extinguisher Status
                </label>
                <select
                  {...register("fire_extinguisher_status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Installed">Installed</option>
                  <option value="Expired">Expired</option>
                  <option value="Not Installed">Not Installed</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                  First Aid Kit Status
                </label>
                <select
                  {...register("first_aid_kit_status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Available">Available</option>
                  <option value="Missing">Missing</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cctv_installed"
                  {...register("cctv_installed")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="cctv_installed"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  CCTV Installed
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="panic_button_installed"
                  {...register("panic_button_installed")}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="panic_button_installed"
                  className="text-purple-950 uppercase text-sm font-bold"
                >
                  Panic Button Installed
                </label>
              </div>
            </div>
          </section>

          {/* --- Section 8: Remarks --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Additional Remarks
            </h2>
            <div>
              <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                Vehicle Remarks / Notes
              </label>
              <textarea
                {...register("vehicle_remarks")}
                placeholder="Enter any special instructions or conditions..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </section>

          {/* --- Form Submission Button --- */}
          <SaveButton label={isSubmitting ? "Saving..." : "Save Vehicle"} />
        </form>
      </div>
    </div>
  );
};

export default VehicleCreatePage;
