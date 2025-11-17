import { useState, useEffect } from "react";
import Table from "../../Components/UI/Table";
import type { Traveller } from "./Traveler.types";
import tenantApi from "../../Services/ApiService";
import type { PaginatedResponse } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";
import { Loader } from "../../Components/UI/Loader";
import PageTitle from "../../Components/UI/PageTitle";

// Column definitions
const columns = [
  {
    key: "sno",
    label: "S.No",
    render: (_: Traveller, index: number) => index + 1,
  },
  {
    key: "name",
    label: "Full Name",
    render: (row: Traveller) => (
      <div className="flex items-center gap-3">
        {row.profile_photo && (
          <img
            src={`http://localhost/storage/${row.profile_photo}`}
            alt={`${row.first_name} ${row.last_name}`}
            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div>
          <div className="font-semibold text-gray-900 text-sm uppercase">
            {row.first_name} {row.last_name}
          </div>
          {row.relationship && (
            <div className="text-xs text-gray-500 uppercase">
              {row.relationship}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "traveller_uid",
    label: "UID",
    render: (row: Traveller) => (
      <span className="text-sm uppercase">{row.traveller_uid || "—"}</span>
    ),
  },
  {
    key: "beacon_id",
    label: "Beacon ID",
    render: (row: Traveller) => (
      <span className="text-sm uppercase">{row.beacon_id || "—"}</span>
    ),
  },
  {
    key: "gender",
    label: "Gender",
    render: (row: Traveller) => (
      <span className="text-sm uppercase">{row.gender || "—"}</span>
    ),
  },
  {
    key: "aadhaar_number",
    label: "Aadhaar",
    render: (row: Traveller) => (
      <span className="text-sm">{row.aadhaar_number || "—"}</span>
    ),
  },
];

const TravelerIndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayTravelers, setDisplayTravelers] = useState<Traveller[]>([]);
  const [allTravelers, setAllTravelers] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Fetch travellers from API
  useEffect(() => {
    fetchTravelers();
  }, [currentPage, perPage]);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<PaginatedResponse<Traveller>>(
        "/travellers",
        {
          params: {
            page: currentPage,
            per_page: perPage,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const travellers = response.data.data.data || [];
        setAllTravelers(travellers);
        setDisplayTravelers(travellers);

        // Set pagination info
        if (response.data.data.last_page) {
          setTotalPages(response.data.data.last_page);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch travellers";
      setError(errorMessage);
      console.error("Error fetching travellers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search effect
  useEffect(() => {
    if (!searchQuery) {
      setDisplayTravelers(allTravelers);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allTravelers.filter(
      (traveler) =>
        `${traveler.first_name} ${traveler.last_name}`
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (traveler.beacon_id ?? "").toLowerCase().includes(lowercasedQuery) ||
        (traveler.traveller_uid ?? "").toLowerCase().includes(lowercasedQuery)
    );

    setDisplayTravelers(filtered);
  }, [searchQuery, allTravelers]);

  
  if (error) {
    return (
      <Loader />
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageTitle
        title="Travellers"
      />

      {/* Search Component */}
      <div className="my-4">
        <SearchComponent
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search by Name, Beacon ID, UID..."
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600 uppercase text-sm">Loading...</p>
        </div>
      ) : (
        <>
          <Table<Traveller>
            list={displayTravelers}
            columns={columns}
            viewUrl="/travellers/show"
            // editUrl="/travellers/edit"
            // onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
};

export default TravelerIndexPage;
