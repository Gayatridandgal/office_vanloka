// src/components/vehicles/VehicleShowPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  FaIndustry
} from "react-icons/fa";
import { MdGpsFixed,MdInfoOutline } from "react-icons/md";
import { IoSpeedometer } from "react-icons/io5";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { Loader } from "../../Components/UI/Loader";
import DetailItem, { InfoCard } from "../../Components/UI/DetailItem"; // Assuming InfoCard is exported or structure used below
import DocumentItem from "../../Components/UI/DocumentItem";
import tenantApi from "../../Services/ApiService";

// Types
import type { Vehicle } from "./Vehicle.types";

// --- Helpers ---

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Badges
const StatusBadge = ({ status }: { status?: string }) => {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-200 ring-green-100",
    inactive: "bg-red-50 text-red-700 border-red-200 ring-red-100",
    under_maintenance: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
    default: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100"
  };

  const key = status?.toLowerCase() as keyof typeof styles;
  const className = styles[key] || styles.default;
  const label = status?.replace(/_/g, " ") || "N/A";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${className}`}>
      {label}
    </span>
  );
};

const VehicleTypeBadge = ({ type }: { type?: string | null }) => {
  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase border border-indigo-100">
      <FaBus size={10} /> {type || "N/A"}
    </span>
  );
};

const YesNoIndicator = ({ value }: { value?: string | null }) => {
  const isYes = value === "YES";
  return (
    <span className={`text-xs font-bold uppercase flex items-center gap-1 ${isYes ? "text-green-600" : "text-slate-400"}`}>
      {isYes ? <FaCheckCircle /> : <FaTimesCircle />} {value || "N/A"}
    </span>
  );
};

// --- Main Component ---

const VehicleShowPage = () => {
  const { id } = useParams<{ id: string }>();

  // State
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;
  if (error || !vehicle) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase">Vehicle not found</div>;

  return (
    <div className="min-h-screen bg-white pb-12">

      {/* 1. Sticky Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-1 sticky top-0 z-20 shadow-sm">
        <PageHeaderBack title="Back" buttonLink="/vehicles" />
      </div>

      {/* 2. Hero Section */}
      <div className="bg-gray-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* Avatar / Icon */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-white shadow-lg flex items-center justify-center text-blue-500">
                <FaTruck size={36} />
              </div>
              <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white shadow-sm ${vehicle.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}>
                {vehicle.status === 'active' && <FaCheckCircle />}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                Vehicle <span className="text-blue-600">{vehicle.vehicle_number}</span>
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase mt-1 flex items-center justify-center md:justify-start gap-2">
                <FaIndustry size={12} /> {vehicle.manufacturer}
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">{vehicle.vehicle_model}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <StatusBadge status={vehicle.status} />
                <VehicleTypeBadge type={vehicle.vehicle_type} />

                <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase border border-amber-100">
                  <FaGasPump size={10} /> {vehicle.fuel_type}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold uppercase border border-slate-200">
                  <IoSpeedometer size={12} /> {vehicle.kilometers_driven} KM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Content Grid */}
      <div className="max-w-6xl bg-white overflow-y-auto max-h-[75vh] border border-gray-200 shadow-sm rounded-lg mt-4 mx-auto px-6 py-8 space-y-8">

        {/* Row 1: 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: Specs & Registration */}
          <InfoCard title="Specs & Registration" icon={<FaClipboardCheck />}>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase">RC Number</p>
                <p className="text-sm font-bold text-blue-900 uppercase">{vehicle.rc_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Mfg Year" value={vehicle.manufacturing_year} />
                <DetailItem label="Seats" value={vehicle.seating_capacity} />
                <DetailItem label="Color" value={vehicle.vehicle_color} />
                <DetailItem label="Route" value={vehicle.route} />
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                <DetailItem label="RC Issued" value={formatDate(vehicle.rc_isued_date)} />
                <DetailItem label="RC Expiry" value={formatDate(vehicle.rc_expiry_date)} />
              </div>
            </div>
          </InfoCard>

          {/* Card 2: Operations & Maintenance */}
          <InfoCard title="Operations & GPS" icon={<FaCog />}>
            <div className="space-y-4">
              {/* GPS Section */}
              {vehicle.gps_device ? (
                <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <div className="p-1.5 bg-white text-purple-600 rounded-full shadow-sm"><MdGpsFixed size={12} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-purple-700 uppercase">GPS Device ID</p>
                    <p className="text-sm font-bold text-slate-800">{vehicle.gps_device}</p>
                    <p className="text-[10px] text-slate-500">Installed: {formatDate(vehicle.gps_installation_date)}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">No GPS Device Assigned</p>
                </div>
              )}

              {/* Maintenance Dates */}
              <div className="pt-2 space-y-3">
                <DetailItem label="Last Service" value={formatDate(vehicle.last_service_date)} />
                <DetailItem label="Next Service Due" value={formatDate(vehicle.next_service_due_date)} />
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Tyre Change Due" value={formatDate(vehicle.tyre_replacement_due_date)} />
                  <DetailItem label="Battery Due" value={formatDate(vehicle.battery_replacement_due_date)} />
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Card 3: Compliance & Legal */}
          <InfoCard title="Compliance & Legal" icon={<FaShieldAlt />}>
            <div className="space-y-3">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Permit Type</span>
                  <span className="text-[10px] font-bold text-slate-800 uppercase text-right">{vehicle.permit_type}</span>
                </div>
                <DetailItem label="Permit No" value={vehicle.permit_number} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500">Exp: {formatDate(vehicle.permit_expiry_date)}</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <DetailItem label="Insurance Provider" value={vehicle.insurance_provider_name} />
                <DetailItem label="Policy No" value={vehicle.insurance_policy_number} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500">Exp: {formatDate(vehicle.insurance_expiry_date)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Fitness Exp</p>
                  <p className="text-xs font-bold text-slate-700">{formatDate(vehicle.fitness_expiry_date)}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">PUC Exp</p>
                  <p className="text-xs font-bold text-slate-700">{formatDate(vehicle.pollution_expiry_date)}</p>
                </div>
              </div>
            </div>
          </InfoCard>

        </div>

        {/* Row 2: Ownership & Safety (Half width each if needed, or structured differently) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 4: Ownership */}
          <InfoCard title="Ownership Details" icon={<FaUserTie />}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <FaUserTie size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase">Ownership Type</p>
                <p className="text-lg font-extrabold text-slate-800 uppercase">{vehicle.ownership_type}</p>
              </div>
            </div>

            {vehicle.ownership_type?.toLowerCase() === 'contract' && (
              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-6">
                <DetailItem label="Vendor Name" value={vehicle.vendor_name} />
                <DetailItem label="Organization" value={vehicle.vendor_organization_name} />
                <DetailItem label="Contact" value={vehicle.vendor_contact_number} />
                <DetailItem label="PAN" value={vehicle.vendor_pan_number} />
              </div>
            )}
          </InfoCard>

          {/* Card 5: Safety Features */}
          <InfoCard title="Safety Checklist" icon={<MdInfoOutline />}>
            <div className="grid grid-cols-2 gap-4 p-2">
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fire Extinguisher</span>
                <YesNoIndicator value={vehicle.fire_extinguisher} />
              </div>
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">First Aid Kit</span>
                <YesNoIndicator value={vehicle.first_aid_kit} />
              </div>
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CCTV</span>
                <YesNoIndicator value={vehicle.cctv_installed} />
              </div>
              <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Panic Button</span>
                <YesNoIndicator value={vehicle.panic_button_installed} />
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Row 3: Documents & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Documents - Takes 2 cols */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <FaFileAlt className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Attached Documents</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {vehicle.insurance_doc && <DocumentItem label="Insurance Doc" path={vehicle.insurance_doc} />}
              {vehicle.rc_book_doc && <DocumentItem label="RC Book" path={vehicle.rc_book_doc} />}
              {vehicle.puc_doc && <DocumentItem label="PUC Doc" path={vehicle.puc_doc} />}
              {vehicle.fitness_certificate && <DocumentItem label="Fitness Cert" path={vehicle.fitness_certificate} />}
              {vehicle.permit_copy && <DocumentItem label="Permit Copy" path={vehicle.permit_copy} />}
              {vehicle.gps_installation_proof && <DocumentItem label="GPS Proof" path={vehicle.gps_installation_proof} />}
              {vehicle.saftey_certificate && <DocumentItem label="Safety Cert" path={vehicle.saftey_certificate} />}

              {/* Vendor Docs */}
              {vehicle.vendor_contract_proof && <DocumentItem label="Contract Agreement" path={vehicle.vendor_contract_proof} />}
              {vehicle.vendor_pan && <DocumentItem label="Vendor PAN" path={vehicle.vendor_pan} />}
            </div>

            {/* Empty State for Docs */}
            {!vehicle.insurance_doc && !vehicle.rc_book_doc && !vehicle.permit_copy && (
              <div className="text-center py-8">
                <p className="text-xs font-bold text-slate-300 uppercase">No Documents Attached</p>
              </div>
            )}
          </div>

          
        </div>

      </div>
    </div>
  );
};

export default VehicleShowPage;