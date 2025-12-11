// src/components/drivers/DriverShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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
    FaEdit
} from "react-icons/fa";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { Loader } from "../../Components/UI/Loader";
import DetailItem, { InfoCard } from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import type { Driver } from "../Drivers/Driver.types";


// --- Helpers ---

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const StatusBadge = ({ status }: { status?: string }) => {
    const styles = {
        active: "bg-green-50 text-green-700 border-green-200 ring-green-100",
        inactive: "bg-red-50 text-red-700 border-red-200 ring-red-100",
        suspended: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
        default: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100"
    };

    const key = status?.toLowerCase() as keyof typeof styles;
    const className = styles[key] || styles.default;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${className}`}>
            {status || "-"}
        </span>
    );
};

const EmploymentBadge = ({ type }: { type?: string }) => {
    return (
        <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase border border-blue-100">
            <FaBriefcase size={10} /> {type || "-"}
        </span>
    );
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

    // State
    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchDriver = async () => {
            try {
                setLoading(true);
                const response = await tenantApi.get<{ success: boolean; data: Driver }>(`/drivers/${id}`);
                if (response.data.success) {
                    setDriver(response.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDriver();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;
    if (!driver) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase">Driver not found</div>;

    return (
        <div className="min-h-screen bg-white pb-12">

            
                <PageHeaderBack title="Back" buttonLink="/drivers" />
           

            {/* 2. Hero Section */}
            <div className="bg-white ">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                    {driver.profile_photo ? (
                                        <img src={`${tenantAsset}${driver.profile_photo}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUser className="text-slate-300" size={40} />
                                    )}
                                </div>
                                <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white shadow-sm ${driver.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}>
                                    {driver.status === 'active' && <FaCheckCircle />}
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-lg font-extrabold text-slate-800 uppercase tracking-wide">
                                    {driver.first_name} <span className="text-indigo-600">{driver.last_name}</span>
                                </h1>
                                <p className="text-sm font-bold text-slate-500 uppercase mt-1 flex items-center justify-center md:justify-start gap-2">
                                    <FaIdCard size={12} /> EMP : {driver.employee_id || "-"}
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-400">{driver.gender}</span>
                                </p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                    <StatusBadge status={driver.status} />
                                    <EmploymentBadge type={driver.employment_type} />

                                    {driver.vehicle && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase border border-amber-100">
                                            Vehicle : {driver.vehicle}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Edit Button Action */}
                        <div className="flex-shrink-0">
                            <Link
                                to={`/drivers/edit/${id}`}
                                className="flex items-center gap-2 p-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold uppercase hover:bg-indigo-100 transition-colors border border-indigo-200"
                            >
                                <FaEdit />Edit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Content Area */}
            <div className="max-w-6xl overflow-y-auto max-h-[73vh] bg-white border border-gray-200 mt-4 rounded-lg shadow-md mx-auto px-6 py-8">
                <div className="space-y-8 animate-fadeIn">

                    {/* Row 1: 3-Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Card 1: Personal Info */}
                        <InfoCard title="Personal Information" icon={<FaUser />}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Date of birth" value={formatDate(driver.date_of_birth)} />
                                    <DetailItem label="Blood Group" value={driver.blood_group} />
                                    <DetailItem label="Marital Status" value={driver.marital_status} />
                                    <DetailItem label="Dependents" value={String(driver.number_of_dependents)} />
                                </div>

                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <FaPhoneAlt className="text-green-400 mt-1" size={12} />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p>
                                            <p className="text-sm font-bold text-slate-800">{driver.mobile_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FaEnvelope className="text-blue-400 mt-1" size={12} />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                            <p className="text-sm font-bold text-slate-800 truncate w-48">{driver.email || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-red-400 uppercase mb-1 flex items-center gap-1"><FaMapMarkerAlt /> Address</p>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase">
                                        {driver.address_line_1}, {driver.address_line_2}, {driver.city}, {driver.state}, {driver.pin_code}
                                    </p>
                                </div>
                            </div>
                        </InfoCard>

                        {/* Card 2: Professional Info */}
                        <InfoCard title="Professional & Safety" icon={<FaBriefcase />}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Experience" value={`${driver.driving_experience || 0} Years`} />
                                    <DetailItem label="Assigned Vehicle" value={driver.vehicle} />
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Safety Training</span>
                                        <YesNoIndicator value={driver.safety_training_completion} />
                                    </div>
                                    {driver.safety_training_completion === 'YES' && (
                                        <div className="text-right"><span className="text-[10px] text-slate-400">Date: {formatDate(driver.safety_training_completion_date)}</span></div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Physicaly Fit</span>
                                        <YesNoIndicator value={driver.medical_fitness} />
                                    </div>
                                    {driver.medical_fitness === 'YES' && (
                                        <div className="text-right"><span className="text-[10px] text-slate-400">Exp: {formatDate(driver.medical_fitness_exp_date)}</span></div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Police Verification</span>
                                        <YesNoIndicator value={driver.police_verification} />
                                    </div>
                                </div>
                            </div>
                        </InfoCard>

                        {/* Card 3: Emergency & Bank */}
                        <InfoCard title="Emergency & Bank" icon={<FaUserShield />}>
                            <div className="space-y-4">

                                {/* Emergency Contacts */}
                                <div className="space-y-2 uppercase">
                                    <div className="p-2 bg-blue-50 rounded border border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Primary Emergency Contact</p>
                                        <p className="text-sm font-bold text-blue-900">{driver.primary_person_name || "-"}</p>
                                        <p className="text-xs text-blue-700">{driver.primary_person_phone_1}</p>
                                    </div>
                                    <div className="p-2 uppercase bg-pink-50 rounded border border-pink-100">
                                        <p className="text-[10px] font-bold text-pink-400 uppercase mb-1">Secondary Contact</p>
                                        <p className="text-sm font-bold text-pink-700">{driver.secondary_person_name || "-"}</p>
                                        <p className="text-xs text-pink-500">{driver.secondary_person_phone_1}</p>
                                    </div>
                                </div>

                                {/* Bank Info */}
                                <div className="pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCreditCard className="text-purple-400" />
                                        <span className="text-xs font-bold text-slate-600 uppercase">Bank Details</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem label="Account Holder" value={driver.account_holder_name} />
                                        <DetailItem label="Bank" value={driver.bank_name} />
                                        <DetailItem label="IFSC" value={driver.ifsc_code} />
                                        <div className="">
                                            <DetailItem label="Account No" value={driver.account_number} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </InfoCard>
                    </div>

                    {/* Row 2: Licenses (Full Width of Grid) */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaIdCard className="text-purple-500" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Insurance</h3>
                        </div>

                        {driver.license_insurance && driver.license_insurance.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {driver.license_insurance.map((item, index) => (
                                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-300 flex flex-col justify-between shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase rounded border border-blue-400">
                                                {item.type?.replace(/_/g, " ") || "ID"}
                                            </span>
                                            <FaIdCard className="text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-purple-950 uppercase font-mono mb-1">Document Number : {item.number || "-"}</p>
                                            <div className="flex justify-between uppercase text-[10px] text-blue-900">
                                                <span>Iss: {formatDate(item.issue_date)}</span>
                                                <span>Exp: {formatDate(item.exp_date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-400 text-xs uppercase font-bold">No License Records Found</div>
                        )}
                    </div>

                    {/* Row 3: Documents & Remarks */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className=" bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaFileAlt className="text-amber-400" />
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Documents</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {driver.driving_license && <DocumentItem label="Driving License" path={driver.driving_license} />}
                                {driver.aadhaar_card && <DocumentItem label="Aadhaar Card" path={driver.aadhaar_card} />}
                                {driver.pan_card && <DocumentItem label="PAN Card" path={driver.pan_card} />}
                                {driver.police_verification_doc && <DocumentItem label="Police Verification" path={driver.police_verification_doc} />}
                                {driver.medical_fitness_certificate && <DocumentItem label="Medical Cert" path={driver.medical_fitness_certificate} />}
                                {driver.address_proof_doc && <DocumentItem label="Address Proof" path={driver.address_proof_doc} />}
                                {driver.training_certificate_doc && <DocumentItem label="Training Cert" path={driver.training_certificate_doc} />}
                            </div>
                            {!driver.driving_license && !driver.aadhaar_card && (
                                <div className="text-center py-8">
                                    <p className="text-xs font-bold text-slate-300 uppercase">No Documents Attached</p>
                                </div>
                            )}
                        </div>


                    </div>

                </div>
            </div>
        </div>
    );
};

export default DriverShowPage;