import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import SearchComponent from "../../Components/UI/SearchComponents";
import tenantApi from "../../Services/ApiService";
import type { Booking } from "./Booking.types";
import { Loader } from "../../Components/UI/Loader";

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

const columns = [
  {
    key: "sno",
    label: "S.No",
    render: (_: Booking, index: number) => index + 1,
  },
  {
    key: "traveller",
    label: "Traveller",
    render: (row: Booking) => (
      <div className="flex items-center gap-3">
        {row.traveller_profile_photo && (
          <img
            src={`http://localhost/storage/${row.traveller_profile_photo}`}
            alt={`${row.traveller_first_name} ${row.traveller_last_name}`}
            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div>
          <div className="font-semibold text-gray-900 text-sm uppercase">
            {row.traveller_first_name} {row.traveller_last_name}
          </div>
          {row.employee_id && (
            <div className="text-xs text-gray-500 uppercase">
              EMP: {row.employee_id}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "pickup_location",
    label: "Pickup Location",
    render: (row: Booking) => (
      <div>
        <div className="text-sm font-medium uppercase">
          {row.pickup_location_name}
        </div>
        <div className="text-xs text-gray-500 uppercase">
          {row.pickup_location_city}
        </div>
      </div>
    ),
  },
  {
    key: "organisation",
    label: "Organisation",
    render: (row: Booking) => (
      <span className="text-sm uppercase">{row.organisation_name || "—"}</span>
    ),
  },
  {
    key: "vehicle",
    label: "Vehicle",
    render: (row: Booking) => (
      <span className="text-sm uppercase font-semibold">
        {row.assigned_vehicle || "—"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row: Booking) => (
      <span
        className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${getStatusColor(
          row.status
        )}`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "pickup_time",
    label: "Pickup Time",
    render: (row: Booking) => (
      <span className="text-sm">{row.pickup_time || "—"}</span>
    ),
  },
];

const BookingIndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [displayBookings, setDisplayBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get("/bookings", {
        params: {
          per_page: 50,
          status: statusFilter,
        },
      });

      if (response.data.success) {
        const bookings = response.data.data.data || [];
        setAllBookings(bookings);
        setDisplayBookings(bookings);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bookings";
      setError(errorMessage);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search effect
  useEffect(() => {
    if (!searchQuery) {
      setDisplayBookings(allBookings);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allBookings.filter(
      (booking) =>
        `${booking.traveller_first_name} ${booking.traveller_last_name}`
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (booking.employee_id ?? "").toLowerCase().includes(lowercasedQuery) ||
        (booking.pickup_location_name ?? "")
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (booking.assigned_vehicle ?? "").toLowerCase().includes(lowercasedQuery)
    );

    setDisplayBookings(filtered);
  }, [searchQuery, allBookings]);

  const handleDelete = async (booking: Booking) => {
    if (
      !confirm(
        `Are you sure you want to delete booking for ${booking.traveller_first_name} ${booking.traveller_last_name}?`
      )
    ) {
      return;
    }

    try {
      const response = await tenantApi.delete(`/bookings/${booking.id}`);

      if (response.data.success) {
        setAllBookings((prev) => prev.filter((b) => b.id !== booking.id));
        setDisplayBookings((prev) => prev.filter((b) => b.id !== booking.id));
        alert("Booking deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking");
    }
  };

  if (error) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeader title="Bookings" />
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader title="Bookings" />

      {/* Filters */}
      <div className="my-4 flex gap-4 items-center">
        <SearchComponent
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search by Traveller, Employee ID, Location..."
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loader/>
      ) : (
        <>
          <Table<Booking>
            list={displayBookings}
            columns={columns}
            viewUrl="/bookings/show"
            // editUrl="/bookings/edit"
            // onDelete={handleDelete}
          />

          <div className="mt-4 text-sm text-gray-600">
            Showing {displayBookings.length} of {allBookings.length} bookings
          </div>
        </>
      )}
    </div>
  );
};

export default BookingIndexPage;
