import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Gavel, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  PlusCircle, 
  ArrowLeft, 
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  StickyNote,
  Save
} from "lucide-react";
import { INITIAL_COMPLIANCE } from "./complianceData";

/* ── Types ─────────────────────────────────── */
interface Form {
  documentName: string;
  description: string;
  category: string;
  issueDate: string;
  status: string;
  appliesTo: string[];
  videoUrl: string;
}

type Errs = Partial<Record<keyof Form, string>>;

const CATEGORIES = [
  "License", "Insurance", "Safety", "Environmental", "Tax & Finance", 
  "Labour", "Vehicle Certification", "Penalty", "Office Policies", "Other"
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

  const [form, setForm] = useState<Form>({
    documentName: "", description: "", category: "",
    issueDate: "", status: "Compliant",
    appliesTo: [], videoUrl: "",
  });

  const [errs, setErrs] = useState<Errs>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const record = INITIAL_COMPLIANCE.find((r) => r.id === id);
      if (record) {
        setForm({
          documentName: record.documentName || "",
          description: record.remarks || "",
          category: record.category || "",
          issueDate: record.issueDate || "",
          status: record.status || "Compliant",
          appliesTo: record.appliesTo || [],
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

  const validate = (): boolean => {
    const e: Errs = {};
    if (!form.documentName.trim()) e.documentName = "Title is required";
    if (!form.category) e.category = "Select a category";
    if (!form.issueDate) e.issueDate = "Date is required";
    if (!form.status) e.status = "Select status";
    if (form.appliesTo.length === 0) e.appliesTo = "Select at least one option";
    
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
           <h2 className="text-2xl font-900 text-slate-800 uppercase tracking-tight mb-2">Record Saved</h2>
           <p className="text-xs font-700 text-slate-400 uppercase tracking-widest mb-8 leading-relaxed px-4">
             Your compliance record for <span className="text-emerald-600 font-900">{form.documentName}</span> has been securely stored.
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
                {isEdit ? "Edit Compliance Record" : "Add Compliance Record"}
              </h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-1">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span>Compliance & Laws</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark">{isEdit ? "Edit Record" : "Add Record"}</span>
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
            
            {/* Title & Description */}
            <SectionCard icon={FileText} title="Record Details">
              <div className="space-y-5">
                <div>
                  <FormLabel required>Title</FormLabel>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Office Fire Safety Policy"
                    value={form.documentName}
                    onChange={f("documentName")}
                  />
                  <FormError msg={errs.documentName} />
                </div>
                <div>
                  <FormLabel>Description</FormLabel>
                  <textarea 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none h-28 resize-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="Describe the compliance rule, regulation, or policy..."
                    value={form.description}
                    onChange={f("description")}
                  />
                </div>
                <div>
                   <FormLabel required>Category</FormLabel>
                   <select 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none appearance-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                     value={form.category}
                     onChange={f("category")}
                   >
                     <option value="">Select Category</option>
                     {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <FormError msg={errs.category} />
                </div>
              </div>
            </SectionCard>

            {/* Date & YouTube Link */}
            <div className="space-y-6">
              <SectionCard icon={Calendar} title="Date & Timeline">
                 <div>
                    <FormLabel required>Date Recorded</FormLabel>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      value={form.issueDate}
                      onChange={f("issueDate")}
                    />
                    <FormError msg={errs.issueDate} />
                 </div>
              </SectionCard>

              <SectionCard icon={Video} title="Reference Video">
                 <div>
                    <FormLabel>YouTube Link</FormLabel>
                    <input 
                      type="url"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="https://youtube.com/watch?v=..."
                      value={form.videoUrl}
                      onChange={f("videoUrl")}
                    />
                    {form.videoUrl && (
                      <div className="mt-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center gap-2">
                        <Video size={14} className="text-rose-600 shrink-0" />
                        <span className="text-[10px] font-700 text-rose-600 truncate">{form.videoUrl}</span>
                      </div>
                    )}
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
                    Saving...
                 </div>
               ) : (
                 <>
                   {isEdit ? <Save size={18} /> : <PlusCircle size={18} />}
                   {isEdit ? "Update Record" : "Add Record"}
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
