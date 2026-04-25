import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Truck, 
  ShieldCheck, 
  FileText, 
  Settings, 
  ClipboardCheck, 
  UserPlus, 
  StickyNote, 
  Info,
  Navigation as NavigationIcon,
  ArrowLeft,
  ChevronRight,
  Shield,
  Clock,
  PlusCircle,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Flame,
  Camera,
  Activity,
  HardDrive
} from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";

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

type VehicleFormPageProps = {
  mode: "create" | "edit";
  vehicleId?: string;
};

/* ── UI Components ────────────────────────── */
const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-6 ring-1 ring-slate-100/50 transition-all hover:shadow-md">
    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
        <Icon size={18} className="stroke-[2.5]" />
      </div>
      <h3 className="text-[11px] font-900 tracking-wider text-slate-500 uppercase">{title}</h3>
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

const SelectField = ({ label, name, register, required, errors, options }: any) => (
  <div>
    <FormLabel required={!!required}>{label}</FormLabel>
    <select
      className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'} text-xs font-700 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none`}
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

const FileUpload = ({ label, name, register, required, errors }: any) => (
  <div>
    <FormLabel required={!!required}>{label}</FormLabel>
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
          Upload Document
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
const VehicleFormPage = ({ mode, vehicleId }: VehicleFormPageProps) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: { status: "active" },
  });

  const [vehicleTypes, setVehicleTypes] = useState<FormDropdown[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FormDropdown[]>([]);
  const [permitTypes, setPermitTypes] = useState<FormDropdown[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<FormDropdown[]>([]);
  const [statuses, setStatuses] = useState<FormDropdown[]>([]);
  const [gps, setGps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ownershipType = useWatch({ control, name: "ownership_type" });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [vt, ft, pt, ot, st, gd] = await Promise.all([
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=vehicle_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=fuel_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=permit_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=vehicle&field=ownership_type`),
          axios.get(`${centralUrl}/masters/forms/dropdowns/fields?type=common&field=status`),
          tenantApi.get(`/gps-device/for/dropdown`),
        ]);
        setVehicleTypes(vt.data || []);
        setFuelTypes(ft.data || []);
        setPermitTypes(pt.data || []);
        setOwnershipTypes(ot.data || []);
        setStatuses(st.data || []);
        setGps(gd.data || []);
      } catch (error) {
        console.error(error);
        showAlert("Failed to load configuration data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [showAlert]);

  useEffect(() => {
    const loadVehicle = async () => {
      if (mode !== "edit" || !vehicleId) return;
      try {
        const res = await tenantApi.get<{ success: boolean; data: Vehicle }>(`/vehicles/${vehicleId}`);
        if (res.data.success) reset(res.data.data);
      } catch (error) {
        showAlert("Failed to load vehicle record.", "error");
      }
    };
    loadVehicle();
  }, [mode, vehicleId, reset, showAlert]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        const val = (data as any)[key];
        if (val instanceof FileList) {
          if (val.length > 0) formData.append(key, val[0]);
        } else if (val !== undefined && val !== null && val !== "") {
          formData.append(key, String(val));
        }
      });

      const response = mode === "create"
        ? await tenantApi.post("/vehicles", formData, { headers: { "Content-Type": "multipart/form-data" } })
        : await tenantApi.put(`/vehicles/${vehicleId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

      if (response.data.success) {
        showAlert(mode === "create" ? "Vehicle added successfully!" : "Vehicle updated successfully!", "success");
        navigate("/vehicles");
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Operation failed", "error");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Truck size={22} className="stroke-[2.5]" />
              <h1 className="text-xl font-900 tracking-wider uppercase">
                {mode === "create" ? "Register New Vehicle" : "Edit Vehicle Configuration"}
              </h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-1">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span>Fleet Inventory</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark uppercase">{mode === "create" ? "Add Vehicle" : "Modify Details"}</span>
           </div>
        </div>

        <button 
          onClick={() => navigate("/vehicles")}
          className="w-full md:w-auto justify-center btn flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-900 uppercase tracking-widest transition-all bg-white border border-slate-100 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1100px] mx-auto space-y-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Identity & Basic Info */}
            <SectionCard icon={Info} title="Universal Identity">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Vehicle Number" name="vehicle_number" register={register} errors={errors} required placeholder="e.g. MH12AB1234" />
                  <SelectField label="Vehicle Type" name="vehicle_type" register={register} errors={errors} required options={vehicleTypes.map(d => ({ label: d.value, value: d.value }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Manufacturer" name="manufacturer" register={register} errors={errors} placeholder="e.g. Tata Motors" />
                  <InputField label="Model Series" name="vehicle_model" register={register} errors={errors} placeholder="e.g. Nexon EV" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Mfg Year" name="manufacturing_year" type="number" register={register} errors={errors} placeholder="2024" />
                  <SelectField label="Fuel Source" name="fuel_type" register={register} errors={errors} options={fuelTypes.map(d => ({ label: d.value, value: d.value }))} />
                  <InputField label="Seats" name="seating_capacity" type="number" register={register} errors={errors} placeholder="4" />
                </div>
              </div>
            </SectionCard>

            <div className="space-y-6">
              {/* Registration Details */}
              <SectionCard icon={FileText} title="Registration & RTO Compliance">
                <div className="space-y-5">
                  <InputField label="RC Serial Number" name="rc_number" register={register} errors={errors} required placeholder="Enter RC Number" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="RC Issuance" name="rc_isued_date" type="date" register={register} errors={errors} required />
                    <InputField label="RC Expiry" name="rc_expiry_date" type="date" register={register} errors={errors} required />
                  </div>
                </div>
              </SectionCard>

              {/* Tracking Device */}
              <SectionCard icon={NavigationIcon} title="Tracking Architecture">
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="GPS Module" name="gps_device" register={register} errors={errors} options={gps.map(d => ({ label: d.label, value: d.label }))} />
                  <InputField label="Install Date" name="gps_installation_date" type="date" register={register} errors={errors} />
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Permits & Insurance */}
             <SectionCard icon={ShieldCheck} title="Permits & Insurance Matrix">
               <div className="space-y-6">
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <FormLabel>Regulatory Permit</FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                       <SelectField label="Permit Type" name="permit_type" register={register} errors={errors} options={permitTypes.map(d => ({ label: d.value, value: d.value }))} />
                       <InputField label="Permit #" name="permit_number" register={register} errors={errors} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                       <InputField label="Permit Issued" name="permit_issue_date" type="date" register={register} errors={errors} />
                       <InputField label="Permit Expiry" name="permit_expiry_date" type="date" register={register} errors={errors} />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                    <FormLabel>Insurance Policy</FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                       <InputField label="Provider" name="insurance_provider_name" register={register} errors={errors} placeholder="HDFC Ergo" />
                       <InputField label="Policy #" name="insurance_policy_number" register={register} errors={errors} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                       <InputField label="Policy Start" name="insurance_issued_date" type="date" register={register} errors={errors} />
                       <InputField label="Policy Expiry" name="insurance_expiry_date" type="date" register={register} errors={errors} />
                    </div>
                  </div>
               </div>
             </SectionCard>

             <div className="space-y-6">
               {/* Ownership */}
               <SectionCard icon={UserPlus} title="Ownership Framework">
                  <div className="space-y-5">
                    <SelectField label="Operational Type" name="ownership_type" register={register} errors={errors} required options={ownershipTypes.map(d => ({ label: d.value, value: d.value }))} />
                    
                    {(ownershipType?.toLowerCase() === "contract") && (
                      <div className="mt-4 p-5 bg-amber-50/30 rounded-[20px] border border-amber-100/50 animate-fade-in">
                        <div className="flex items-center gap-2 mb-4 text-amber-600">
                          <Activity size={14} />
                          <h4 className="text-[10px] font-900 uppercase tracking-widest">Vendor Context</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <InputField label="Vendor Name" name="vendor_name" register={register} errors={errors} />
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="PAN #" name="vendor_pan_number" register={register} errors={errors} />
                            <InputField label="Aadhaar #" name="vendor_aadhar_number" register={register} errors={errors} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
               </SectionCard>

               {/* Fitness & PUC */}
               <SectionCard icon={ClipboardCheck} title="Technical Fitness">
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                       <div className="col-span-1"><InputField label="PUC #" name="pollution_certificate_number" register={register} errors={errors} /></div>
                       <InputField label="PUC Issued" name="pollution_issued_date" type="date" register={register} errors={errors} />
                       <InputField label="PUC Expiry" name="pollution_expiry_date" type="date" register={register} errors={errors} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1"><InputField label="Fit #" name="fitness_certificate_number" register={register} errors={errors} /></div>
                        <InputField label="Fit Issued" name="fitness_issued_date" type="date" register={register} errors={errors} />
                        <InputField label="Fit Expiry" name="fitness_expiry_date" type="date" register={register} errors={errors} />
                    </div>
                  </div>
               </SectionCard>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Maintenance & Safety */}
             <SectionCard icon={Settings} title="Maintenance & Safety Controls">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Last Service" name="last_service_date" type="date" register={register} errors={errors} />
                    <InputField label="Next Due" name="next_service_due_date" type="date" register={register} errors={errors} />
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <SelectField label="Fire Ext" name="fire_extinguisher" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                    <SelectField label="First Aid" name="first_aid_kit" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                    <SelectField label="CCTV" name="cctv_installed" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                    <SelectField label="Panic Btn" name="panic_button_installed" register={register} errors={errors} options={[{label:'YES',value:'YES'},{label:'NO',value:'NO'}]} />
                  </div>
                </div>
             </SectionCard>

             {/* Documents */}
             <SectionCard icon={HardDrive} title="Digital Vault (Documents)">
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload label="RC Book Copy" name="rc_book_doc" register={register} errors={errors} required={mode==='create'} />
                  <FileUpload label="Insurance Copy" name="insurance_doc" register={register} errors={errors} required={mode==='create'} />
                  <FileUpload label="Permit Copy" name="permit_copy" register={register} errors={errors} />
                  <FileUpload label="PUC Cert" name="puc_doc" register={register} errors={errors} />
                </div>
             </SectionCard>
          </div>

          {/* Action Center */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 p-6 sm:p-8 bg-white border border-slate-100 rounded-[32px] shadow-lg">
             <button 
               type="button"
               onClick={() => navigate("/vehicles")}
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
                   {mode === 'create' ? <PlusCircle size={18} /> : <CheckCircle2 size={18} />}
                   <span>{mode === 'create' ? 'Register Vehicle' : 'Commit Changes'}</span>
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormPage;