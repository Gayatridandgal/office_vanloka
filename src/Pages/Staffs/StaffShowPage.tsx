// src/components/staff/StaffShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import {
    FaUser,
    FaIdCard,
    FaBriefcase,
    FaUniversity,
    FaPhoneAlt,
    FaEdit,
    FaUsers,
    FaShieldAlt,
    FaFileAlt,
    FaMapMarkerAlt,
    FaCheckCircle
} from "react-icons/fa";
import { MdOutlineFamilyRestroom } from "react-icons/md";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { Loader } from "../../Components/UI/Loader";
import { DataBlock } from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import type { Employee } from "./Staff.types";
import { DUMMY_USER_IMAGE } from "../../Utils/Toolkit";
import EmptyState from "../../Components/UI/EmptyState";

// --- Helpers ---
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
                const response = await tenantApi.get<{ success: boolean; data: Employee }>(`/employees/${id}`);
                if (response.data.success) {
                    setStaff(response.data.data);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load staff member.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchStaff();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;

    if (error || !staff) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4 text-center">
                <EmptyState title="Staff Member Not Found" description={error || "Staff data unavailable"} />
                <button onClick={() => navigate("/staff")} className="text-indigo-600 font-bold hover:underline uppercase text-xs">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-hidden">

            {/* 1. Sticky Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <PageHeaderBack title="Back" buttonLink="/staff" />
            </div>

            {/* 2. Hero Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">

                        {/* Avatar */}
                        <div className="relative shrink-0 group">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={staff.photo ? `${tenantAsset}${staff.photo}` : DUMMY_USER_IMAGE}
                                    alt={staff.first_name}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = DUMMY_USER_IMAGE; }}
                                />
                            </div>
                            {/* Status Indicator */}
                            <div className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white shadow-sm ${staff.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}>
                                {staff.status === 'active' && <FaCheckCircle />}
                            </div>
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 text-center sm:text-left pt-0 sm:pt-2 min-w-0">
                            <h1 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight truncate">
                                {staff.first_name} <span className="text-indigo-600">{staff.last_name}</span>
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <FaIdCard size={12} /> EMP: {staff.employee_id || "-"}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400">{staff.designation || "Staff"}</span>
                            </p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
                                {/* Status Badge */}
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border ${staff.status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {staff.status || "-"}
                                </span>

                                {/* Employment Type Badge */}
                                <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-blue-100">
                                    <FaBriefcase size={10} /> {staff.employment_type || "-"}
                                </span>

                                {/* Roles Badge */}
                                {staff.roles && staff.roles.length > 0 && (
                                    <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-purple-100">
                                        <FaShieldAlt size={10} /> {staff.roles.length} Role{staff.roles.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => navigate(`/staff/edit/${id}`)}
                            className="text-blue-700 text-xs font-bold uppercase rounded-lg p-2 hover:bg-blue-100 transition-colors flex-shrink-0"
                        >
                            <FaEdit size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-blue-50 flex gap-4 sm:gap-10 p-2 sm:p-3 border border-gray-200 rounded-md overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'details' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('dependants')}
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'dependants' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Dependants & Emergency
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Documents
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto max-h-[70vh] overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-8 mt-5">

                    {/* TAB 1: DETAILS */}
                    {activeTab === 'details' && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

                                {/* Personal Information */}
                                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-green-50">
                                        <FaUser className="text-blue-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Personal Information</h3>
                                    </div>

                                    <div className="p-4 pt-0 space-y-4">
                                        <div className="grid grid-cols-2 gap-0">
                                            <DataBlock label="First Name" value={staff.first_name} />
                                            <DataBlock label="Last Name" value={staff.last_name} />
                                            <DataBlock label="Gender" value={staff.gender} />
                                            <DataBlock label="Date of Birth" value={formatDate(staff.date_of_birth)} />
                                            <DataBlock label="Marital Status" value={staff.marital_status} />
                                            <DataBlock label="Joining Date" value={formatDate(staff.joining_date)} />
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                                <FaPhoneAlt className="text-green-500 text-base mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1">Mobile</p>
                                                    <p className="text-sm font-semibold text-slate-800">{staff.phone || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-indigo-50">
                                        <FaBriefcase className="text-indigo-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Professional Info</h3>
                                    </div>

                                    <div className="p-4 pt-0 space-y-4">
                                        <div className="grid grid-cols-1 gap-0">
                                            <DataBlock label="Employee ID" value={staff.employee_id} />
                                            <DataBlock label="Designation" value={staff.designation} />
                                            <DataBlock label="Employment Type" value={staff.employment_type} />
                                            <DataBlock label="Official Email" value={staff.email} />
                                        </div>

                                        {/* Roles */}
                                        {staff.roles && staff.roles.length > 0 && (
                                            <div className="pt-2 border-t border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                                                    <FaShieldAlt className="text-purple-500" /> Assigned Roles
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {staff.roles.map((role, index) => (
                                                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase border border-purple-200">
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-amber-50">
                                        <FaUniversity className="text-amber-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Bank Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 p-4 pt-0">
                                        <DataBlock label="Bank Name" value={staff.bank_name} />
                                        <DataBlock label="Account Holder" value={staff.account_holder_name} />
                                        <DataBlock label="Account Number" value={staff.account_number} />
                                        <DataBlock label="IFSC Code" value={staff.ifsc_code} />
                                    </div>
                                </div>
                            </div>

                            {/* Address Section - Full Width */}
                            <div className="mt-6 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 p-3 rounded-t-lg bg-purple-50">
                                    <FaMapMarkerAlt className="text-purple-500 text-base sm:text-lg" />
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Address Details</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 pt-0">
                                    <DataBlock label="Address Line 1" value={staff.address_line_1} />
                                    <DataBlock label="Address Line 2" value={staff.address_line_2} />
                                    <DataBlock label="Landmark" value={staff.landmark} />
                                    <DataBlock label="City" value={staff.city} />
                                    <DataBlock label="District" value={staff.district} />
                                    <DataBlock label="State" value={staff.state} />
                                    <DataBlock label="PIN Code" value={staff.pin_code} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DEPENDANTS & EMERGENCY */}
                    {activeTab === 'dependants' && (
                        <div className="animate-fadeIn space-y-6">

                            {/* Dependants */}
                            {staff.dependants && staff.dependants.length > 0 ? (
                                <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-pink-50">
                                        <FaUsers className="text-pink-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Dependants</h3>
                                    </div>

                                    <div className="p-4 pt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {staff.dependants.map((dependant, index) => (
                                                <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <MdOutlineFamilyRestroom className="text-purple-500" size={20} />
                                                        <span className="text-xs font-bold text-purple-700 uppercase">Dependant {index + 1}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Name</p>
                                                            <p className="text-sm font-semibold text-slate-800">{dependant.fullname || "-"}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Relation</p>
                                                                <p className="text-xs font-semibold text-slate-800">{dependant.relation || "-"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                                                                <p className="text-xs font-semibold text-slate-800">{dependant.age || "-"}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                                                            <p className="text-xs font-semibold text-slate-800">{dependant.phone || "-"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-pink-50">
                                        <FaUsers className="text-pink-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Dependants</h3>
                                    </div>
                                    <div className="p-8 text-center">
                                        <p className="text-xs font-bold text-slate-300 uppercase">No Dependants Listed</p>
                                    </div>
                                </div>
                            )}

                            {/* Emergency Contacts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Primary Contact */}
                                <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-blue-50">
                                        <FaPhoneAlt className="text-blue-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Primary Emergency Contact</h3>
                                    </div>

                                    <div className="grid grid-cols-2 p-4 pt-0">
                                        <DataBlock label="Name" value={staff.primary_person_name} />
                                        <DataBlock label="Email" value={staff.primary_person_email} />
                                        <DataBlock label="Phone 1" value={staff.primary_person_phone_1} />
                                        <DataBlock label="Phone 2" value={staff.primary_person_phone_2} />
                                    </div>
                                </div>

                                {/* Secondary Contact */}
                                <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-purple-50">
                                        <FaPhoneAlt className="text-purple-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Secondary Emergency Contact</h3>
                                    </div>

                                    <div className="grid grid-cols-2 p-4 pt-0">
                                        <DataBlock label="Name" value={staff.secondary_person_name} />
                                        <DataBlock label="Email" value={staff.secondary_person_email} />
                                        <DataBlock label="Phone 1" value={staff.secondary_person_phone_1} />
                                        <DataBlock label="Phone 2" value={staff.secondary_person_phone_2} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DOCUMENTS */}
                    {activeTab === 'documents' && (
                        <div className="animate-fadeIn">
                            <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 p-3 rounded-t-lg bg-amber-50">
                                    <FaFileAlt className="text-amber-500 text-base sm:text-lg" />
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Uploaded Documents</h3>
                                </div>

                                <div className="p-4 pt-0">
                                    {(staff.aadhaar_card || staff.pan_card || staff.bank_proof) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {staff.aadhaar_card && <DocumentItem label="Aadhaar Card" path={staff.aadhaar_card} />}
                                            {staff.pan_card && <DocumentItem label="PAN Card" path={staff.pan_card} />}
                                            {staff.bank_proof && <DocumentItem label="Bank Proof" path={staff.bank_proof} />}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-xs font-bold text-slate-300 uppercase">No Documents Attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StaffShowPage;
