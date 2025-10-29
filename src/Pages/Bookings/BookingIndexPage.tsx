import { useState, useEffect } from "react"; // Import useState and useEffect
import PageHeader from "../../Components/UI/PageHeader"; // Upgraded from PageTitle
import Table from "../../Components/UI/Table";
import { bookingsData, travelersData } from "../../Data/Index";
import type { Booking } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";

// Helper function to find traveler's full name by ID
const findTravelerName = (id: string) => {
  const traveler = travelersData.find((t) => t.id === id);
  return traveler ? `${traveler.first_name} ${traveler.last_name}` : "N/A";
};

// Column definitions for the table
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
  // State to manage the search query and the final list to be displayed
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // This effect runs whenever the search query changes
  useEffect(() => {
    // Always start with the base list of Bookings
    const activeBookings = bookingsData.filter((b) => b.status === "Active");

    if (!searchQuery) {
      setFilteredBookings(activeBookings);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = activeBookings.filter((booking) => {
      const travelerName = findTravelerName(booking.traveler_id);
      // Search by traveler name
      return travelerName.toLowerCase().includes(lowercasedQuery);
    });
    setFilteredBookings(filtered);
  }, [searchQuery]); // Re-run the filter when the search query changes

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Bookings"
        // buttonText="New Booking"
        // buttonLink="/bookings/create"
      />

      {/* Add the SearchComponent */}
      <div className="my-4">
        <SearchComponent
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search by Traveler Name..."
        />
      </div>

      <Table<Booking>
        list={filteredBookings} // <-- Use the filtered state here
        columns={columns}
        viewUrl="/bookings/show"
      />
    </div>
  );
};

export default BookingIndexPage;
