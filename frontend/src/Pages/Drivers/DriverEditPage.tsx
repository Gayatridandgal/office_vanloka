import React, { useState, useEffect } from "react";
import { useFieldArray, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  User, 
  MapPin, 
  Briefcase, 
  FileText, 
  IdCard, 
  CreditCard, 
  AlertTriangle, 
  StickyNote, 
  Plus, 
  Trash2,
  Navigation as NavigationIcon,
  ArrowLeft,
  ChevronRight,
  Shield,
  Clock,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Activity,
  HardDrive,
  UserCircle
} from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";

// Services & Context
import tenantApi, { centralUrl, tenantAsset } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";

// Types
import type { Driver } from "./Driver.types";
import type { BeaconDevice, FormDropdown, StateDistrict } from "../../Types/Index";
import type { Vehicle } from "../Vehicles/Vehicle.types";

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

/* ── UI Components ────────────────────────── */
const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-6 ring-1 ring-slate-100/50 transition-all hover:shadow-md">
    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Icon size={18} className="stroke-[2.5]" />
        </div>
        <h3 className="text-[11px] font-900 tracking-wider text-slate-500 uppercase">{title}</h3>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const FormLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="block text-[10px] font-900 text-slate-400 tracking-widest uppercase mb-2">
    {children}
    {required && <span className="text-rose-500 ml-1 italic">*</span>}
  </label>
);

const InputField = ({ label, name, register, required, errors, type = "text", placeholder }: any) => (
  <div>
    <FormLabel required={!!required}>{label}</FormLabel>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'} text-xs font-700 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
      {...register(name, required ? { required: "Field is required" } : {})}
    />
    {errors[name] && (
      <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 text-[10px] font-800 uppercase tracking-tight">
        <AlertCircle size={12} />
        {errors[name]?.message}
      </div>
    )}
  </div>
);

const SelectField = ({ label, name, register, required, errors, options, disabled }: any) => (
  <div>
    <FormLabel required={!!required}>{label}</FormLabel>
    <select
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'} text-xs font-700 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:opacity-50`}
      {...register(name, required ? { required: "Field is required" } : {})}
    >
      <option value="">Choose Option</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {errors[name] && (
      <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 text-[10px] font-800 uppercase tracking-tight">
        <AlertCircle size={12} />
        {errors[name]?.message}
      </div>
    )}
  </div>
);

const FileUpload = ({ label, name, register, required, errors, existing }: any) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <FormLabel required={!!required}>{label}</FormLabel>
      {existing && <span className="text-[9px] font-900 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">Attached</span>}
    </div>
    <div className="relative">
      <input
        type="file"
        className="hidden"
        id={`file-${name}`}
        {...register(name, required ? { required: "Document is required" } : {})}
      />
      <label 
        htmlFor={`file-${name}`}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group"
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
          <FileText size={16} />
        </div>
        <span className="text-[10px] font-800 text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
          {existing ? 'Update Document' : 'Upload Document'}
        </span>
      </label>
    </div>
    {errors[name] && (
      <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 text-[10px] font-800 uppercase tracking-tight">
        <AlertCircle size={12} />
        {errors[name]?.message}
      </div>
    )}
  </div>
);

