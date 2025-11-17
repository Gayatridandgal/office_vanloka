import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Booking } from "../Bookings/Booking.types";
import tenantApi from "../../Services/ApiService";
import type { Traveller } from "./Traveler.types";
import useAsset from "../../Hooks/useAsset";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import DetailItem from "../../Components/UI/DetailItem";
import { Loader } from "../../Components/UI/Loader";

// Utility function for date formatting
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md">
    {title}
  </h2>
);

// Booking Card Component
// Booking Card Component
const BookingCard = ({ booking }: { booking: Booking }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-purple-200 rounded-lg p-5 bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
        {booking.assigned_vehicle && (
          <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded uppercase">
            🚐 {booking.assigned_vehicle}
          </span>
        )}
      </div>

      {/* Booking Details */}
      <div className="space-y-3">
        {/* Pickup Location */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
            📍 Pickup Location
          </p>
          <p className="text-sm font-semibold text-gray-900 uppercase">
            {booking.pickup_location_name}
          </p>
          <p className="text-xs text-gray-600 uppercase">
            {booking.pickup_location_city}
            {booking.pickup_location_district &&
              `, ${booking.pickup_location_district}`}
            {booking.pickup_location_state && `, ${booking.pickup_location_state}`}
            {booking.pickup_location_pin_code &&
              ` - ${booking.pickup_location_pin_code}`}
          </p>
        </div>

        {/* Purpose & Employee ID */}
        <div className="grid grid-cols-2 gap-3">
          {booking.purpose && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Purpose</p>
              <p className="text-sm text-gray-900 uppercase">{booking.purpose}</p>
            </div>
          )}
          {booking.employee_id && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Employee ID
              </p>
              <p className="text-sm text-gray-900 uppercase">
                {booking.employee_id}
              </p>
            </div>
          )}
        </div>

        {/* FIXED: Approver Info - Use approver object instead of approved_by ID */}
        {booking.approver && (
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <p className="text-xs font-bold text-blue-700 uppercase">
              ✓ Approved by: {booking.approver.name || booking.approver.email || "N/A"}
            </p>
          </div>
        )}

        {/* Created Date */}
        <p className="text-xs text-gray-500 uppercase">
          Booked on: {formatDate(booking.created_at)}
        </p>
      </div>
    </div>
  );
};


const TravelerShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [traveller, setTraveler] = useState<Traveller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const asset = useAsset();

  useEffect(() => {
    fetchTraveler();
  }, [id]);

  const fetchTraveler = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<{
        success: boolean;
        data: Traveller;
      }>(`/travellers/${id}`);

      if (response.data.success) {
        setTraveler(response.data.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch traveller details";
      setError(errorMessage);
      console.error("Error fetching traveller:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (error || !traveller) {
    return (
     <Loader/>
    );
  }

  // Separate active and past bookings
  const activeBookings =
    traveller.bookings?.filter(
      (b) => b.status === "active" || b.status === "approved"
    ) || [];
  const pastBookings =
    traveller.bookings?.filter(
      (b) => b.status !== "active" && b.status !== "approved"
    ) || [];

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Back" buttonLink="/travellers" />

      <div className="p-10 mx-auto rounded-lg shadow-lg bg-white border border-gray-200">
        {/* Header with Profile */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-start gap-6">
            {traveller.profile_photo && (
              <img
                src={asset(traveller.profile_photo) || ""}
                alt={`${traveller.first_name} ${traveller.last_name}`}
                className="h-28 w-28 rounded-full object-cover border-4 border-purple-200 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-purple-950 uppercase mb-2">
                {traveller.first_name} {traveller.last_name}
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <DetailItem label="Gender" value={traveller.gender} />
                <DetailItem
                  label="Date of Birth"
                  value={formatDate(traveller.date_of_birth)}
                />
                <DetailItem label="Blood Group" value={traveller.blood_group} />
                <DetailItem label="Relationship" value={traveller.relationship} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <div>
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2 mt-4">
              <DetailItem label="UID" value={traveller.traveller_uid} />
              <DetailItem label="Beacon ID" value={traveller.beacon_id} />
              <DetailItem label="Aadhaar Number" value={traveller.aadhaar_number} />
              <DetailItem
                label="Created On"
                value={formatDate(traveller.created_at)}
              />
            </div>
          </div>

          {/* Remarks */}
          {traveller.remarks_notes && (
            <div>
              <SectionHeader title="Remarks / Notes" />
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap uppercase">
                  {traveller.remarks_notes}
                </p>
              </div>
            </div>
          )}

          {/* Active/Approved Bookings */}
          <div>
            <SectionHeader
              title={`Active Bookings (${activeBookings.length})`}
            />
            {activeBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center mt-4">
                <p className="text-gray-500 text-sm uppercase">
                  No Active Bookings
                </p>
              </div>
            )}
          </div>

          {/* Booking History */}
          <div>
            <SectionHeader title={`Booking History (${pastBookings.length})`} />
            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center mt-4">
                <p className="text-gray-500 text-sm uppercase">
                  No Booking History
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/travellers/edit/${traveller.id}`)}
            className="px-6 py-2 bg-blue-600 font-bold text-white text-sm rounded-md hover:bg-blue-700 uppercase"
          >
            Edit Traveller
          </button>
          <button
            onClick={() => navigate("/travellers")}
            className="px-6 py-2 bg-gray-400 font-bold text-white text-sm rounded-md hover:bg-gray-500 uppercase"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelerShowPage;
