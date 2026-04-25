// src/Pages/ComplianceLaws/Compliance.tsx
import React, { useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gavel, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  PlayCircle, 
  Trash2, 
  X, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Scale,
  ChevronDown,
  Eye,
  Edit
} from "lucide-react";

import {
  type ComplianceRecord,
  INITIAL_COMPLIANCE,
  complianceStatusVariant,
  categoryVariant,
} from "./complianceData";


// --- Components ---
const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
  const variants: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    slate: "bg-slate-50 text-slate-500 border-slate-100",
  };
  const styleClass = variants[variant] ?? variants.slate;
  return (
    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-900 uppercase tracking-wider ${styleClass}`}>
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════
   VIEW DETAIL OVERLAY
   ═══════════════════════════════════════════════════ */
const ViewOverlay = ({ record, onClose }: { record: ComplianceRecord; onClose: () => void }) => (
  <div 
    className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
    onClick={onClose}
  >
    <div 
      className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-slate-100"
      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <div className="p-6 bg-primary text-white flex justify-between items-center">
        <h2 className="text-lg font-bold uppercase">{record.documentName}</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Authority</p><p className="text-sm font-bold">{record.authority}</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Status</p><Badge variant={complianceStatusVariant(record.status)}>{record.status}</Badge></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Law Ref</p><p className="text-sm font-bold">{record.subLaw}</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</p><p className="text-sm font-bold">{record.issueDate}</p></div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Remarks</p>
          <p className="text-xs text-slate-600 italic">"{record.remarks || "No remarks."}"</p>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   DELETE CONFIRMATION OVERLAY
   ═══════════════════════════════════════════════════ */
const DeleteOverlay = ({ record, onConfirm, onCancel }: { record: ComplianceRecord; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={onCancel}>
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
      <h3 className="font-bold text-slate-800 uppercase mb-2">Delete Record?</h3>
      <p className="text-xs text-slate-500 mb-6">Permanently delete {record.documentName}?</p>
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs" onClick={onCancel}>Cancel</button>
        <button className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold text-xs" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   COMPLIANCE PAGE
   ═══════════════════════════════════════════════════ */
export const CompliancePage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ComplianceRecord[]>(INITIAL_COMPLIANCE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewRecord, setViewRecord] = useState<ComplianceRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<ComplianceRecord | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || r.documentName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = () => {
    if (!deleteRecord) return;
    setRecords((prev) => prev.filter((r) => r.id !== deleteRecord.id));
    setDeleteRecord(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight uppercase">
            <Gavel size={24} /> Compliance & Laws
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manage legal rules and fleet compliance.</p>
        </div>
        <button className="w-full md:w-auto justify-center btn btn-primary flex items-center gap-2" onClick={() => navigate("/compliance/create")}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="space-y-4">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 underline">Total Rules</p>
            <p className="text-xl font-bold">{records.length}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative min-w-[150px]">
            <select className="w-full pl-3 pr-8 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold appearance-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Compliant">Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Document & Category</th>
                <th className="px-6 py-4">Authority</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="font-900 text-slate-800 uppercase tracking-tight line-clamp-1">{record.documentName}</p>
                        <div className="mt-1 flex items-center gap-2">
                           <p className="text-[9px] text-slate-400 font-bold uppercase">#{record.id}</p>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <Badge variant={categoryVariant(record.category)}>{record.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{record.authority}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{record.subLaw}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase">
                       <Clock size={12} strokeWidth={3} />
                       {record.issueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-1">
                       <button 
                         onClick={() => setViewRecord(record)} 
                         title="View Details"
                         className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                       >
                         <Eye size={16} />
                       </button>
                       <button 
                         onClick={() => navigate(`/compliance/edit/${record.id}`)} 
                         title="Edit"
                         className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                       >
                         <Edit size={16} />
                       </button>
                       {record.videoUrl && (
                         <button 
                           onClick={() => setVideoUrl(record.videoUrl!)} 
                           title="Watch Video"
                           className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all animate-pulse hover:animate-none"
                         >
                           <PlayCircle size={18} strokeWidth={2.5} />
                         </button>
                       )}
                       <button 
                         onClick={() => setDeleteRecord(record)} 
                         title="Delete"
                         className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {viewRecord && <ViewOverlay record={viewRecord} onClose={() => setViewRecord(null)} />}
      {deleteRecord && <DeleteOverlay record={deleteRecord} onConfirm={handleDelete} onCancel={() => setDeleteRecord(null)} />}
      {videoUrl && (
        <div className="fixed inset-0 z-[1100] bg-black/90 flex items-center justify-center p-6" onClick={() => setVideoUrl(null)}>
           <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden relative">
             <button className="absolute top-4 right-4 z-20 text-white" onClick={() => setVideoUrl(null)}><X size={24} /></button>
             <iframe 
               src={videoUrl.includes("youtu.be/") 
                 ? `https://www.youtube.com/embed/${videoUrl.split("youtu.be/")[1].split("?")[0]}` 
                 : videoUrl.replace("watch?v=", "embed/")} 
               className="w-full h-full" 
               allowFullScreen 
             />
           </div>
        </div>
      )}
    </div>
  );
};