/* ── Main Component ────────────────────────── */
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

  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
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

  const selectedState = useWatch({ control, name: "state" });
  const hasSafetyTraining = watch("safety_training_completion");
  const hasMedicalFitness = watch("medical_fitness");
  const hasPoliceVerification = watch("police_verification");

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [dr, g, b, m, e, s, f, st, v, bc] = await Promise.all([
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

        const driver = dr.data.data || dr.data;
        setDriverData(driver);
        setCurrentPhoto(driver.profile_photo);
        reset(driver);

        if (driver.license_insurance && Array.isArray(driver.license_insurance)) {
          replace(driver.license_insurance);
        }

        setDropdowns({
          genders: g.data || [],
          bloodGroups: b.data || [],
          maritalStatuses: m.data || [],
          employmentTypes: e.data || [],
          statuses: s.data || [],
          fileTypes: f.data || [],
          states: Array.from(new Set((st.data || []).map((s: any) => s.state))).map(stateName => ({ state: stateName })),
          vehicles: v.data || [],
          beacons: bc.data || [],
        });

        if (driver.state) {
          const districtRes = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${driver.state}`);
          setDistricts(districtRes.data || []);
        }
      } catch (error) {
        showAlert("Failed to load driver configuration.", "error");
        navigate("/drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, showAlert, navigate, reset, replace]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) { setDistricts([]); return; }
      if (driverData && selectedState === driverData.state && districts.length > 0) return;
      try {
        const response = await axios.get(`${centralUrl}/masters/forms/dropdowns/districts/${selectedState}`);
        setDistricts(response.data || []);
        if (driverData && selectedState !== driverData.state) setValue("district", "");
      } catch (err) { console.error(err); }
    };
    fetchDistricts();
  }, [selectedState]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        const k = key as keyof FormInputs;
        const value = data[k];
        if (value instanceof FileList) {
          if (value.length > 0) formData.append(k, value[0]);
        } else if (Array.isArray(value) && k === 'license_insurance') {
          formData.append(k, JSON.stringify(value));
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(k, String(value));
        }
      });

      const response = await tenantApi.put(`/drivers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        showAlert("Driver details updated successfully!", "success");
        navigate("/drivers");
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Update failed", "error");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <User size={22} className="stroke-[2.5]" />
              <h1 className="text-xl font-900 tracking-wider uppercase">
                Modify Driver Configuration
              </h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-1">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span>Personnel</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark">Edit Record</span>
           </div>
        </div>

        <button 
          onClick={() => navigate("/drivers")}
          className="w-full md:w-auto justify-center btn flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-900 uppercase tracking-widest transition-all bg-white border border-slate-100 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1100px] mx-auto space-y-6 pb-24">
          
          {/* Identity Profile */}
          <SectionCard icon={IdCard} title="Personal Identity Profile">
            <div className="space-y-6">
              {/* Profile Sync Preview */}
              <div className="flex items-center gap-6 p-5 bg-slate-50/50 rounded-[24px] border border-slate-100">
                <div className="relative">
                  {currentPhoto ? (
                    <img src={`${tenantAsset}${currentPhoto}`} alt="DRV" className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg border border-slate-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white shadow-lg border border-slate-100 text-indigo-600">
                      <UserCircle size={48} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-900 uppercase tracking-widest text-slate-400 mb-1">Active Snapshot</h4>
                   <p className="text-xs font-800 text-slate-700">Currently Synchronized Photo</p>
                   <p className="text-[10px] font-700 text-slate-400 mt-1 uppercase tracking-tighter">Update by selecting a new file below</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="First Name" name="first_name" register={register} errors={errors} required />
                    <InputField label="Last Name" name="last_name" register={register} errors={errors} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Mobile Contact" name="mobile_number" register={register} errors={errors} required />
                    <InputField label="Email Address" name="email" type="email" register={register} errors={errors} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Date of Birth" name="date_of_birth" type="date" register={register} errors={errors} required />
                    <SelectField label="Blood Group" name="blood_group" register={register} errors={errors} options={dropdowns.bloodGroups.map(d => ({ label: d.value, value: d.value }))} />
                  </div>
                </div>
                <div className="space-y-5">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField label="Gender" name="gender" register={register} errors={errors} required options={dropdowns.genders.map(d => ({ label: d.value, value: d.value }))} />
                      <SelectField label="Marital Status" name="marital_status" register={register} errors={errors} options={dropdowns.maritalStatuses.map(d => ({ label: d.value, value: d.value }))} />
                   </div>
                   <InputField label="Dependents Count" name="number_of_dependents" type="number" register={register} errors={errors} />
                   <FileUpload label="Update Profile Image" name="profile_photo" register={register} errors={errors} existing={!!currentPhoto} />
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Location Matrix */}
              <SectionCard icon={MapPin} title="Residency & Location Matrix">
                <div className="space-y-5">
                   <InputField label="Address Line 1" name="address_line_1" register={register} errors={errors} />
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField label="State Region" name="state" register={register} errors={errors} options={dropdowns.states.map(s => ({ label: s.state, value: s.state }))} />
                      <SelectField label="District / zone" name="district" register={register} errors={errors} options={districts.map(d => ({ label: d.district, value: d.district }))} disabled={!selectedState} />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="City / Town" name="city" register={register} errors={errors} />
                      <InputField label="Postal Code" name="pin_code" register={register} errors={errors} />
                   </div>
                </div>
              </SectionCard>

              {/* Employment context */}
              <SectionCard icon={Briefcase} title="Professional Engagement">
                 <div className="space-y-5">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField label="Contract Type" name="employment_type" register={register} errors={errors} options={dropdowns.employmentTypes.map(d => ({ label: d.value, value: d.value }))} />
                        <InputField label="Corporate ID" name="employee_id" register={register} errors={errors} />
                     </div>
                    <InputField label="Industry Experience (Years)" name="driving_experience" type="number" register={register} errors={errors} />
                 </div>
              </SectionCard>
            </div>

            {/* Security & Training */}
            <SectionCard icon={Shield} title="Security & Readiness Audit">
              <div className="space-y-6">
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Safety Training" name="safety_training_completion" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                        {hasSafetyTraining==='YES' && <InputField label="Audit Date" name="safety_training_completion_date" type="date" register={register} errors={errors} />}
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Medical Fitness" name="medical_fitness" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                        {hasMedicalFitness==='YES' && <InputField label="Cert Expiry" name="medical_fitness_exp_date" type="date" register={register} errors={errors} />}
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Police Verification" name="police_verification" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                        {hasPoliceVerification==='YES' && <InputField label="Verification Date" name="police_verification_date" type="date" register={register} errors={errors} />}
                    </div>
                  </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Financial context */}
             <SectionCard icon={CreditCard} title="Financial disbursement (Bank)">
                <div className="space-y-5">
                   <InputField label="Account Holder" name="account_holder_name" register={register} errors={errors} />
                   <InputField label="Bank Entity" name="bank_name" register={register} errors={errors} />
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="Account Number" name="account_number" register={register} errors={errors} />
                      <InputField label="IFSC Routine Code" name="ifsc_code" register={register} errors={errors} />
                   </div>
                </div>
             </SectionCard>

             {/* Emergency context */}
             <SectionCard icon={Activity} title="Emergency protocol">
                <div className="space-y-4">
                   <div className="text-[9px] font-900 text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Primary Responder</div>
                   <div className="grid grid-cols-2 gap-4">
                     <InputField label="Contact Name" name="primary_person_name" register={register} errors={errors} />
                     <InputField label="Emergency phone" name="primary_person_phone_1" register={register} errors={errors} />
                   </div>
                   <div className="text-[9px] font-900 text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mt-2">Secondary Responder</div>
                   <div className="grid grid-cols-2 gap-4">
                     <InputField label="Contact Name" name="secondary_person_name" register={register} errors={errors} />
                     <InputField label="Emergency phone" name="secondary_person_phone_1" register={register} errors={errors} />
                   </div>
                </div>
             </SectionCard>
          </div>

          {/* Dynamic License Array */}
          <SectionCard icon={FileText} title="Authorization Matrix (Licenses)">
             <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-wrap md:flex-nowrap items-end gap-4 transition-all hover:bg-slate-50/50">
                     <div className="flex-1 min-w-[150px]">
                        <SelectField label="Class" name={`license_insurance.${index}.type`} register={register} errors={errors} options={dropdowns.fileTypes.map(d => ({ label: d.value, value: d.value }))} />
                     </div>
                     <div className="flex-1 min-w-[150px]">
                        <InputField label="Doc #" name={`license_insurance.${index}.number`} register={register} errors={errors} />
                     </div>
                     <div className="flex-1 min-w-[150px]">
                        <InputField label="Issued" name={`license_insurance.${index}.issue_date`} type="date" register={register} errors={errors} />
                     </div>
                     <div className="flex-1 min-w-[150px]">
                        <InputField label="Expiry" name={`license_insurance.${index}.exp_date`} type="date" register={register} errors={errors} />
                     </div>
                     <button type="button" onClick={() => remove(index)} className="w-10 h-10 shrink-0 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => append({ type: "", number: "", issue_date: "", exp_date: "" })}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-dashed border-indigo-200 text-indigo-600 text-[10px] font-900 uppercase tracking-widest hover:bg-indigo-50 transition-all"
                >
                  <Plus size={14} /> Append Authorization
                </button>
             </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Operations */}
             <SectionCard icon={NavigationIcon} title="Operational assignment">
                <div className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Fleet Unit" name="vehicle" register={register} errors={errors} options={dropdowns.vehicles.map(v => ({ label: v.vehicle_number, value: v.vehicle_number }))} />
                      <SelectField label="Tracking Node" name="beacon_id" register={register} errors={errors} options={dropdowns.beacons.map(b => ({ label: `${b.device_id} (${b.imei_number})`, value: b.imei_number }))} />
                   </div>
                   {driverData?.beacon_id && <p className="text-[10px] font-900 text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100 inline-block">Active Lock: {driverData.beacon_id}</p>}
                </div>
             </SectionCard>

             {/* Records */}
             <SectionCard icon={HardDrive} title="Compliance Repository">
                <div className="grid grid-cols-2 gap-4">
                   <FileUpload label="Driving Auth" name="driving_license" register={register} errors={errors} existing={!!driverData?.driving_license} />
                   <FileUpload label="Identity Card" name="aadhaar_card" register={register} errors={errors} existing={!!driverData?.aadhaar_card} />
                   <FileUpload label="PAN Registry" name="pan_card" register={register} errors={errors} existing={!!driverData?.pan_card} />
                   <FileUpload label="Police Clearance" name="police_verification_doc" register={register} errors={errors} existing={!!driverData?.police_verification_doc} />
                </div>
             </SectionCard>
          </div>

          {/* Action Center */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 p-6 sm:p-8 bg-white border border-slate-100 rounded-[32px] shadow-lg">
             <button 
               type="button"
               onClick={() => navigate("/drivers")}
               className="px-8 py-4 text-[11px] font-900 text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors w-full sm:w-auto"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="w-full sm:w-auto justify-center px-10 py-4 bg-indigo-600 text-white rounded-[20px] shadow-xl shadow-indigo-600/20 font-900 uppercase tracking-widest text-[11px] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
             >
               {isSubmitting ? (
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Syncing...</span>
                 </div>
               ) : (
                 <>
                   <CheckCircle2 size={18} />
                   <span>Commit Changes</span>
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEditPage;