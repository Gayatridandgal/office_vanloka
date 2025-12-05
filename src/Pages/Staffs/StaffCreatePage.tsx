// src/components/staff/StaffCreatePage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Controller, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons
import {
  FaUserTie,
  FaIdCard,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCamera,
  FaCheck
} from "react-icons/fa";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import CancelButton from "../../Components/Form/CancelButton";
import InputField from "../../Components/Form/InputField";
import SelectInputField from "../../Components/Form/SelectInputField";
import FileInputField from "../../Components/Form/FileInputField";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";

// Services & Context
import { useAlert } from "../../Context/AlertContext";
import tenantApi, { centralUrl } from "../../Services/ApiService";
import type { Staff } from "./Staff.types";
import type { FormDropdown, StateDistrict } from "../../Types/Index";

interface Role {
  id: number;
  name: string;
}

const StaffCreatePage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  
  // Unified dropdown state (similar to DriverCreatePage)
  const [dropdowns, setDropdowns] = useState({
    genders: [] as FormDropdown[],
    statuses: [] as FormDropdown[],
    states: [] as StateDistrict[],
    roles: [] as Role[],
  });
  const [districts, setDistricts] = useState<StateDistrict[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Staff>({
    defaultValues: {
      status: "Active",
      roles: [],
      gender: "Male",
    },
  });

  // Watch state changes for district dropdown
  const selectedState = useWatch({ control, name: "state" });

  // 1. Initial Data Fetch (using Promise.all like DriverCreatePage)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [genders, statuses, states, roles] = await Promise.all([
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=gender`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=status`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/states`),
          tenantApi.get("/roles"),
        ]);

        setDropdowns({
          genders: genders.data || [],
          statuses: statuses.data || [],
          states: states.data || [],
          roles: roles.data.data || [],
        });
      } catch (error) {
        console.error("Error fetching form data:", error);
        showAlert("Failed to load form data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [showAlert]);

  // 2. Fetch Districts on State Change
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        setValue('district', ''); // Reset district
        return;
      }
      try {
        const response = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${selectedState}`);
        setDistricts(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistricts();
  }, [selectedState, setValue]);

  const onSubmit: SubmitHandler<Staff> = async (data) => {
    if (data.roles.length === 0) {
      showAlert("Please select at least one role.", "error");
      return;
    }

    try {
      const formData = new FormData();

      // Add text fields
      formData.append("employee_id", data.employee_id);
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("designation", data.designation);
      formData.append("gender", data.gender);
      formData.append("joining_date", data.joining_date);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      formData.append("address_line_1", data.address_line_1);
      formData.append("address_line_2", data.address_line_2);
      formData.append("landmark", data.landmark);
      formData.append("state", data.state);
      formData.append("district", data.district);
      formData.append("city", data.city);
      formData.append("pincode", data.pincode);

      formData.append("status", data.status);

      // Add roles array
      data.roles.forEach((role) => {
        formData.append("roles[]", role);
      });

      // Add photo
      if (data.photo) {
        formData.append("photo", data.photo[0]);
      }

      const response = await tenantApi.post("/employees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert(response.data.message || "Staff member created successfully!", "success");
      navigate("/staff");
    } catch (err: any) {
      console.error("❌ Error:", err.response?.data);
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(", ");
        showAlert(`Validation failed: ${errorMessages}`, "error");
      } else {
        showAlert(err.response?.data?.message || "Failed to create staff member.", "error");
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="bg-white border-b border-slate-200 px-4 py-1 sticky top-0 z-10">
        <PageHeaderBack title="Back" buttonLink="/staff" />
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            
            {/* Card Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaUserTie size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Staff Onboarding
                </h2>
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

              {/* SECTION: Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaIdCard className="text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Employee ID" name="employee_id" register={register} errors={errors} required />
                    <InputField label="First Name" name="first_name" register={register} errors={errors} required />
                    <InputField label="Last Name" name="last_name" register={register} errors={errors} required />
                    <InputField label="Email" name="email" type="email" register={register} errors={errors} required />
                    <InputField label="Phone Number" name="phone" type="tel" register={register} errors={errors} required />

                    {/* Dynamic Gender Dropdown from Central DB */}
                    <SelectInputField
                      label="Gender"
                      name="gender"
                      register={register}
                      errors={errors}
                      options={dropdowns.genders.map(d => ({ label: d.value, value: d.value }))}
                      required
                    />
                    
                    <InputField label="Designation" name="designation" register={register} errors={errors} required />
                    <InputField label="Date of Joining" name="joining_date" type="date" register={register} errors={errors} required />
                  </div>
                </div>
              </div>

              {/* SECTION: Address Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaMapMarkerAlt className="text-green-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Address Details</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Address Line 1" name="address_line_1" register={register} errors={errors} />
                    <InputField label="Address Line 2" name="address_line_2" register={register} errors={errors} />
                    <InputField label="Landmark" name="landmark" register={register} errors={errors} />
                    
                    {/* Dynamic State Dropdown from Central DB */}
                    <SelectInputField
                      label="State"
                      name="state"
                      register={register}
                      errors={errors}
                      options={dropdowns.states.map(s => ({ label: s.state, value: s.state }))}
                    />
                    
                    {/* Dynamic District Dropdown (depends on State) */}
                    <SelectInputField
                      label="District"
                      name="district"
                      register={register}
                      errors={errors}
                      options={districts.map(d => ({ label: d.district, value: d.district }))}
                      disabled={!selectedState}
                    />
                    
                    <InputField label="City" name="city" register={register} errors={errors} />
                    <InputField label="Pincode" name="pincode" register={register} errors={errors} />
                    
                    {/* Dynamic Status Dropdown from Central DB */}
                    <SelectInputField
                      label="Status"
                      name="status"
                      register={register}
                      errors={errors}
                      options={dropdowns.statuses.map(d => ({ label: d.value, value: d.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Roles */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaShieldAlt className="text-red-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">System Roles <span className="text-red-500">*</span></h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <Controller
                    name="roles"
                    control={control}
                    rules={{ required: "At least one role must be selected." }}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {dropdowns.roles.map((role) => {
                          const isSelected = field.value?.includes(role.name);
                          return (
                            <label
                              key={role.id}
                              className={`
                                relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                ${isSelected
                                  ? 'bg-purple-50 border-purple-200 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50'}
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const selectedRoles = field.value || [];
                                    const newSelection = e.target.checked
                                      ? [...selectedRoles, role.name]
                                      : selectedRoles.filter((r) => r !== role.name);
                                    field.onChange(newSelection);
                                  }}
                                />
                                <span className={`text-xs font-bold uppercase ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>
                                  {role.name}
                                </span>
                              </div>
                              {isSelected && <FaCheck className="text-purple-600 text-[10px]" />}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.roles && (
                    <p className="text-red-500 text-xs mt-3 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {errors.roles.message}
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION: Photo */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaCamera className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Profile Picture</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileInputField
                      label="Photo"
                      name="photo"
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-3 border-t border-slate-200 flex flex-col-reverse md:flex-row justify-start items-center gap-4">
              <CancelButton label="Cancel" onClick={() => navigate("/staff")} />
              <SaveButton label="save" isSaving={isSubmitting} onClick={handleSubmit(onSubmit)} />
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffCreatePage;
