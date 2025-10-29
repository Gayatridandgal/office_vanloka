import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import {
  bookingsData,
  travelersData,
  appUsersData,
  organisationData,
  assignedBeacons, // Import the list of available beacons
} from "../../Data/Index";
import type { Booking } from "../../Types/Index";
import DetailItem from "../../Components/UI/DetailItem";

// --- Helper Component: DetailItem ---
// Note: This can be moved to a shared file like /Components/UI/DetailItem.tsx

// --- Helper function to find the beacon's name from its ID ---
const findBeaconName = (beaconId: string | undefined) => {
  const beacon = assignedBeacons.find((b) => b.id === beaconId);
  return beacon ? `${beacon.name} (${beacon.imei_number})` : "Not Assigned";
};

// --- Main Page Component ---
const BookingShowPage = () => {
  const { id } = useParams<{ id: string }>();

  // Find all related data for the booking
  const booking = bookingsData.find((b) => b.id === id);
  const traveler = travelersData.find((t) => t.id === booking?.traveler_id);
  const user = appUsersData.find((u) => u.id === booking?.user_id);
  const organisation = organisationData.find(
    (o) => o.id === booking?.organisation_id
  );

  // State to manage the values of editable fields
  const [currentStatus, setCurrentStatus] = useState(booking?.status);
  const [selectedBeacon, setSelectedBeacon] = useState(booking?.beacon || "");

  // Update state if the user navigates between different booking pages
  useEffect(() => {
    setCurrentStatus(booking?.status);
    setSelectedBeacon(booking?.beacon || "");
  }, [booking]);

  const handleSaveChanges = () => {
    // In a real application, you would send a PATCH request with the changed data
    console.log("Saving Changes:", {
      status: currentStatus,
      beacon: selectedBeacon,
    });
    alert("Booking updated successfully!");
    // You could potentially disable the save button again after a successful save
  };

  // This check is crucial to ensure all data exists before rendering
  if (!booking || !traveler || !user || !organisation) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Booking not found.</h2>
      </div>
    );
  }

  // Determine if the beacon field should be editable (only if it's currently empty)
  const canEditBeacon = !booking.beacon;

  // Determine if any changes have been made to enable the save button
  const hasChanges =
    currentStatus !== booking.status ||
    (canEditBeacon && selectedBeacon !== booking.beacon);

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Booking Details" buttonLink="/bookings" />
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 mt-4 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              Traveler & User Details
            </h2>
            <div className="space-y-4">
              <DetailItem
                label="Traveler Name"
                value={`${traveler.first_name} ${traveler.last_name}`}
              />
              <DetailItem
                label="Primary User"
                value={`${user.first_name} ${user.last_name}`}
              />
              <DetailItem label="User Contact" value={user.phone} />
            </div>
          </div>
          <div>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              Organisation Details
            </h2>
            <div className="space-y-4">
              <DetailItem label="Organisation Name" value={organisation.name} />
              <DetailItem
                label="Contact Person"
                value={organisation.contact_person_name}
              />
              <DetailItem
                label="Contact Phone"
                value={organisation.contact_person_phone}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
            Route & Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem
              label="Pickup Location (Checkpoint)"
              value={booking.pickup_location}
            />
            <DetailItem
              label="Drop Location (Organisation Address)"
              value={booking.drop_location}
            />
            <DetailItem label="Pickup Time" value={booking.pickup_time} />
            <DetailItem
              label="Start Date"
              value={new Date(booking.start_date).toLocaleDateString()}
            />
            <DetailItem
              label="End Date"
              value={new Date(booking.end_date).toLocaleDateString()}
            />
          </div>
        </section>

        <section className="border-t pt-6">
          <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                Assigned Beacon
              </label>
              {canEditBeacon ? (
                <select
                  value={selectedBeacon}
                  onChange={(e) => setSelectedBeacon(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Assign Beacon</option>
                  {assignedBeacons.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.imei_number})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 text-sm uppercase py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-800">
                  {findBeaconName(booking.beacon)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-purple-950 uppercase text-sm font-bold mb-2">
                Booking Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) =>
                  setCurrentStatus(e.target.value as Booking["status"])
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className={` bg-purple-200 text-purple-900 text-sm font-bold py-2 px-4 rounded-lg uppercase transition-all ${
                !hasChanges && "opacity-50 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingShowPage;
