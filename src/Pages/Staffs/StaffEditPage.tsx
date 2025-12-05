// src/components/staff/StaffEditPage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Controller, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Icons
import {
  FaUserEdit,
  FaIdCard,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCheck,
  FaUserCircle
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
import { useAuth } from "../../Context/AuthContext";
import tenantApi, { tenantAsset, centralUrl } from "../../Services/ApiService";
import type { Staff } from "./Staff.types";
import type { FormDropdown, StateDistrict } from "../../Types/Index";

interface Role {
  id: number;
  name: string;
}

const StaffEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  
  // Unified dropdown state (like DriverCreatePage)
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
    reset,
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

  // 1. Fetch Dropdowns & Employee Data in Parallel
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch all data in parallel using Promise.all
        const [genders, statuses, states, roles, employee] = await Promise.all([
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=gender`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=status`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/states`),
          tenantApi.get("/roles"),
          tenantApi.get(`/employees/${id}`)
        ]);

        // Set dropdown data
        setDropdowns({
          genders: genders.data || [],
          statuses: statuses.data || [],
          states: states.data || [],
          roles: roles.data.data || [],
        });

        // Set current photo
        const employeeData = employee.data;
        setCurrentPhoto(employeeData.photo);

        // Populate form with employee data
        reset({
          employee_id: employeeData.employee_id,
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          designation: employeeData.designation,
          gender: employeeData.gender,
          address_line_1: employeeData.address_line_1,
          address_line_2: employeeData.address_line_2,
          landmark: employeeData.landmark,
          state: employeeData.state,
          district: employeeData.district,
          city: employeeData.city,
          pincode: employeeData.pincode,
          joining_date: employeeData.joining_date.split("T")[0],
          email: employeeData.email,
          phone: employeeData.phone,
          status: employeeData.status,
          roles: employeeData.roles || [],
        });

        // If employee has a state, fetch districts for that state
        if (employeeData.state) {
          const districtResponse = await axios.get(
            `${centralUrl}/masters/forms/dropdowns/districts/${employeeData.state}`
          );
          setDistricts(districtResponse.data || []);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        showAlert(err.response?.data?.message || "Failed to load employee data.", "error");
        navigate("/staff");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, showAlert, navigate]);

  // 2. Fetch Districts on State Change
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        setValue('district', ''); // Reset district when state changes
        return;
      }

      try {
        const response = await axios.get(
          `${centralUrl}/masters/forms/dropdowns/districts/${selectedState}`
        );
        setDistricts(response.data || []);
      } catch (err) {
        console.error("Error fetching districts:", err);
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
      formData.append("address_line_1", data.address_line_1);
      formData.append("address_line_2", data.address_line_2);
      formData.append("landmark", data.landmark);
      formData.append("state", data.state);
      formData.append("district", data.district);
      formData.append("city", data.city);
      formData.append("pincode", data.pincode);
      formData.append("joining_date", data.joining_date);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("status", data.status);

      // Add roles
      data.roles.forEach((role) => {
        formData.append("roles[]", role);
      });

      // Add new photo if selected
      if (data.photo && data.photo.length > 0) {
        formData.append("photo", data.photo[0]);
      }

      // Add method spoofing for Laravel PUT
      formData.append("_method", "PUT");

      const response = await tenantApi.post(`/employees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert(response.data.message || "Staff member updated successfully!", "success");
      await refreshMe();
      navigate("/staff");
    } catch (err: any) {
      console.error("❌ Error updating staff:", err);
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(", ");
        showAlert(`Validation failed: ${errorMessages}`, "error");
      } else {
        showAlert(err.response?.data?.message || "Failed to update staff member.", "error");
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-1 sticky top-0 z-10">
        <PageHeaderBack title="back" buttonLink="/staff" />
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">

            {/* Card Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaUserEdit size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Edit Profile
                </h2>
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

               {/* SECTION: Photo */}
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
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-md text-slate-400">
                          <FaUserCircle size={48} />
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase">Current Photo</h4>
                      <p className="text-xs uppercase text-slate-500 mt-1">
                        This is the image currently displayed on employee profile.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileInputField
                      label="Upload New Photo"
                      name="photo"
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaIdCard className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Employee ID" name="employee_id" register={register} errors={errors} required />
                    <InputField label="First Name" name="first_name" register={register} errors={errors} required />
                    <InputField label="Last Name" name="last_name" register={register} errors={errors} required />
                    <InputField label="Email Address" name="email" type="email" register={register} errors={errors} required />
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

export default StaffEditPage;
