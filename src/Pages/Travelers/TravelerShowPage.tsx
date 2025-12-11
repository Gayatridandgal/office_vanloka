// src/components/travelers/TravelerShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import {
  FaBluetoothB,
  FaMapMarkerAlt,
  FaBus,
  FaCheckCircle,
  FaUser,
  FaHistory
} from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";

// Components
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import DetailItem, { InfoCard } from "../../Components/UI/DetailItem"; // Reusing the InfoCard pattern
import tenantApi, { centralAsset } from "../../Services/ApiService";

// Types
import type { Traveller } from "./Traveler.types";
import type { Booking } from "../Bookings/Booking.types";

// --- Configuration ---
const DUMMY_IMAGE_PATH = "/user.jpeg";

// --- Helper Functions ---
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "active": return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100";
    case "approved": return "bg-green-50 text-green-700 border-green-200 ring-green-100";
    case "completed": return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-100";
    case "cancelled": return "bg-red-50 text-red-700 border-red-200 ring-red-100";
    case "pending": return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100";
    default: return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100";
  }
};

// --- Sub-Components ---
const BookingCard = ({ booking }: { booking: Booking }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group flex flex-col h-full">
    <div className="flex justify-between items-start mb-3">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusStyles(booking.status)}`}>
        {booking.status}
      </span>
      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">ID: {booking.id}</span>
    </div>

    <div className="mb-4 flex-grow space-y-2">
      <div className="flex items-start gap-2">
        <FaMapMarkerAlt className="text-red-500 shrink-0 mt-0.5" size={12} />
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</p>
          <p className="text-xs font-bold text-slate-800 uppercase line-clamp-2 leading-snug">
            {booking.pickup_location_name}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {booking.pickup_location_city}, {booking.pickup_location_state}
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Date</span>
        <span className="font-semibold text-slate-700">{formatDate(booking.created_at)}</span>
      </div>
      <div className="overflow-hidden">
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle</span>
        <span className="font-semibold text-slate-700 flex items-center gap-1 truncate" title={booking.assigned_vehicle || "-"}>
          <FaBus className="text-indigo-400 shrink-0" size={10} /> {booking.assigned_vehicle || "-"}
        </span>
      </div>
    </div>

    {booking.approver && (
      <div className="flex items-center gap-2 text-[10px] text-green-700 bg-green-50 px-2 py-1.5 rounded border border-green-100 mt-auto">
        <FaCheckCircle className="shrink-0" size={10} />
        <span className="truncate uppercase">Approved by <span className="font-bold">{booking.approver.name}</span></span>
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;

  if (error || !traveller) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4 text-center">
        <EmptyState title="Profile Not Found" description={error || "Traveller data unavailable"} />
        <button onClick={() => navigate("/travellers")} className="text-indigo-600 font-bold hover:underline uppercase text-xs">Go Back</button>
      </div>
    );
  }

  const activeBookings = traveller.bookings?.filter(b => ["active", "approved",].includes(b.status.toLowerCase())) || [];
  const pastBookings = traveller.bookings?.filter(b => ["completed", "cancelled", "pending"].includes(b.status.toLowerCase())) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden">

      {/* 1. Sticky Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-1 sticky top-0 z-20 shadow-sm">
        <PageHeaderBack title="Back" buttonLink="/travellers" />
      </div>

      {/* 2. Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div className="relative w-24 h-24 rounded-full p-1 bg-white border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center">
                <img
                  src={`${centralAsset}${traveller.profile_photo}`}
                  alt={traveller.first_name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = DUMMY_IMAGE_PATH; }}
                />
              </div>
            </div>

            {/* Info Block */}
            <div className="flex-1 text-center md:text-left pt-2 min-w-0">
              <h1 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight truncate">
                {traveller.first_name} <span className="text-indigo-600">{traveller.last_name}</span>
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase border border-blue-100">
                  <FaBluetoothB size={10} /> Beacon Uid : {traveller.beacon_id || "None"}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold uppercase border border-slate-200">
                  <MdEventSeat size={12} /> Total Bookings : {traveller.bookings?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-6 flex gap-8 mt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'details' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-sm font-bold uppercase tracking-wide border-b-[3px] transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Bookings
          </button>
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 gap-6">
              {/* Card 1: Personal Info */}
              <InfoCard title="Personal Information" icon={<FaUser />}>
                <div className="grid grid-cols-3 gap-4">
                  <DetailItem label="Uid" value={(traveller.traveller_uid)} />
                  <DetailItem label="First Name" value={traveller.first_name} />
                  <DetailItem label="Last Name" value={traveller.last_name} />
                  <DetailItem label="Gender" value={traveller.gender} />
                  <DetailItem label="Blood Group" value={traveller.blood_group} />
                  <DetailItem label="DOB" value={formatDate(traveller.date_of_birth)} />
                  <DetailItem label="Aadhaar Number" value={(traveller.aadhaar_number)} />
                  <DetailItem label="Profile Created" value={formatDate(traveller.created_at)} />
                  <DetailItem label="Last Updated" value={formatDate(traveller.updated_at)} />
                </div>
              </InfoCard>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-fadeIn">

            {/* Active Bookings Section */}
            <div className="bg-white rounded-lg border-gray-200 shadow-md pb-2">
              <div className="flex items-center gap-2 bg-blue-50 p-3 mb-4 border-b border-indigo-100 pb-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><MdEventSeat size={16} /></div>
                <h3 className="text-sm font-extrabold text-indigo-900 uppercase">Active & Approved Bookings</h3>
              </div>

              {activeBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-4">
                  {activeBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <div className="text-center p-10">
                  <p className="text-xs font-bold text-red-200 uppercase">No active bookings found</p>
                </div>
              )}
            </div>


            <div className="bg-white rounded-lg border-gray-200 shadow-md pb-2">
              <div className="flex items-center gap-2 bg-blue-50 p-3 mb-4 border-b border-indigo-100 pb-2">
                <div className="p-1.5 bg-slate-50 text-red-500 rounded-md"><FaHistory size={16} /></div>
                <h3 className="text-sm font-extrabold text-slate-700 uppercase">Booking History</h3>
              </div>

              {pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-4">
                  {pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-xs font-bold text-red-200 uppercase">No Past bookings found</p>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TravelerShowPage;