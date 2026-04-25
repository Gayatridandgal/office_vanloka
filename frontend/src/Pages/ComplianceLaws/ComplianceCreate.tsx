import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Gavel, 
  FileText, 
  Landmark, 
  Calendar, 
  ShieldCheck, 
  UploadCloud, 
  ClipboardCheck, 
  PlusCircle, 
  ArrowLeft, 
  X,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Clock,
  Navigation
} from "lucide-react";
import { INITIAL_COMPLIANCE } from "./complianceData";

/* ── Types ─────────────────────────────────── */
interface Form {
  documentName: string;
  subLaw: string;
  regNumber: string;
  category: string;
  authority: string;
  authorityContact: string;
  issueDate: string;
  status: string;
  appliesTo: string[];
  documentFile: File | null;
  remarks: string;
  consent: boolean;
  consentTimestamp: string;
  videoUrl: string;
}

type Errs = Partial<Record<keyof Form, string>>;

const CATEGORIES = [
  "License", "Insurance", "Safety", "Environmental", "Tax & Finance", 
  "Labour", "Vehicle Certification", "Penalty", "Office Policies", "Other"
];

const AUTHORITIES = [
  "Regional Transport Office (RTO)", "Traffic Police", "IRDAI", "Fire Department", 
  "Ministry of Transport", "State Transport Authority", "Labour Department", "Other"
];

const APPLIES_TO_OPTIONS = [
  "All Vehicles", "All Managers", "All Staff", "All Employees", "Premises / Infrastructure", "Management"
];

const STATUS_OPTIONS = [
  { val: "Compliant", color: "emerald" },
  { val: "Non-Compliant", color: "rose" },
  { val: "Pending Review", color: "blue" },
];

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

const FormError = ({ msg }: { msg?: string }) => 
  msg ? (
    <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 text-[10px] font-800 uppercase tracking-tight animate-shake">
      <AlertCircle size={12} />
      {msg}
    </div>
  ) : null;

