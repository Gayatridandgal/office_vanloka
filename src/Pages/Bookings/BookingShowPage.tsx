import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaIdCard,
  FaEdit,
} from "react-icons/fa";
import { MdLocationOn, MdSettingsCell, MdWarning } from "react-icons/md";
import { ImCross } from "react-icons/im";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import DetailItem from "../../Components/UI/DetailItem";
import type { Booking } from "./Booking.types";
import tenantApi from "../../Services/ApiService";
import useAsset from "../../Hooks/useAsset";
import { useForm } from "react-hook-form";
import { SectionHeader } from "../../Components/UI/SectionHeader";
import { Loader } from "../../Components/UI/Loader";
import { useAlert } from "../../Context/AlertContext";
import type { Vehicle } from "../Vehicles/Vehicle.types";
import type { BeaconDevice } from "../../Types/Index";
import SelectInputField from "../../Components/Form/SelectInputField";
import { formatDate, formatDateTime } from "../../Utils/Toolkit";
import { GiSettingsKnobs } from "react-icons/gi";
import { CiSettings } from "react-icons/ci";
import { IoSettings } from "react-icons/io5";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          label: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <FaCheckCircle size={12} />,
        };
      case "approved":
        return {
          label: "Approved",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <FaCheckCircle size={12} />,
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <FaCheckCircle size={12} />,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <FaTimesCircle size={12} />,
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <FaClock size={12} />,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase border-2 ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// Beacon Status Badge
const BeaconStatusBadge = ({ beaconId }: { beaconId?: string | null }) => {
  if (beaconId) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-green-100 text-green-800 border-2 border-green-200">
        <FaCheckCircle size={12} />
        Beacon Assigned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase bg-red-100 text-red-800 border-2 border-red-200">
      <FaTimesCircle size={12} />
      Beacon Not Assigned
    </span>
  );
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
  const { showAlert } = useAlert();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [beacons, setBeacons] = useState<BeaconDevice[]>([]);

  const asset = useAsset();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFormInputs>();

  useEffect(() => {
    fetchInitialData();
    fetchBooking();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      // setLoading(true);
      const [beaconsResponse] = await Promise.all([
        tenantApi.get(`/beacon-device/for/dropdown`),
        // Add more dropdown APIs here if needed
      ]);

      setBeacons(beaconsResponse.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      showAlert("Failed to load dropdown data. Please refresh.", "error");
    } finally {
      // setLoading(false);
    }
  };

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
        showAlert("Booking updated successfully!", "success");
        setIsEditing(false);
        fetchBooking(); // Refresh data
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      showAlert("Failed to update booking", "error");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !booking) {
    return <Loader />;
  }

  const hasBeacon = booking.traveller?.beacon_id;
  const availableBeacons = beacons.filter(
    (beacon) =>
      beacon.status === "available" ||
      beacon.device_id === booking.traveller?.beacon_id
  );

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Booking Details" buttonLink="/bookings" />

      <div className="space-y-4 mt-4 pb-10 mx-auto max-w-7xl">
        {/* Header Card with Traveller Info and Status */}
        <div className="bg-white border  border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {booking.traveller_profile_photo ? (
                <img
                  src={asset(booking.traveller_profile_photo) || ""}
                  alt={`${booking.traveller_first_name} ${booking.traveller_last_name}`}
                  className="h-24 w-24 rounded-lg object-cover border-4 border-purple-300 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-purple-200 flex items-center justify-center border-4 border-purple-300 shadow-md">
                  <FaUser className="text-purple-600" size={40} />
                </div>
              )}
              <div className="uppercase">
                <h1 className="text-xl font-bold text-gray-900 uppercase mb-1">
                  {booking.traveller_first_name} {booking.traveller_last_name}
                </h1>

                {booking.employee_id && (
                  <p className="text-sm text-gray-600  font-semibold flex items-center gap-2 mb-1">
                    <FaIdCard size={14} className="text-gray-600" />
                    Employee ID{" "}
                    <span className="font-mono font-semibold">
                      {booking.employee_id}
                    </span>
                  </p>
                )}
                <p className="text-sm text-gray-600 font-semibold flex items-center gap-2">
                  <FaCalendarAlt size={14} className="text-gray-600" />
                  Booked On {formatDate(booking.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <BeaconStatusBadge beaconId={booking.traveller?.beacon_id} />
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh] space-y-4 border border-gray-200 p-6 rounded-lg">
          {/* Booking Information */}
          <div className="grid grid-cols-2 gap-4 ">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <SectionHeader icon={<FaCalendarAlt size={20} />} title="Booking Information" />
              <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-6">
                <DetailItem label="Booking ID" value={booking.id} />
                <DetailItem label="Purpose" value={booking.purpose} />
                <DetailItem label="Traveller Age" value={booking.traveller_age} />
                <DetailItem label="Booked On" value={formatDate(booking.created_at)} />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <SectionHeader icon={<FaMapMarkerAlt size={20} />} title="Traveller Address" />
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
                  <DetailItem label="Address Line 1" value={booking.address_line_1} />
                  <DetailItem label="City" value={booking.city} />
                  <DetailItem label="District" value={booking.district} />
                  <DetailItem label="State" value={booking.state} />
                  <DetailItem label="PIN Code" value={booking.pin_code} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pickup Location */}
            <div>
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <SectionHeader icon={<MdLocationOn size={20} />} title="Pickup Location" />
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                  <DetailItem
                    label="Location Name"
                    value={booking.pickup_location_name}
                  />
                  <DetailItem label="City" value={booking.pickup_location_city} />
                  <DetailItem label="District" value={booking.pickup_location_district} />
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
            </div>

            {/* Admin Operations Section */}
            <div>
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center  bg-purple-50 p-2 mb-6 rounded-lg">

                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded-lg text-blue-700 shadow-sm">
                      <IoSettings />
                    </div>
                    <label htmlFor="hdfbdk" className="text-sm uppercase font-bold text-purple-950">Operational Section</label>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className=" p-1 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 uppercase flex items-center gap-1"
                    >
                      <FaEdit size={14} />
                      Edit Details
                    </button>
                  )}
                </div>

                {isEditing ? (
                  /* Edit Form */
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Beacon ID - Only show if doesn't exist */}
                        {!hasBeacon && (
                          <div>
                            <SelectInputField
                              label="Assign Beacon"
                              name="beacon_id"
                              register={register}
                              errors={errors}
                              options={availableBeacons.map((data) => ({
                                label: data.device_id,
                                value: data.imei_number,
                              }))}
                              disabled={loading}
                            />
                            <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                              <p className="text-xs text-amber-700 flex items-center gap-1">
                                <MdWarning size={14} />
                                Traveller doesn't have a beacon assigned yet
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pickup Time */}
                        <div>
                          <label className="block text-gray-700 uppercase text-sm font-bold mb-2">
                            Pickup Time
                          </label>
                          <input
                            type="time"
                            {...register("pickup_time")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Drop Time */}
                        <div>
                          <label className="block text-gray-700 uppercase text-sm font-bold mb-2">
                            Drop Time
                          </label>
                          <input
                            type="time"
                            {...register("drop_time")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Assign Vehicle */}
                        <div>
                          <label className="block text-gray-700 uppercase text-sm font-bold mb-2">
                            Assign Vehicle
                          </label>
                          <select
                            {...register("assigned_vehicle")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                          >
                            <option value="">Select Vehicle</option>
                            {vehicles.map((vehicle) => (
                              <option key={vehicle.vehicle_number} value={vehicle.vehicle_number}>
                                {vehicle.vehicle_number} - {vehicle.vehicle_type}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-gray-700 uppercase text-sm font-bold mb-2">
                            Status <span className="text-red-600">*</span>
                          </label>
                          <select
                            {...register("status", {
                              required: "Status is required",
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
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
                          className="px-6 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 uppercase disabled:opacity-50 flex items-center gap-2"
                        >
                          <FaCheckCircle size={14} />
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            reset();
                          }}
                          className="px-6 py-2 bg-gray-500 text-white font-bold text-sm rounded-lg hover:bg-gray-600 uppercase flex items-center gap-2"
                        >
                          <ImCross size={12} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 space-y-2">
                    {/* Show Beacon Status */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Beacon ID
                      </h4>
                      {hasBeacon ? (
                        <p className="text-sm text-gray-900 uppercase font-semibold flex items-center gap-2">
                          <span className="text-green-600">
                            <FaCheckCircle size={14} />
                          </span>
                          {booking.traveller?.beacon_id}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 uppercase font-semibold flex items-center gap-2">
                          <FaTimesCircle size={14} />
                          Not Assigned
                        </p>
                      )}
                    </div>
                    <DetailItem
                      label="Assigned Vehicle"
                      value={booking.assigned_vehicle || "Not Assigned"}
                    />
                    <DetailItem label="Pickup Time" value={booking.pickup_time || "-"} />
                    <DetailItem label="Drop Time" value={booking.drop_time || "-"} />
                    <DetailItem
                      label="Approved By"
                      value={booking.approver?.name || "-"}
                    />
                    <DetailItem label="Email" value={booking.approver?.email || "-"} />
                    <DetailItem
                      label="Approved On"
                      value={formatDateTime(booking.updated_at ?? "-")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingShowPage;
