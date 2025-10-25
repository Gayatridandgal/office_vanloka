import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import DetailItem from "../../Components/UI/DetailItem";
import {
  bookingsData,
  travelersData,
  usersData,
  organisationData,
} from "../../Data/Index";
import type { Booking } from "../../Types/Index";

const BookingShowPage = () => {
  const { id } = useParams<{ id: string }>();

  const booking = bookingsData.find((b) => b.id === id);
  const traveler = travelersData.find((t) => t.id === booking?.traveler_id);
  const user = usersData.find((u) => u.id === booking?.user_id);
  const organisation = organisationData.find(
    (o) => o.id === booking?.organisation_id
  );

  const [currentStatus, setCurrentStatus] = useState(booking?.status);

  useEffect(() => {
    setCurrentStatus(booking?.status);
  }, [booking]);

  const handleStatusUpdate = () => {
    console.log("Updating status to:", currentStatus);
    alert("Booking status updated successfully!");
  };

  if (!booking || !traveler || !user || !organisation) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Booking not found.</h2>
      </div>
    );
  }

  const hasStatusChanged = currentStatus !== booking.status;

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Booking Details" buttonLink="/bookings" />
      <div className="mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 mt-4 space-y-8">
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

        <section className="">
          <div className="">
            <h1 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              Update Booking Status
            </h1>
            <div className="flex items-center gap-3">
              <select
                value={currentStatus}
                onChange={(e) =>
                  setCurrentStatus(e.target.value as Booking["status"])
                }
                className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={!hasStatusChanged}
                className={`w-32 bg-purple-200 text-purple-900 text-sm font-bold py-2 px-4 rounded-lg uppercase transition-all ${
                  !hasStatusChanged && "opacity-50 cursor-not-allowed"
                }`}
              >
                Update
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingShowPage;
