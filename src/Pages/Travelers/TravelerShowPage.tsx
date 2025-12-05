// src/components/travelers/TravelerShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import {
  FaUserEdit,
  FaIdCard,
  FaBluetoothB,
  FaVenusMars,
  FaBirthdayCake,
  FaTint,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBus,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineWorkHistory, MdEventSeat, MdNotes } from "react-icons/md";

// Components
import { CirclularLoader } from "../../Components/UI/CircularLoader";
import EmptyState from "../../Components/UI/EmptyState";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";

// Services & Utils
import tenantApi, { centralAsset} from "../../Services/ApiService";
import type { Traveller } from "./Traveler.types";
import type { Booking } from "../Bookings/Booking.types";
import { DataBlock } from "../../Components/UI/DetailItem";

// --- Configuration ---
const DUMMY_IMAGE_PATH = "/user.jpeg";

// --- Helper Functions ---
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "active": return "bg-green-50 text-green-700 border-green-200 ring-green-100";
    case "approved": return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100";
    case "completed": return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-100";
    case "cancelled": return "bg-red-50 text-red-700 border-red-200 ring-red-100";
    default: return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100";
  }
};

// --- Sub-Components ---
const BookingCard = ({ booking }: { booking: Booking }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group flex flex-col h-full">
    <div className="flex justify-between items-start mb-3">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusStyles(booking.status)}`}>
        status - {booking.status}
      </span>
      <span className="text-sm font-mono text-slate-400">ID: {booking.id}</span>
    </div>

    <div className="mb-2 flex-grow">
      <div className="flex items-start gap-2 mb-1">
        <FaMapMarkerAlt className="text-red-500 shrink-0" size={14} />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 uppercase truncate">
            {booking.pickup_location_name}, {booking.pickup_location_city}, {booking.pickup_location_state}, {booking.pickup_location_pin_code}
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
      <div className="overflow-hidden">
        <span className="text-slate-400 font-bold uppercase block mb-0.5 text-sm">Vehicle</span>
        <span className="font-semibold text-slate-700 flex items-center gap-1 truncate" title={booking.assigned_vehicle || "N/A"}>
          <FaBus className="text-indigo-400 shrink-0" /> {booking.assigned_vehicle || "-"}
        </span>
      </div>

    </div>

    {booking.approver && (
      <div className="flex items-center gap-2 text-[10px] text-green-700 bg-green-50 px-2 py-1.5 rounded border border-green-100 mt-auto">
        <FaCheckCircle className="shrink-0" />
        <span className="truncate uppercase">Approved by - <span className="font-bold">{booking.approver.name || "Admin"}</span></span>
      </div>
    )}
  </div>
);

const TravelerShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [traveller, setTraveler] = useState<Traveller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'bookings'>('details');

  useEffect(() => {
    const fetchTraveler = async () => {
      try {
        setLoading(true);
        const response = await tenantApi.get<{ success: boolean; data: Traveller }>(`/travellers/${id}`);
        if (response.data.success) {
          setTraveler(response.data.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTraveler();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><CirclularLoader /></div>;

  if (error || !traveller) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4 text-center">
        <EmptyState title="Profile Not Found" description={error || "Traveller data unavailable"} />
        <button onClick={() => navigate("/travellers")} className="text-indigo-600 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const activeBookings = traveller.bookings?.filter(b => ["active", "approved", "pending"].includes(b.status.toLowerCase())) || [];
  const pastBookings = traveller.bookings?.filter(b => ["completed", "cancelled", "rejected"].includes(b.status.toLowerCase())) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden">

      {/* 1. Sticky Back Navigation */}
      <div className="bg-white border-b border-slate-100 px-4 py-1 sticky top-0 z-20 shadow-sm">
        <div className="">
          <PageHeaderBack title="Back" buttonLink="/travellers" />
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-white border border-slate-200 shadow-xl">
                <img
                  src={`${centralAsset}${traveller.profile_photo}`} // Using dummy as primary fallback as requested
                  alt={traveller.first_name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = DUMMY_IMAGE_PATH; }}
                />
              </div>
            </div>

            {/* Info Block */}
            <div className="flex-1 text-center md:text-left pt-2 min-w-0">
              <h1 className="text-sm md:text-sm font-extrabold text-slate-800 uppercase tracking-tight truncate">
                <span className="text-indigo-600">{traveller.first_name} {traveller.last_name}</span>
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mt-3">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm md:text-sm font-bold uppercase border border-slate-200 flex items-center gap-2 whitespace-nowrap">
                  {traveller.relationship || "Traveller"}
                </span>
                <span className="text-sm md:text-sm font-bold text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 whitespace-nowrap">
                  UID: {traveller.traveller_uid || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Scrollable on mobile) */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex gap-6 md:gap-8 mt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'details' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Traveller Details
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Bookings <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">{traveller.bookings?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            

            <div className="p-6 md:p-8 overflow-y-auto xl:max-h-[60vh] lg:max-h-[60vh] md:max-h-[40vh] max-h-[30vh]">
              {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                <DataBlock label="First Name" value={traveller.first_name} />
                <DataBlock label="Last Name" value={traveller.last_name}  />
                <DataBlock label="Aadhaar Number" value={traveller.aadhaar_number} icon={<FaIdCard className="text-amber-600" />} />
                <DataBlock label="Gender" value={traveller.gender} icon={<FaVenusMars className="text-blue-600" />} />
                <DataBlock label="Date of Birth" value={formatDate(traveller.date_of_birth)} icon={<FaBirthdayCake className="text-pink-600" />} />
                <DataBlock label="Blood Group" value={traveller.blood_group} icon={<FaTint className="text-red-600" />} />
                <DataBlock label="Beacon ID" value={traveller.beacon_id} icon={<FaBluetoothB className="text-green-600" />} />
                <DataBlock label="Profile Created" value={formatDate(traveller.created_at)} icon={<FaCalendarAlt className="text-yellow-400" />} />
                <DataBlock label="Last Updated" value={formatDate(traveller.updated_at)} icon={<FaUserEdit className="text-purple-600" />} />
              </div>

              {/* Remarks Section */}
              {traveller.remarks_notes && (
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <MdNotes /> Additional Notes
                  </h4>
                  <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-sm text-slate-700 leading-relaxed overflow-x-auto">
                    {traveller.remarks_notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-10 bg-white p-6 rounded-lg  shadow-md border border-gray-200 overflow-y-auto xl:max-h-[60vh] lg:max-h-[60vh] md:max-h-[40vh] max-h-[35vh]">

            {/* Active Trips */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0">
                  <MdEventSeat size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase">active / approved</h3>
              </div>

              {activeBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-200 border-dashed rounded-xl">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <MdEventSeat className="text-slate-300 text-sm" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No active bookings found.</p>
                </div>
              )}
            </section>

            {/* History */}
            <section>
              <div className="flex items-center gap-3 mb-6 pt-6 border-t border-slate-200">
                <div className="p-2 bg-purple-100 text-purple-500 rounded-lg shrink-0">
                  <MdOutlineWorkHistory size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase">Past Bookings</h3>
              </div>

              {pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <div className="flex flex-col bg-gray-100 rounded-lg p-3 items-center justify-center">
                  <p className="text-[10px] uppercase text-red-400 font-medium">No booking history available</p>
                </div>
              )}
            </section>
          </div>
        )}

      </div>
    </div>
  );
};

export default TravelerShowPage;