// src/components/vehicles/VehicleShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaShieldAlt,
  FaFileAlt,
  FaCog,
  FaClipboardCheck,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaGasPump,
  FaBus,
  FaIndustry,
  FaEdit
} from "react-icons/fa";
import { MdInfoOutline } from "react-icons/md";
import { IoSpeedometer } from "react-icons/io5";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { Loader } from "../../Components/UI/Loader";
import { DataBlock } from "../../Components/UI/DetailItem";
import DocumentItem from "../../Components/UI/DocumentItem";
import tenantApi from "../../Services/ApiService";
import EmptyState from "../../Components/UI/EmptyState";

// Types
import type { Vehicle } from "./Vehicle.types";
import { formatDate } from "../../Utils/Toolkit";

const YesNoIndicator = ({ value }: { value?: string | null }) => {
  const isYes = value === "YES";
  return (
    <div className={`flex items-center gap-2 p-2 rounded border ${isYes ? 'bg-green-50 border-green-100 text-green-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
      <span className="text-xs font-bold uppercase">{isYes ? "Yes" : "No"}</span>
      {isYes ? <FaCheckCircle size={15} /> : <FaTimesCircle size={15} />}
    </div>
  );
};

// --- Main Component ---
const VehicleShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'compliance' | 'documents'>('details');

  // Fetch Data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await tenantApi.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`);
        if (response.data.success) {
          setVehicle(response.data.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch vehicle");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader /></div>;

  if (error || !vehicle) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4 p-4 text-center">
        <EmptyState title="Vehicle Not Found" description={error || "Vehicle data unavailable"} />
        <button onClick={() => navigate("/vehicles")} className="text-indigo-600 font-bold hover:underline uppercase text-xs">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">

      {/* 1. Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <PageHeaderBack title="Back" buttonLink="/vehicles" />
      </div>

      {/* 2. Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">

            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-blue-50 border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center">
                <FaTruck className="text-blue-500" size={40} />
              </div>
              {/* Status Indicator */}
              <div className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white shadow-sm ${vehicle.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}>
                {vehicle.status === 'active' && <FaCheckCircle />}
              </div>
            </div>

            {/* Info Block */}
            <div className="flex-1 text-center sm:text-left pt-0 sm:pt-2 min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 uppercase tracking-tight truncate">
                Vehicle <span className="text-indigo-600">{vehicle.vehicle_number}</span>
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <FaIndustry size={12} /> {vehicle.manufacturer}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">{vehicle.vehicle_model}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
                {/* Status Badge */}
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border ${vehicle.status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                  vehicle.status?.toLowerCase() === 'inactive' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  {vehicle.status?.replace(/_/g, " ") || "-"}
                </span>

                {/* Vehicle Type Badge */}
                <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-indigo-100">
                  <FaBus size={10} /> {vehicle.vehicle_type || "-"}
                </span>

                {/* Fuel Type Badge */}
                <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-amber-100">
                  <FaGasPump size={10} /> {vehicle.fuel_type}
                </span>

                {/* Kilometers Badge */}
                <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-slate-200">
                  <IoSpeedometer size={12} /> {vehicle.kilometers_driven} KM
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate(`/vehicles/edit/${id}`)}
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
              onClick={() => setActiveTab('compliance')}
              className={`text-xs sm:text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'compliance' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Compliance & Safety
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-8 mt-5">

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

                {/* Specs & Registration */}
                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 rounded-t-lg bg-green-50">
                    <FaClipboardCheck className="text-blue-500 text-base sm:text-lg" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Specs & Registration</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-0">
                    <DataBlock label="Rc Number" value={vehicle.rc_number} />
                    <DataBlock label="Mfg Year" value={vehicle.manufacturing_year} />
                    <DataBlock label="Seats" value={String(vehicle.seating_capacity)} />
                    <DataBlock label="Color" value={vehicle.vehicle_color} />
                    <DataBlock label="Route" value={vehicle.route} />
                    <DataBlock label="RC Issued" value={formatDate(vehicle.rc_isued_date)} />
                    <DataBlock label="RC Expiry" value={formatDate(vehicle.rc_expiry_date)} />
                  </div>

                </div>

                {/* Operations & GPS */}
                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 rounded-t-lg bg-purple-50">
                    <FaCog className="text-purple-500 text-base sm:text-lg" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Operations & GPS</h3>
                  </div>

                  <div className="p-4 pt-0 space-y-4">
                    {/* Maintenance */}
                    <div className="grid grid-cols-2 space-y-0">
                      <DataBlock label="Gps" value={vehicle.gps_device} />
                      <DataBlock label="Last Service" value={formatDate(vehicle.last_service_date)} />
                      <DataBlock label="Next Service" value={formatDate(vehicle.next_service_due_date)} />
                      <DataBlock label="Tyre Change Due" value={formatDate(vehicle.tyre_replacement_due_date)} />
                      <DataBlock label="Battery Due" value={formatDate(vehicle.battery_replacement_due_date)} />
                    </div>
                  </div>
                </div>

                {/* Ownership */}
                <div className="space-y-4 border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 rounded-t-lg bg-indigo-50">
                    <FaUserTie className="text-indigo-500 text-base sm:text-lg" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Ownership Details</h3>
                  </div>

                  <div className="p-4 pt-0 space-y-4">
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Ownership Type</p>
                      <p className="text-base font-bold text-slate-800 uppercase">{vehicle.ownership_type}</p>
                    </div>

                    {vehicle.ownership_type?.toLowerCase() === 'contract' && (
                      <div className="grid grid-cols-2 gap-0 pt-2 border-t border-slate-100">
                        <DataBlock label="Vendor Name" value={vehicle.vendor_name} />
                        <DataBlock label="Organization" value={vehicle.vendor_organization_name} />
                        <DataBlock label="Contact" value={vehicle.vendor_contact_number} />
                        <DataBlock label="PAN" value={vehicle.vendor_pan_number} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE & SAFETY */}
          {activeTab === 'compliance' && (
            <div className="animate-fadeIn space-y-6">

              {/* Compliance Documents */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Insurance */}
                <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 rounded-t-lg bg-green-50">
                    <FaShieldAlt className="text-green-500 text-base sm:text-lg" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Insurance</h3>
                  </div>

                  <div className="grid grid-cols-2 p-4 pt-0">
                    <DataBlock label="Provider" value={vehicle.insurance_provider_name} />
                    <DataBlock label="Policy No" value={vehicle.insurance_policy_number} />
                    <DataBlock label="Expiry Date" value={formatDate(vehicle.insurance_expiry_date)} />
                  </div>
                </div>

                {/* Permit */}
                <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 rounded-t-lg bg-amber-50">
                    <FaClipboardCheck className="text-amber-500 text-base sm:text-lg" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Permit</h3>
                  </div>

                  <div className="grid grid-cols-2 p-4 pt-0">
                    <DataBlock label="Permit Type" value={vehicle.permit_type} />
                    <DataBlock label="Permit No" value={vehicle.permit_number} />
                    <DataBlock label="Expiry Date" value={formatDate(vehicle.permit_expiry_date)} />
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 rounded-t-lg bg-blue-50">
                  <MdInfoOutline className="text-blue-500 text-base sm:text-lg" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Certificates & Expiry</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 pt-0">
                  <DataBlock label="Fitness Expiry" value={formatDate(vehicle.fitness_expiry_date)} />
                  <DataBlock label="PUC Expiry" value={formatDate(vehicle.pollution_expiry_date)} />
                </div>
              </div>

              {/* Safety Features */}
              <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 rounded-t-lg bg-red-50">
                  <MdInfoOutline className="text-red-500 text-base sm:text-lg" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">Safety Checklist</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 pt-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Fire Extinguisher</p>
                    <YesNoIndicator value={vehicle.fire_extinguisher} />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">First Aid Kit</p>
                    <YesNoIndicator value={vehicle.first_aid_kit} />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">CCTV Installed</p>
                    <YesNoIndicator value={vehicle.cctv_installed} />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Panic Button</p>
                    <YesNoIndicator value={vehicle.panic_button_installed} />
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
                  {(vehicle.insurance_doc || vehicle.rc_book_doc || vehicle.permit_copy) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicle.insurance_doc && <DocumentItem label="Insurance Doc" path={vehicle.insurance_doc} />}
                      {vehicle.rc_book_doc && <DocumentItem label="RC Book" path={vehicle.rc_book_doc} />}
                      {vehicle.puc_doc && <DocumentItem label="PUC Doc" path={vehicle.puc_doc} />}
                      {vehicle.fitness_certificate && <DocumentItem label="Fitness Certificate" path={vehicle.fitness_certificate} />}
                      {vehicle.permit_copy && <DocumentItem label="Permit Copy" path={vehicle.permit_copy} />}
                      {vehicle.gps_installation_proof && <DocumentItem label="GPS Installation Proof" path={vehicle.gps_installation_proof} />}
                      {vehicle.saftey_certificate && <DocumentItem label="Safety Certificate" path={vehicle.saftey_certificate} />}
                      {vehicle.vendor_contract_proof && <DocumentItem label="Vendor Contract" path={vehicle.vendor_contract_proof} />}
                      {vehicle.vendor_pan && <DocumentItem label="Vendor PAN" path={vehicle.vendor_pan} />}
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

export default VehicleShowPage;
