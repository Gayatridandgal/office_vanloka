import { useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import DetailItem from "../../Components/UI/DetailItem";
import {
  travelersData,
  bookingsData,
  organisationData,
  appUsersData,
} from "../../Data/Index";
import type { Booking } from "../../Types/Index";

// A small component for displaying a booking
const BookingHistoryCard = ({ booking }: { booking: Booking }) => {
  const org = organisationData.find((o) => o.id === booking.organisation_id);

  // Determine color based on status
  let statusColor = "bg-gray-100 text-gray-800";
  if (booking.status === "Active") statusColor = "bg-green-100 text-green-800";
  if (booking.status === "Completed") statusColor = "bg-blue-100 text-blue-800";
  if (booking.status === "Cancelled") statusColor = "bg-red-100 text-red-800";

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <p className="font-bold uppercase text-sm">{org?.name}</p>
      <p className="text-sm text-gray-700 uppercase">
        <span className="font-bold">Duration : </span>
        {new Date(booking.start_date).toLocaleDateString()} -{" "}
        {new Date(booking.end_date).toLocaleDateString()}
      </p>
      <p className="flex gap-2 items-center text-sm uppercase">
        <span className="font-bold">PICKUP LOCATION</span>
        {booking.pickup_location}
        <span className="font-bold">drop location</span> {booking.drop_location}
      </p>
      <p className="text-sm uppercase"></p>
      <span
        className={`mt-2 inline-block px-2 py-0.5 text-sm uppercase font-semibold rounded-full ${statusColor}`}
      >
        {booking.status}
      </span>
    </div>
  );
};

const TravelerShowPage = () => {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();

  // 1. Find the traveler from the master traveler list
  const traveler = travelersData.find((t) => t.id === id);
  // 2. Find the parent user using the traveler's user_id
  const user = appUsersData.find((u) => u.id === traveler?.user_id);

  // 3. Find all bookings for THIS traveler
  const allBookings = bookingsData.filter((b) => b.traveler_id === id);
  const activeBooking = allBookings.find((b) => b.status === "Active");
  const pastBookings = allBookings.filter((b) => b.status !== "Active");

  // This check is crucial. If it fails, it means the ID in the URL is wrong.
  if (!traveler || !user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Traveler not found.</h2>
        <p className="text-gray-600">
          Please check the ID and ensure the data is correct.
        </p>
      </div>
    );
  }

  // const handleBookTrip = () => {
  //   navigate("/bookings/create", {
  //     state: {
  //       travelerId: traveler.id,
  //       orgId: user.organisation_id,
  //     },
  //   });
  // };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Traveler Details" buttonLink="/travelers" />
      <div className="p-8 mx-auto  rounded-lg shadow-sm ">
        <div className="space-y-8">
          <section className="flex flex-col sm:flex-row items-center gap-6 pb-6">
            <img
              src={traveler.photo as string}
              alt={`${traveler.first_name}`}
              className="h-24 w-24 rounded-full object-cover"
            />
            <div className="flex-grow">
              <h2 className="text-sm uppercase font-bold">
                {traveler.first_name} {traveler.last_name}
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <DetailItem label="Date of Birth" value={traveler.dob} />
                <DetailItem label="Gender" value={traveler.gender} />
              </div>
            </div>
            {/* <button
              onClick={handleBookTrip}
              disabled={!user.organisation_id}
              className="bg-purple-200 text-purple-900 text-sm font-bold p-2 rounded-lg hover:bg-purple-300 uppercase whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Trip
            </button> */}
          </section>

          <section>
            <h3 className="text-sm uppercase font-bold text-black mb-4">
              Active Booking
            </h3>
            {activeBooking ? (
              <BookingHistoryCard booking={activeBooking} />
            ) : (
              <p className="text-gray-500">
                No active booking found for this traveler.
              </p>
            )}
          </section>

          <section>
            <h3 className="text-sm uppercase font-bold text-black mb-4">
              Booking History ({pastBookings.length})
            </h3>
            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastBookings.map((booking) => (
                  <BookingHistoryCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No past bookings found.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TravelerShowPage;
