// src/components/drivers/DriverShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import {
    FaUser,
    FaMapMarkerAlt,
    FaBriefcase,
    FaFileAlt,
    FaIdCard,
    FaCreditCard,
    FaUserShield,
    FaCheckCircle,
    FaTimesCircle,
    FaPhoneAlt,
    FaEnvelope,
    FaEdit,
    FaCar
} from "react-icons/fa";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { Loader } from "../../Components/UI/Loader";
import { DataBlock } from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import type { Driver } from "../Drivers/Driver.types";
import { DUMMY_USER_IMAGE } from "../../Utils/Toolkit";

// --- Helpers ---
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const YesNoIndicator = ({ value, icon: Icon }: { value?: string, icon?: any }) => {
    const isYes = value === "YES";
    return (
        <div className={`flex items-center gap-2 p-2 rounded border ${isYes ? 'bg-green-50 border-green-100 text-green-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
            {Icon && <Icon size={14} />}
            <span className="text-xs font-bold uppercase">{isYes ? "Verified" : "Not Verified"}</span>
            {isYes ? <FaCheckCircle size={15} /> : <FaTimesCircle size={15} />}
        </div>
    );
};

// --- Main Component ---
const DriverShowPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State
    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'professional' | 'documents'>('details');

    // Fetch Data
    useEffect(() => {
        const fetchDriver = async () => {
            try {
                setLoading(true);
                const response = await tenantApi.get<{ success: boolean; data: Driver }>(`/drivers/${id}`);
                if (response.data.success) {
                    setDriver(response.data.data);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load driver.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDriver();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;

    if (error || !driver) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4 text-center">
                <div className="text-slate-500 font-bold uppercase">Driver not found</div>
                <button onClick={() => navigate("/drivers")} className="text-indigo-600 font-bold hover:underline uppercase text-xs">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-hidden">

            {/* 1. Sticky Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm">
                <PageHeaderBack title="Back" buttonLink="/drivers" />
            </div>

            {/* 2. Hero Section */}
            <div className="bg-white ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">

                        {/* Avatar */}
                        <div className="relative shrink-0 group">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={driver.profile_photo ? `${tenantAsset}${driver.profile_photo}` : DUMMY_USER_IMAGE}
                                    alt={driver.first_name}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = DUMMY_USER_IMAGE; }}
                                />
                            </div>
                            {/* Status Indicator */}
                            <div className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white shadow-sm ${driver.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}>
                                {driver.status === 'active' && <FaCheckCircle />}
                            </div>
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 text-center sm:text-left pt-0 sm:pt-2 min-w-0">
                            <h1 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight truncate">
                                {driver.first_name} <span className="text-indigo-600">{driver.last_name}</span>
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <FaIdCard size={12} /> EMP: {driver.employee_id || "-"}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400">{driver.gender}</span>
                            </p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
                                {/* Status Badge */}
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border ${
                                    driver.status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                    driver.status?.toLowerCase() === 'inactive' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {driver.status || "-"}
                                </span>

                                {/* Employment Type Badge */}
                                <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-blue-100">
                                    <FaBriefcase size={10} /> {driver.employment_type || "-"}
                                </span>

                                {/* Vehicle Badge */}
                                {driver.vehicle && (
                                    <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-amber-100">
                                        <FaCar size={10} /> {driver.vehicle}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => navigate(`/drivers/edit/${id}`)}
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
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide  border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'details' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('professional')}
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide  border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'professional' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Professional
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide  border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Documents
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-8 mt-6">

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
                                            <DataBlock label="Date of Birth" value={formatDate(driver.date_of_birth)} />
                                            <DataBlock label="Blood Group" value={driver.blood_group} />
                                            <DataBlock label="Marital Status" value={driver.marital_status} />
                                            <DataBlock label="Dependents" value={String(driver.number_of_dependents || 0)} />
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                                <FaPhoneAlt className="text-green-500 text-base mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1">Mobile</p>
                                                    <p className="text-sm font-semibold text-slate-800">{driver.mobile_number}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <FaEnvelope className="text-blue-500 text-base mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1">Email</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{driver.email || "-"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                                                <FaMapMarkerAlt className="text-red-400" /> Address
                                            </p>
                                            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                                                {driver.address_line_1}, {driver.address_line_2}, {driver.city}, {driver.state} - {driver.pin_code}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-amber-50">
                                        <FaUserShield className="text-amber-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Emergency Contacts</h3>
                                    </div>

                                    <div className="p-4 pt-0 space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-2">Primary Contact</p>
                                            <p className="text-sm font-bold text-blue-900">{driver.primary_person_name || "-"}</p>
                                            <p className="text-xs text-blue-700 mt-1">{driver.primary_person_phone_1}</p>
                                        </div>

                                        <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                                            <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wide mb-2">Secondary Contact</p>
                                            <p className="text-sm font-bold text-pink-900">{driver.secondary_person_name || "-"}</p>
                                            <p className="text-xs text-pink-700 mt-1">{driver.secondary_person_phone_1}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="flex items-center gap-2 p-3 rounded-t-lg bg-purple-50">
                                        <FaCreditCard className="text-purple-500 text-base sm:text-lg" />
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Bank Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 p-4 pt-0">
                                        <DataBlock label="Account Holder" value={driver.account_holder_name} />
                                        <DataBlock label="Bank Name" value={driver.bank_name} />
                                        <DataBlock label="IFSC Code" value={driver.ifsc_code} />
                                        <DataBlock label="Account Number" value={driver.account_number} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PROFESSIONAL */}
                    {activeTab === 'professional' && (
                        <div className="animate-fadeIn space-y-6">
                            
                            {/* Professional Info Card */}
                           <div className="grid grid-cols-2 gap-4">
                                 <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 p-3 rounded-t-lg bg-indigo-50">
                                    <FaBriefcase className="text-indigo-500 text-base sm:text-lg" />
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Professional Information</h3>
                                </div>

                                <div className="p-4 pt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-0 mb-4">
                                        <DataBlock label="Experience" value={`${driver.driving_experience || 0} Years`} />
                                        <DataBlock label="Assigned Vehicle" value={driver.vehicle} />
                                        <DataBlock label="Employment Type" value={driver.employment_type} />
                                        <DataBlock label="Employee ID" value={driver.employee_id} />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                        {/* Safety Training */}
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Safety Training</p>
                                            <YesNoIndicator value={driver.safety_training_completion} />
                                            {driver.safety_training_completion === 'YES' && (
                                                <p className="text-[10px] text-slate-400 mt-2">Date: {formatDate(driver.safety_training_completion_date)}</p>
                                            )}
                                        </div>

                                        {/* Medical Fitness */}
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Medical Fitness</p>
                                            <YesNoIndicator value={driver.medical_fitness} />
                                            {driver.medical_fitness === 'YES' && (
                                                <p className="text-[10px] text-slate-400 mt-2">Exp: {formatDate(driver.medical_fitness_exp_date)}</p>
                                            )}
                                        </div>

                                        {/* Police Verification */}
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Police Verification</p>
                                            <YesNoIndicator value={driver.police_verification} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Licenses & Insurance */}
                            <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="flex items-center gap-2 p-3 rounded-t-lg bg-purple-50">
                                    <FaIdCard className="text-purple-500 text-base sm:text-lg" />
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Licenses & Insurance</h3>
                                </div>

                                <div className="p-4 pt-4">
                                    {driver.license_insurance && driver.license_insurance.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                            {driver.license_insurance.map((item, index) => (
                                                <div key={index} className="p-4 bg-white rounded-lg border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-200">
                                                            {item.type?.replace(/_/g, " ") || "ID"}
                                                        </span>
                                                        <FaIdCard className="text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 mb-2">No : {item.number || "-"}</p>
                                                        <div className="flex justify-between text-[10px] text-slate-500">
                                                            <span>Issued : {formatDate(item.issue_date)}</span>
                                                            <span>Exp : {formatDate(item.exp_date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-xs uppercase font-bold">No License Records Found</div>
                                    )}
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

                                <div className="p-4 pt-4">
                                    {(driver.driving_license || driver.aadhaar_card || driver.pan_card) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {driver.driving_license && <DocumentItem label="Driving License" path={driver.driving_license} />}
                                            {driver.aadhaar_card && <DocumentItem label="Aadhaar Card" path={driver.aadhaar_card} />}
                                            {driver.pan_card && <DocumentItem label="PAN Card" path={driver.pan_card} />}
                                            {driver.police_verification_doc && <DocumentItem label="Police Verification" path={driver.police_verification_doc} />}
                                            {driver.medical_fitness_certificate && <DocumentItem label="Medical Certificate" path={driver.medical_fitness_certificate} />}
                                            {driver.address_proof_doc && <DocumentItem label="Address Proof" path={driver.address_proof_doc} />}
                                            {driver.training_certificate_doc && <DocumentItem label="Training Certificate" path={driver.training_certificate_doc} />}
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

export default DriverShowPage;
