// src/Pages/Staffs/StaffShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// Icons (Lucide)
import {
  User,
  Fingerprint,
  Briefcase,
  Building2,
  Phone,
  Edit3,
  Users,
  ShieldCheck,
  FileText,
  MapPin,
  CheckCircle2,
  Calendar,
  Mail,
  ArrowLeft,
  Share2,
  Heart,
  CreditCard,
  AlertCircle
} from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import type { Employee } from "./Staff.types";
import { DUMMY_USER_IMAGE, formatDate } from "../../Utils/Toolkit";

// --- Sub-components for Cleanliness ---
const InfoItem = ({ label, value, icon: Icon }: { label: string, value: string | React.ReactNode, icon?: any }) => (
  <div className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-2 text-[10px] font-800 text-slate-400 uppercase tracking-widest">
      {Icon && <Icon size={12} className="text-slate-300" />}
      {label}
    </div>
    <div className="text-sm font-700 text-slate-700">{value || "—"}</div>
  </div>
);

const DetailCard = ({ title, icon: Icon, children, variant = "default" }: { title: string, icon: any, children: React.ReactNode, variant?: "default" | "indigo" | "amber" | "emerald" | "rose" }) => {
  const styles = {
    default: "border-slate-100",
    indigo: "border-indigo-100 bg-indigo-50/10",
    amber: "border-amber-100 bg-amber-50/10",
    emerald: "border-emerald-100 bg-emerald-50/10",
    rose: "border-rose-100 bg-rose-50/10"
  };

  const iconStyles = {
    default: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600"
  };

  return (
    <div className={`white-card p-0 border ${styles[variant]} overflow-hidden`}>
      <div className="px-6 py-4 border-b border-inherit flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconStyles[variant]}`}>
          <Icon size={18} />
        </div>
        <h3 className="text-xs font-900 text-slate-800 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

// --- Main Component ---
const StaffShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [staff, setStaff] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'dependants' | 'documents'>('details');

  // Fetch Data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        console.log("Fetching staff with ID:", id);
        const response = await tenantApi.get(`/employees/${id}`);
        
        // Handle nested or direct response
        const data = response.data.data?.data || response.data.data || response.data;
        
        if (data && (data.id || data.employee_id)) {
          setStaff(data);
          setError(null);
        } else {
          setError("Staff member not found in record.");
        }
      } catch (err: any) {
        console.error("Error fetching staff details:", err);
        setError(err.response?.data?.message || err.message || "Failed to load staff member.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStaff();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-4">
        <Loader />
        <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest animate-pulse">Loading Employee File...</p>
      </div>
    </div>
  );

  if (error || !staff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-900 text-slate-800 mb-2 uppercase tracking-tight">Staff File Not Found</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-8 font-500 leading-relaxed">
          {error || "The employee record you are looking for might have been removed or the ID is incorrectly requested."}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          <button onClick={() => window.location.reload()} className="btn btn-primary w-full flex items-center justify-center gap-2">
            <Share2 size={16} /> Retry Fetch
          </button>
          <button onClick={() => navigate("/staff")} className="text-indigo-600 font-900 text-[11px] uppercase tracking-widest hover:underline py-2">
            Return to Staff List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6 animate-fadeIn">
      {/* Header / Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/staff")}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 transition-all hover:-translate-x-1 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-900 text-slate-800 tracking-tight uppercase">Employee File</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-900 uppercase tracking-widest border ${
                staff.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {staff.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-800 text-muted uppercase tracking-widest">
              <span>Admin</span>
              <span className="text-slate-300">/</span>
              <span>Staff</span>
              <span className="text-slate-300">/</span>
              <span className="text-primary">{staff.first_name} {staff.last_name}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button className="flex-1 sm:flex-none justify-center btn btn-outline border-slate-200 text-slate-600 flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <Share2 size={16} />
            <span className="md:inline font-800 text-[11px] uppercase tracking-wider">Share</span>
          </button>
          <Link to={`/staff/edit/${id}`} className="flex-1 sm:flex-none justify-center btn btn-primary flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <Edit3 size={16} />
            <span className="md:inline font-800 text-[11px] uppercase tracking-wider">Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="white-card p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative z-10">
              <img 
                src={staff.photo ? `${tenantAsset}${staff.photo}` : DUMMY_USER_IMAGE} 
                alt={staff.first_name} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = DUMMY_USER_IMAGE; }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white z-20">
              <ShieldCheck size={20} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4 justify-center md:justify-start">
              <h2 className="text-3xl font-900 text-slate-800 tracking-tighter uppercase leading-none">
                {staff.first_name} <span className="text-primary">{staff.last_name}</span>
              </h2>
              <div className="flex gap-2 justify-center">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-900 uppercase tracking-widest border border-indigo-100">
                  {staff.designation || "Executive"}
                </span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-900 uppercase tracking-widest border border-amber-100">
                  {staff.employment_type || "Full-Time"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Fingerprint size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-800 text-slate-400 uppercase tracking-widest">Employee ID</div>
                  <div className="text-sm font-800 text-slate-700 tabular-nums">{staff.employee_id}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-800 text-slate-400 uppercase tracking-widest">Email Address</div>
                  <div className="text-sm font-800 text-slate-700">{staff.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-800 text-slate-400 uppercase tracking-widest">Phone Number</div>
                  <div className="text-sm font-800 text-slate-700">{staff.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-800 text-slate-400 uppercase tracking-widest">Joined On</div>
                  <div className="text-sm font-800 text-slate-700">{formatDate(staff.joining_date)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-100 px-2 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 py-4 px-1 text-[11px] font-900 uppercase tracking-widest transition-all relative ${
            activeTab === 'details' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User size={16} /> Personal Profile
          {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('dependants')}
          className={`flex items-center gap-2 py-4 px-1 text-[11px] font-900 uppercase tracking-widest transition-all relative ${
            activeTab === 'dependants' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Heart size={16} /> Dependants & Family
          {activeTab === 'dependants' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 py-4 px-1 text-[11px] font-900 uppercase tracking-widest transition-all relative ${
            activeTab === 'documents' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={16} /> Digital Vault
          {activeTab === 'documents' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {activeTab === 'details' && (
          <>
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard title="Personal Information" icon={User} variant="indigo">
                  <div className="grid grid-cols-2 gap-2">
                    <InfoItem label="First Name" value={staff.first_name} />
                    <InfoItem label="Last Name" value={staff.last_name} />
                    <InfoItem label="Gender" value={staff.gender} />
                    <InfoItem label="Marital Status" value={staff.marital_status} />
                    <InfoItem label="Date of Birth" value={formatDate(staff.date_of_birth)} />
                    <InfoItem label="Joining Date" value={formatDate(staff.joining_date)} />
                  </div>
                </DetailCard>

                <DetailCard title="Banking Vault" icon={CreditCard} variant="amber">
                  <div className="space-y-1">
                    <InfoItem label="Bank Name" value={staff.bank_name} />
                    <InfoItem label="Account Holder" value={staff.account_holder_name} />
                    <InfoItem label="Account Number" value={staff.account_number} />
                    <InfoItem label="IFSC Code" value={staff.ifsc_code} />
                  </div>
                </DetailCard>
              </div>

              <DetailCard title="Residential Address" icon={MapPin} variant="emerald">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoItem label="Address Line 1" value={staff.address_line_1} />
                  <InfoItem label="Address Line 2" value={staff.address_line_2} />
                  <InfoItem label="Landmark" value={staff.landmark} />
                  <InfoItem label="City" value={staff.city} />
                  <InfoItem label="District" value={staff.district} />
                  <InfoItem label="State" value={staff.state} />
                  <InfoItem label="PIN Code" value={staff.pin_code} />
                </div>
              </DetailCard>

              {staff.remarks && (
                <div className="white-card p-6 border border-slate-100 bg-slate-50/30">
                   <div className="flex items-center gap-2 text-[10px] font-800 text-slate-400 uppercase tracking-widest mb-3">
                     <FileText size={12} /> External Remarks
                   </div>
                   <p className="text-sm text-slate-600 italic leading-relaxed">"{staff.remarks}"</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <DetailCard title="Assigned Roles" icon={ShieldCheck} variant="indigo">
                <div className="flex flex-wrap gap-2">
                  {staff.user?.roles && staff.user.roles.length > 0 ? (
                    staff.user.roles.map((role, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-900 uppercase tracking-widest border border-indigo-100">
                        {role.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-800 text-slate-400 uppercase tracking-widest p-2">No roles assigned</span>
                  )}
                </div>
              </DetailCard>

              <DetailCard title="Emergency Connectivity" icon={Phone} variant="rose">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                    <div className="text-[9px] font-900 text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                      Primary Contact
                    </div>
                    <div className="text-sm font-800 text-slate-700 mb-1">{staff.primary_person_name}</div>
                    <div className="flex gap-4">
                      <div className="text-[11px] font-600 text-slate-500 flex items-center gap-1">
                         <Phone size={10} /> {staff.primary_person_phone_1}
                      </div>
                      <div className="text-[11px] font-600 text-slate-500 flex items-center gap-1">
                         <Mail size={10} /> {staff.primary_person_email}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[9px] font-900 text-slate-400 uppercase tracking-widest mb-2">Secondary Contact</div>
                    <div className="text-sm font-800 text-slate-700 mb-1">{staff.secondary_person_name || "Not Specified"}</div>
                    <div className="text-[11px] font-600 text-slate-500 uppercase tracking-tight">{staff.secondary_person_phone_1}</div>
                  </div>
                </div>
              </DetailCard>
            </div>
          </>
        )}

        {activeTab === 'dependants' && (
          <div className="lg:col-span-12">
            {staff.dependants && staff.dependants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {staff.dependants.map((dep, idx) => (
                   <div key={idx} className="white-card p-6 border border-slate-100 hover:border-primary/20 transition-all group overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
                      <div className="flex items-center gap-4 mb-6 relative">
                        <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center font-900 text-lg">
                          {dep.fullname.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-900 text-slate-800 uppercase tracking-tight">{dep.fullname}</div>
                          <div className="text-[10px] font-900 text-primary uppercase tracking-widest">{dep.relation}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 relative">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-[9px] font-800 text-slate-400 uppercase tracking-widest mb-1">Age</div>
                          <div className="text-xs font-800 text-slate-700 tracking-wider uppercase tabular-nums">{dep.age} Years</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-[9px] font-800 text-slate-400 uppercase tracking-widest mb-1">Phone</div>
                          <div className="text-xs font-800 text-slate-700 tracking-wider tabular-nums">{dep.phone || "—"}</div>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                  <Heart size={32} />
                </div>
                <h3 className="text-sm font-900 text-slate-400 uppercase tracking-widest">No Dependant Files Registered</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { label: "Aadhaar Card", path: staff.aadhaar_card, icon: Fingerprint, color: "indigo" },
                 { label: "PAN Card", path: staff.pan_card, icon: FileText, color: "emerald" },
                 { label: "Bank Proof", path: staff.bank_proof, icon: Building2, color: "amber" }
               ].map((doc, idx) => (
                 <div key={idx} className="white-card p-6 border border-slate-100 flex flex-col gap-6 items-center text-center">
                    <div className={`w-16 h-16 rounded-[24px] bg-${doc.color}-50 text-${doc.color}-600 flex items-center justify-center`}>
                      <doc.icon size={32} />
                    </div>
                    <div>
                      <h4 className="text-sm font-900 text-slate-800 uppercase tracking-tight mb-2">{doc.label}</h4>
                      <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest">Official Document Identification</p>
                    </div>
                    {doc.path ? (
                      <a 
                        href={`${tenantAsset}${doc.path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-outline w-full py-3 text-[11px] font-900 uppercase tracking-widest"
                      >
                        View Document
                      </a>
                    ) : (
                      <div className="w-full py-3 bg-slate-50 text-slate-400 text-[10px] font-900 uppercase rounded-xl border border-dashed border-slate-200 tracking-widest">
                        Not Uploaded
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffShowPage;