/* ── Main Component ────────────────────────── */
export const ComplianceCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Form>({
    documentName: "", subLaw: "", regNumber: "", category: "",
    authority: "", authorityContact: "", issueDate: "", status: "Compliant",
    appliesTo: [], documentFile: null, remarks: "", consent: false,
    consentTimestamp: "", videoUrl: "",
  });

  const [errs, setErrs] = useState<Errs>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const record = INITIAL_COMPLIANCE.find((r) => r.id === id);
      if (record) {
        setForm({
          ...record,
          regNumber: record.id,
          documentFile: null,
          videoUrl: record.videoUrl || "",
        });
      }
    }
  }, [id, isEdit]);

  const f = (key: keyof Form) => (e: any) => {
    setForm(v => ({ ...v, [key]: e.target.value }));
    setErrs(v => ({ ...v, [key]: undefined }));
  };

  const toggleAppliesTo = (val: string) => {
    setForm(v => ({
      ...v,
      appliesTo: v.appliesTo.includes(val) ? v.appliesTo.filter(x => x !== val) : [...v.appliesTo, val]
    }));
    setErrs(v => ({ ...v, appliesTo: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setErrs(v => ({ ...v, documentFile: "File size exceeds 10MB limit" }));
      return;
    }
    setForm(v => ({ ...v, documentFile: file }));
    setErrs(v => ({ ...v, documentFile: undefined }));
  };

  const validate = (): boolean => {
    const e: Errs = {};
    if (!form.documentName.trim()) e.documentName = "Name is required";
    if (!form.regNumber.trim()) e.regNumber = "Registration number is required";
    if (!form.category) e.category = "Select a category";
    if (!form.authority) e.authority = "Select issuing authority";
    if (!form.issueDate) e.issueDate = "Date is required";
    if (!form.status) e.status = "Select status";
    if (form.appliesTo.length === 0) e.appliesTo = "Select at least one option";
    if (!isEdit && !form.documentFile) e.documentFile = "Upload file is required";
    if (!form.consent) e.consent = "Verification consent is required";
    
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 text-center animate-bounce-in">
           <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
              <CheckCircle2 size={48} className="stroke-[2.5]" />
           </div>
           <h2 className="text-2xl font-900 text-slate-800 uppercase tracking-tight mb-2">Record Registered</h2>
           <p className="text-xs font-700 text-slate-400 uppercase tracking-widest mb-8 leading-relaxed px-4">
             Your compliance record for <span className="text-emerald-600 font-900">{form.documentName}</span> has been securely stored in the fleet vault.
           </p>
           <button 
             onClick={() => navigate("/compliance")}
             className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-900 uppercase tracking-widest text-[11px] shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <ArrowLeft size={16} /> Back to Compliance Center
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Gavel size={22} className="stroke-[2.5]" />
              <h1 className="text-xl font-900 tracking-wider uppercase">
                {isEdit ? "Edit Record" : "Add Compliance Record"}
              </h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-1">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span>Compliance & Laws</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark">Add Record</span>
           </div>
        </div>

        <button 
          onClick={() => navigate("/compliance")}
          className="w-full md:w-auto justify-center btn flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-900 uppercase tracking-widest transition-all bg-white border border-slate-100 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto space-y-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Identity Card */}
            <SectionCard icon={FileText} title="Document / Rule Identity">
              <div className="space-y-5">
                <div>
                  <FormLabel required>Document / Rule Name</FormLabel>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Office Security Policy"
                    value={form.documentName}
                    onChange={f("documentName")}
                  />
                  <FormError msg={errs.documentName} />
                </div>
                <div>
                  <FormLabel>Sub-Law / Act Reference</FormLabel>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Motor Vehicles Act 1988"
                    value={form.subLaw}
                    onChange={f("subLaw")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <FormLabel required>Registration Number</FormLabel>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none"
                        placeholder="e.g. RTO-2024-001"
                        value={form.regNumber}
                        onChange={f("regNumber")}
                      />
                      <FormError msg={errs.regNumber} />
                   </div>
                   <div>
                      <FormLabel required>Category</FormLabel>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none appearance-none"
                        value={form.category}
                        onChange={f("category")}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <FormError msg={errs.category} />
                   </div>
                </div>
              </div>
            </SectionCard>

            {/* Authority & Date */}
            <div className="space-y-6">
              <SectionCard icon={Landmark} title="Issuing Authority">
                 <div className="space-y-5">
                    <div>
                      <FormLabel required>Authority / Issuing Body</FormLabel>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none appearance-none"
                        value={form.authority}
                        onChange={f("authority")}
                      >
                        <option value="">Select Authority</option>
                        {AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <FormError msg={errs.authority} />
                    </div>
                    <div>
                      <FormLabel>Authority Contact / Reference</FormLabel>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none"
                        placeholder="Phone, email or reference ID"
                        value={form.authorityContact}
                        onChange={f("authorityContact")}
                      />
                    </div>
                 </div>
              </SectionCard>

              <SectionCard icon={Calendar} title="Record Date">
                 <div>
                    <FormLabel required>Date Recorded</FormLabel>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none"
                      value={form.issueDate}
                      onChange={f("issueDate")}
                    />
                    <FormError msg={errs.issueDate} />
                 </div>
              </SectionCard>
            </div>

            {/* Status & Applicability */}
            <div className="lg:col-span-2">
               <SectionCard icon={ShieldCheck} title="Status & Applicability">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div>
                        <FormLabel required>Compliance Status</FormLabel>
                        <div className="flex flex-col gap-2 mt-4">
                           {STATUS_OPTIONS.map(s => (
                             <button
                               key={s.val}
                               type="button"
                               onClick={() => setForm(v => ({ ...v, status: s.val }))}
                               className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                                 form.status === s.val 
                                 ? `bg-${s.color}-50 border-${s.color}-200 text-${s.color}-600 ring-2 ring-${s.color}-500/10` 
                                 : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                               }`}
                             >
                               <span className="text-[11px] font-900 uppercase tracking-widest">{s.val}</span>
                               {form.status === s.val && <CheckCircle2 size={16} />}
                             </button>
                           ))}
                        </div>
                        <FormError msg={errs.status} />
                     </div>

                     <div>
                        <FormLabel required>Applies To</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                           {APPLIES_TO_OPTIONS.map(opt => (
                             <button
                               key={opt}
                               type="button"
                               onClick={() => toggleAppliesTo(opt)}
                               className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[10px] font-900 uppercase tracking-tight transition-all ${
                                 form.appliesTo.includes(opt)
                                 ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                 : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                               }`}
                             >
                               <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                 form.appliesTo.includes(opt) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'
                               }`}>
                                 {form.appliesTo.includes(opt) && <X size={10} className="text-white" />}
                               </div>
                               {opt}
                             </button>
                           ))}
                        </div>
                        <FormError msg={errs.appliesTo} />
                     </div>
                  </div>
               </SectionCard>
            </div>

            {/* Upload Zone */}
            <SectionCard icon={UploadCloud} title="Document Upload">
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`group border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                   form.documentFile 
                   ? 'bg-indigo-50 border-indigo-300' 
                   : errs.documentFile ? 'bg-rose-50 border-rose-200' : 'bg-slate-50/50 border-slate-200 hover:bg-indigo-50/30 hover:border-indigo-200'
                 }`}
               >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all ${
                    form.documentFile ? 'bg-white text-indigo-600 shadow-lg' : 'bg-white text-slate-300 shadow-sm'
                  }`}>
                    <UploadCloud size={28} className={form.documentFile ? "animate-bounce" : ""} />
                  </div>
                  <h4 className="text-[11px] font-900 text-slate-700 uppercase tracking-widest">
                    {form.documentFile ? form.documentFile.name : "Click to Upload Document"}
                  </h4>
                  <p className="text-[9px] font-700 text-slate-400 uppercase mt-1 tracking-widest">PDF / JPG / PNG — Max 10 MB</p>
                  <FormError msg={errs.documentFile} />
               </div>
            </SectionCard>

            {/* Consent & Remarks */}
            <SectionCard icon={ClipboardCheck} title="Consent & Remarks">
               <div className="space-y-6">
                  <div 
                    onClick={() => setForm(v => ({...v, consent: !v.consent}))}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      form.consent ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50/30 border-slate-100'
                    }`}
                  >
                     <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                       form.consent ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200 bg-white shadow-inner'
                     }`}>
                        {form.consent && <X size={12} className="text-white" />}
                     </div>
                     <div>
                        <p className="text-[10px] font-900 text-slate-700 uppercase tracking-tight mb-1">Compliance Certification *</p>
                        <p className="text-[10px] font-700 text-slate-400 leading-relaxed italic">
                          "I confirm that all submitted compliance information is accurate, valid, and up-to-date as per the applicable laws and regulations."
                        </p>
                     </div>
                  </div>
                  <FormError msg={errs.consent} />

                  <div>
                    <FormLabel>Remarks / Notes</FormLabel>
                    <textarea 
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none h-32 resize-none"
                      placeholder="Any additional notes or context about this compliance record…"
                      value={form.remarks}
                      onChange={f("remarks")}
                    />
                  </div>
               </div>
            </SectionCard>

          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-8 bg-white border border-slate-100 rounded-[32px] shadow-lg">
             <button 
               type="button"
               onClick={() => navigate("/compliance")}
               className="w-full sm:w-auto px-8 py-4 text-[11px] font-900 text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
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
                    <Clock size={16} className="animate-spin" />
                    Storing...
                 </div>
               ) : (
                 <>
                   <PlusCircle size={18} />
                   Add Record
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
