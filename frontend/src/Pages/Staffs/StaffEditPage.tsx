// src/components/staff/StaffEditPage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Controller, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import {
  FaIdCard,
  FaAddressCard,
  FaShieldAlt,
  FaUsers,
  FaBriefcase,
  FaUniversity,
  FaFileAlt,
  FaPhoneAlt,
  FaTrash,
  FaUserPlus
} from "react-icons/fa";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import InputField from "../../Components/Form/InputField";
import FileInputField from "../../Components/Form/FileInputField";
import SaveButton from "../../Components/Form/SaveButton";
import CancelButton from "../../Components/Form/CancelButton";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import EmptyState from "../../Components/UI/EmptyState";

// Services & Context
import { useAlert } from "../../Context/AlertContext";
import type { Employee, Role } from "./Staff.types";
import type { StateDistrict } from "../../Types/Index";
import tenantApi, { centralUrl } from "../../Services/ApiService";
import axios from "axios";
import SelectInputField from "../../Components/Form/SelectInputField";

const StaffEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [states, setStates] = useState<StateDistrict[]>([]);
  const [districts, setDistricts] = useState<StateDistrict[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Employee>({
    defaultValues: {
      status: "active",
      roles: [],
      marital_status: "",
      dependants: []
    },
  });

  // Dynamic Array for Dependants
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependants",
  });

  // Watchers
  const selectedState = useWatch({ control, name: "state" });

  // 1. Fetch Initial Data (Roles, States & Employee Data)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesRes, statesRes, employeeRes] = await Promise.all([
          tenantApi.get("/roles"),
          axios.get(`${centralUrl}/masters/forms/dropdowns/states`),
          tenantApi.get(`/employees/${id}`)
        ]);

        setAllRoles(rolesRes.data.data || []);
        setStates(statesRes.data || []);

        const emp = employeeRes.data.data;

        // --- KEY FIX: Fetch Districts for the existing state immediately ---
        if (emp.state) {
          try {
            const districtRes = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${emp.state}`);
            setDistricts(districtRes.data || []);
          } catch (dErr) {
            console.error("Failed to load initial districts", dErr);
          }
        }

        // Extract Role Names
        const roleNames = emp.user?.roles
          ? emp.user.roles.map((r: any) => r.name)
          : [];

        // Populate Form
        reset({
          ...emp,
          roles: roleNames,
          dependants: emp.dependants || [],
          photo: undefined,
          aadhaar_card: undefined,
          pan_card: undefined,
          bank_proof: undefined
        });

      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load employee data.");
        showAlert("Failed to load data.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, reset, showAlert]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        return;
      }

      // Optimization: If districts are already loaded for this state (from initial fetch), skip.
      // But for simplicity and reliability, fetching again is fine, or checking against current list.
      try {
        const response = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${selectedState}`);
        setDistricts(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    // Only trigger if selectedState exists and we aren't loading (to avoid clash with initial fetch)
    if (selectedState && !loading) {
      fetchDistricts();
    }
  }, [selectedState, loading]);

  // 3. Submit Handler
  const onSubmit: SubmitHandler<Employee> = async (data) => {
    if (!data.roles || data.roles.length === 0) {
      showAlert("Please select at least one role.", "error");
      return;
    }

    try {
      const formData = new FormData();

      // Append Simple Fields
      Object.keys(data).forEach((key) => {
        const k = key as keyof Employee;
        const value = data[k];

        if (['roles', 'dependants', 'photo', 'aadhaar_card', 'pan_card', 'bank_proof', 'user'].includes(k)) return;

        if (value !== undefined && value !== null) {
          formData.append(k, String(value));
        }
      });

      // Append Roles
      data.roles.forEach((role) => formData.append("roles[]", role));

      // Append Dependants
      if (data.dependants && data.dependants.length > 0) {
        formData.append("dependants", JSON.stringify(data.dependants));
      }

      // Append Files
      if (data.photo && data.photo.length > 0) formData.append("photo", data.photo[0]);
      if (data.aadhaar_card && data.aadhaar_card.length > 0) formData.append("aadhaar_card", data.aadhaar_card[0]);
      if (data.pan_card && data.pan_card.length > 0) formData.append("pan_card", data.pan_card[0]);
      if (data.bank_proof && data.bank_proof.length > 0) formData.append("bank_proof", data.bank_proof[0]);

      const response = await tenantApi.put(`/employees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert(response.data.message || "Staff updated successfully!", "success");
      navigate("/staff");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update staff member.";
      showAlert(msg, "error");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-4"><EmptyState title="Error" description={error} /></div>;

  return (
    <div className="min-h-screen bg-white pb-12">
      <PageHeaderBack title="back" buttonLink="/staff" />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaUserPlus size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Edit Employee Details
                </h2>
              </div>
            </div>

            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

              {/* 1. Basic Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaIdCard className="text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <InputField label="Employee ID" name="employee_id" register={register} errors={errors} required />
                    <InputField label="First Name" name="first_name" register={register} errors={errors} required />
                    <InputField label="Last Name" name="last_name" register={register} errors={errors} required />

                    <SelectInputField
                      label="Gender"
                      name="gender"
                      register={register}
                      errors={errors}
                      options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]}
                      required
                    />

                    <InputField label="Date of Birth" name="date_of_birth" type="date" register={register} errors={errors} required />
                    <InputField label="Joining Date" name="joining_date" type="date" register={register} errors={errors} required />

                    <SelectInputField
                      label="Marital Status"
                      name="marital_status"
                      register={register}
                      errors={errors}
                      options={[{ label: "Single", value: "Single" }, { label: "Married", value: "Married" }, { label: "Divorced", value: "Divorced" }]}
                      required
                    />

                    <div className="relative">
                      <FileInputField label="New Profile Photo" name="photo" register={register} errors={errors} />

                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Dependants */}

              <div className="animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <FaUsers className="text-pink-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dependants</h3>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4">
                  {fields.length === 0 && <p className="text-sm text-slate-500 italic uppercase p-2">No dependants added.</p>}

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <InputField label="Full Name" name={`dependants.${index}.fullname`} register={register} errors={errors} placeholder="Name" />
                      <SelectInputField
                        label="Relation"
                        name={`dependants.${index}.relation`}
                        register={register}
                        errors={errors}
                        options={[{ label: "Spouse", value: "Spouse" }, { label: "Child", value: "Child" }, { label: "Parent", value: "Parent" }, { label: "Sibling", value: "Sibling" }]}
                      />
                      <InputField label="Age" name={`dependants.${index}.age`} type="number" register={register} errors={errors} placeholder="Age" />
                      <InputField label="Phone" name={`dependants.${index}.phone`} register={register} errors={errors} placeholder="Phone" />
                      <div className="flex justify-center pb-1">
                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => append({ fullname: "", relation: "", age: 0, phone: "", email: "" })} className="bg-indigo-500 py-2 px-4 rounded-lg text-xs font-bold text-white hover:bg-indigo-600 uppercase mt-2 shadow-sm">
                    + Add Dependant
                  </button>
                </div>
              </div>

              {/* 3. Professional Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaBriefcase className="text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Professional Info</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SelectInputField
                      label="Employment Type"
                      name="employment_type"
                      register={register}
                      errors={errors}
                      options={[{ label: "Full Time", value: "Full-Time" }, { label: "Contract", value: "Contract" }, { label: "Intern", value: "Intern" }]}
                      required
                    />
                    <InputField label="Designation" name="designation" register={register} errors={errors} required />
                    <InputField label="Official Email" name="email" type="email" register={register} errors={errors} required />
                    <InputField label="Mobile Number" name="phone" type="tel" register={register} errors={errors} required />
                  </div>
                </div>
              </div>

              {/* 4. Address */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaAddressCard className="text-green-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Address Details</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Address Line 1" name="address_line_1" register={register} errors={errors} required />
                    <InputField label="Address Line 2" name="address_line_2" register={register} errors={errors} />
                    <InputField label="Landmark" name="landmark" register={register} errors={errors} />

                    <SelectInputField
                      label="State"
                      name="state"
                      register={register}
                      errors={errors}
                      options={states.map(s => ({ label: s.state, value: s.state }))}
                      required
                    />
                    <SelectInputField
                      label="District"
                      name="district"
                      register={register}
                      errors={errors}
                      options={districts.map(d => ({ label: d.district, value: d.district }))}
                      disabled={districts.length === 0}
                      required
                    />

                    <InputField label="City" name="city" register={register} errors={errors} required />
                    <InputField label="PIN Code" name="pin_code" register={register} errors={errors} required />
                  </div>
                </div>
              </div>

              {/* 5. Emergency Contacts */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaPhoneAlt className="text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Emergency Contacts</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100 space-y-6">
                  {/* Primary */}
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Primary Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <InputField label="Name" name="primary_person_name" register={register} errors={errors} required />
                      <InputField label="Email" name="primary_person_email" type="email" register={register} errors={errors} />
                      <InputField label="Phone 1" name="primary_person_phone_1" register={register} errors={errors} required />
                      <InputField label="Phone 2" name="primary_person_phone_2" register={register} errors={errors} />
                    </div>
                  </div>
                  {/* Secondary */}
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Secondary Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <InputField label="Name" name="secondary_person_name" register={register} errors={errors} />
                      <InputField label="Email" name="secondary_person_email" type="email" register={register} errors={errors} />
                      <InputField label="Phone 1" name="secondary_person_phone_1" register={register} errors={errors} />
                      <InputField label="Phone 2" name="secondary_person_phone_2" register={register} errors={errors} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Bank Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaUniversity className="text-yellow-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bank Details</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Bank Name" name="bank_name" register={register} errors={errors} />
                    <InputField label="Account Holder Name" name="account_holder_name" register={register} errors={errors} />
                    <InputField label="Account Number" name="account_number" register={register} errors={errors} />
                    <InputField label="IFSC Code" name="ifsc_code" register={register} errors={errors} />
                  </div>
                </div>
              </div>

              {/* 7. Documents */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaFileAlt className="text-red-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Documents (Update Only)</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <FileInputField label="Aadhaar Card" name="aadhaar_card" register={register} errors={errors} />

                    </div>
                    <div className="relative">
                      <FileInputField label="PAN Card" name="pan_card" register={register} errors={errors} />

                    </div>
                    <div className="relative">
                      <FileInputField label="Bank Proof" name="bank_proof" register={register} errors={errors} />

                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Roles & Remarks */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaShieldAlt className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">System Roles & Status</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                      <SelectInputField
                        label="Account Status"
                        name="status"
                        register={register}
                        errors={errors}
                        options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]}
                      />

                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase">Assign Roles <span className="text-red-500">*</span></label>
                        <Controller
                          name="roles"
                          control={control}
                          rules={{ required: "Select at least one role" }}
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-2">
                              {allRoles.map((role) => {
                                const isSelected = field.value?.includes(role.name);
                                return (
                                  <label key={role.id} className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-300 hover:border-purple-300'}`}>
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const current = field.value || [];
                                        const next = e.target.checked ? [...current, role.name] : current.filter(r => r !== role.name);
                                        field.onChange(next);
                                      }}
                                    />
                                    {role.name}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        />
                        {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase">Remarks</label>
                      <textarea
                        {...register("remarks")}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={4}
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4">
              <CancelButton label="cancel" type="button" onClick={() => navigate("/staff")} />
              <SaveButton type="submit" label="save" isSaving={isSubmitting} onClick={handleSubmit(onSubmit)} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEditPage;