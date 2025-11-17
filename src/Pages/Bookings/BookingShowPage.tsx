import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import DetailItem from "../../Components/UI/DetailItem";
import type { Booking, Vehicle } from "./Booking.types";
import tenantApi from "../../Services/ApiService";
import useAsset from "../../Hooks/useAsset";
import { useForm } from "react-hook-form";

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

type UpdateFormInputs = {
  pickup_time: string;
  drop_time: string;
  assigned_vehicle: string;
  status: string;
  beacon_id: string;
};

const BookingShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const asset = useAsset();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFormInputs>();

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<{
        success: boolean;
        data: {
          booking: Booking;
          vehicles: Vehicle[];
        };
      }>(`/bookings/${id}`);

      if (response.data.success) {
        const bookingData = response.data.data.booking;
        const vehiclesData = response.data.data.vehicles;

        setBooking(bookingData);
        setVehicles(vehiclesData);

        // Set form default values
        reset({
          pickup_time: bookingData.pickup_time || "",
          drop_time: bookingData.drop_time || "",
          assigned_vehicle: bookingData.assigned_vehicle || "",
          status: bookingData.status || "pending",
          beacon_id: bookingData.traveller?.beacon_id || "",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch booking details";
      setError(errorMessage);
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateFormInputs) => {
    try {
      const response = await tenantApi.put(`/bookings/${id}`, data);

      if (response.data.success) {
        alert("Booking updated successfully!");
        setIsEditing(false);
        fetchBooking(); // Refresh data
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 uppercase text-sm">
            Loading Booking Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="px-4 bg-white min-h-screen text-center py-10">
        <h1 className="text-2xl font-bold uppercase">Booking not found.</h1>
        <p className="text-red-600 mt-4 uppercase">{error}</p>
        <button
          onClick={() => navigate("/bookings")}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 uppercase"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  // Check if beacon exists
  const hasBeacon = booking.traveller?.beacon_id;

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Back" buttonLink="/bookings" />

      <div className="p-10 mx-auto rounded-lg shadow-lg bg-white border border-gray-200">
        {/* Header with Status */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {booking.traveller_profile_photo && (
                <img
                  src={asset(booking.traveller_profile_photo) || ""}
                  alt={`${booking.traveller_first_name} ${booking.traveller_last_name}`}
                  className="h-28 w-28 rounded-full object-cover border-4 border-purple-200 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-purple-950 uppercase mb-2">
                  {booking.traveller_first_name} {booking.traveller_last_name}
                </h1>
                <p className="text-sm text-gray-600 uppercase">
                  {booking.organisation_name || "N/A"}
                </p>
                {booking.employee_id && (
                  <p className="text-sm text-gray-600 uppercase">
                    Employee ID: {booking.employee_id}
                  </p>
                )}
              </div>
            </div>
            <span
              className={`px-4 py-2 text-sm font-bold uppercase rounded-full ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Booking Details */}
          <div>
            <SectionHeader title="Booking Information" />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2 mt-4">
              <DetailItem label="Booking ID" value={booking.id} />
              <DetailItem label="Purpose" value={booking.purpose} />
              <DetailItem label="Traveller Age" value={booking.traveller_age} />
              <DetailItem
                label="Booked On"
                value={formatDate(booking.created_at)}
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <SectionHeader title="Address Details" />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2 mt-4">
              <DetailItem label="Address Line 1" value={booking.address_line_1} />
              <DetailItem label="City" value={booking.city} />
              <DetailItem label="District" value={booking.district} />
              <DetailItem label="State" value={booking.state} />
              <DetailItem label="PIN Code" value={booking.pin_code} />
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <SectionHeader title="Pickup Location" />
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 px-2 mt-4">
              <DetailItem
                label="Location Name"
                value={booking.pickup_location_name}
              />
              <DetailItem label="City" value={booking.pickup_location_city} />
              <DetailItem
                label="District"
                value={booking.pickup_location_district}
              />
              <DetailItem label="State" value={booking.pickup_location_state} />
              <DetailItem
                label="PIN Code"
                value={booking.pickup_location_pin_code}
              />
              <DetailItem
                label="Latitude"
                value={booking.pickup_location_latitude}
              />
              <DetailItem
                label="Longitude"
                value={booking.pickup_location_longitude}
              />
            </div>
          </div>

          {/* Admin Operations Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <SectionHeader title="Admin Operations" />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 uppercase"
                >
                  Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Beacon ID - Only show if doesn't exist */}
                    {!hasBeacon && (
                      <div>
                        <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                          Beacon ID <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("beacon_id", {
                            required: !hasBeacon
                              ? "Beacon ID is required"
                              : false,
                          })}
                          placeholder="Enter Beacon ID"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                        />
                        {errors.beacon_id && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.beacon_id.message}
                          </p>
                        )}
                        <p className="text-xs text-blue-600 mt-1 uppercase">
                          ⚠️ Traveller doesn't have a beacon assigned yet
                        </p>
                      </div>
                    )}

                    {/* Pickup Time */}
                    <div>
                      <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                        Pickup Time
                      </label>
                      <input
                        type="time"
                        {...register("pickup_time")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Drop Time */}
                    <div>
                      <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                        Drop Time
                      </label>
                      <input
                        type="time"
                        {...register("drop_time")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Assign Vehicle */}
                    <div>
                      <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                        Assign Vehicle
                      </label>
                      <select
                        {...register("assigned_vehicle")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.vehicle_number}>
                            {vehicle.vehicle_number} - {vehicle.vehicle_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                        Status <span className="text-red-600">*</span>
                      </label>
                      <select
                        {...register("status", {
                          required: "Status is required",
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {errors.status && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 uppercase disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                      className="px-6 py-2 bg-gray-400 text-white font-bold text-sm rounded-lg hover:bg-gray-500 uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Show Beacon Status */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Beacon ID
                    </h4>
                    {hasBeacon ? (
                      <p className="text-sm text-gray-900 uppercase font-semibold flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {booking.traveller?.beacon_id}
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 uppercase font-semibold flex items-center gap-2">
                        <span>⚠️</span>
                        Not Assigned
                      </p>
                    )}
                  </div>

                  <DetailItem label="Pickup Time" value={booking.pickup_time} />
                  <DetailItem label="Drop Time" value={booking.drop_time} />
                  <DetailItem
                    label="Assigned Vehicle"
                    value={booking.assigned_vehicle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Approver Info */}
          {booking.approver && (
            <div>
              <SectionHeader title="Approval Details" />
              <div className="p-4 bg-blue-50 rounded-lg mt-4 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DetailItem
                    label="Approved By"
                    value={booking.approver.name || "N/A"}
                  />
                  <DetailItem label="Email" value={booking.approver.email} />
                  <DetailItem
                    label="Approved On"
                    value={formatDate(booking.updated_at)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/bookings")}
            className="px-6 py-2 bg-gray-400 font-bold text-white text-sm rounded-md hover:bg-gray-500 uppercase"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingShowPage;
