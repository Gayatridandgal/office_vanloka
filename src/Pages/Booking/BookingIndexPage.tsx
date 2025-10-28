import PageTitle from "../../Components/UI/PageTitle";
import Table from "../../Components/UI/Table";
import { bookingsData, travelersData } from "../../Data/Index";
import type { Booking } from "../../Types/Index";

const findTravelerName = (id: string) => {
  const traveler = travelersData.find((t) => t.id === id);
  return traveler ? `${traveler.first_name} ${traveler.last_name}` : "N/A";
};

// const findOrgName = (id: string) =>
//   organisationData.find((o) => o.id === id)?.name || "N/A";

const columns = [
  {
    key: "sno",
    label: "Sno",
    render: (_: Booking, index: number) => (
      <div className="font-medium">{index + 1}</div>
    ),
  },
  {
    key: "traveler",
    label: "Full Name",
    render: (row: Booking) => (
      <div className="font-medium">{findTravelerName(row.traveler_id)}</div>
    ),
  },

  {
    key: "pickup",
    label: "Pickup Time",
    render: (row: Booking) => (
      <span className="font-semibold">{row.pickup_time}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row: Booking) => (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        {row.status}
      </span>
    ),
  },
];

const BookingIndexPage = () => {
  const activeBookings = bookingsData.filter((b) => b.status === "Active");

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageTitle title="Bookings" />
      <Table<Booking>
        list={activeBookings}
        columns={columns}
        viewUrl="/bookings/show"
      />
    </div>
  );
};

export default BookingIndexPage;
