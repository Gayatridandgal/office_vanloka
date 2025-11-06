import { useState, useEffect } from "react";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import type { Driver, PaginatedResponse } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";
import SingleFilterHeader from "../../Components/UI/SingleFilterHeader";
import tenantApi from "../../Services/ApiService";

// Helper function to determine status color
const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// Check if license is expiring soon
const isLicenseExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
  return expiry <= thirtyDaysFromNow && expiry >= new Date();
};

// Column definitions
const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Driver, index: number) => index + 1,
  },
  {
    key: "name",
    label: "Driver Name",
    render: (row: Driver) => (
      <div className="flex items-center gap-3">
        {row.profile_photo && (
          <img
            src={`http://localhost/storage/${row.profile_photo}`}
            alt={`${row.first_name} ${row.last_name}`}
            className="h-8 w-8 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div>
          <div className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-xs text-gray-500">
            {row.driving_license_number}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    render: (row: Driver) => (
      <div>
        <div className="text-sm font-medium">{row.mobile_number}</div>
        {row.email && <div className="text-xs text-gray-500">{row.email}</div>}
      </div>
    ),
  },
  {
    key: "license_info",
    label: "License Info",
    render: (row: Driver) => (
      <div>
        <div className="text-sm">{row.license_type}</div>
        {row.license_expiry_date && (
          <div
            className={`text-xs ${
              isLicenseExpiringSoon(row.license_expiry_date)
                ? "text-red-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Exp: {new Date(row.license_expiry_date).toLocaleDateString("en-IN")}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "experience",
    label: "Experience",
    render: (row: Driver) => (
      <span className="text-sm">
        {row.driving_experience_years
          ? `${row.driving_experience_years} yrs`
          : "—"}
      </span>
    ),
  },
  {
    key: "city",
    label: "City",
    render: (row: Driver) => <span className="text-sm">{row.city || "—"}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (row: Driver) => (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
          row.status,
        )}`}
      >
        {row.status
          ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
          : "Active"}
      </span>
    ),
  },
];

const DriverIndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLicenseType, setSelectedLicenseType] = useState("");
  const [displayDrivers, setDisplayDrivers] = useState<Driver[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [licenseTypes, setLicenseTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Fetch drivers from API
  useEffect(() => {
    fetchDrivers();
  }, [currentPage, perPage]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<PaginatedResponse<Driver>>(
        "/drivers",
        {
          params: {
            page: currentPage,
            per_page: perPage,
          },
        },
      );

      if (response.data.success && response.data.data) {
        const drivers = response.data.data.data || [];
        setAllDrivers(drivers);
        setDisplayDrivers(drivers);

        // Extract unique cities for filter
        const uniqueCities = Array.from(
          new Set(drivers.map((d) => d.city).filter(Boolean)),
        ) as string[];
        setCities(
          uniqueCities.sort().map((city) => ({ id: city, name: city })),
        );

        // Extract unique license types
        const uniqueLicenseTypes = Array.from(
          new Set(drivers.map((d) => d.license_type).filter(Boolean)),
        ) as string[];
        setLicenseTypes(
          uniqueLicenseTypes.sort().map((type) => ({ id: type, name: type })),
        );

        // Set pagination info
        if (response.data.data.last_page) {
          setTotalPages(response.data.data.last_page);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch drivers";
      setError(errorMessage);
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    let result = allDrivers;

    // Apply city filter
    if (selectedCity) {
      result = result.filter((d) => d.city === selectedCity);
    }

    // Apply status filter
    if (selectedStatus) {
      result = result.filter((d) => d.status === selectedStatus);
    }

    // Apply license type filter
    if (selectedLicenseType) {
      result = result.filter((d) => d.license_type === selectedLicenseType);
    }

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        (driver) =>
          `${driver.first_name} ${driver.last_name}`
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (driver.email ?? "").toLowerCase().includes(lowercasedQuery) ||
          (driver.mobile_number ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (driver.driving_license_number ?? "")
            .toLowerCase()
            .includes(lowercasedQuery),
      );
    }

    setDisplayDrivers(result);
  }, [
    searchQuery,
    selectedCity,
    selectedStatus,
    selectedLicenseType,
    allDrivers,
  ]);

  const handleDelete = async (driver: Driver) => {
    if (
      !confirm(
        `Are you sure you want to delete driver ${driver.first_name} ${driver.last_name}?`,
      )
    ) {
      return;
    }

    try {
      const response = await tenantApi.delete(`/drivers/${driver.id}`);

      if (response.data.success) {
        setAllDrivers((prev) => prev.filter((d) => d.id !== driver.id));
        setDisplayDrivers((prev) => prev.filter((d) => d.id !== driver.id));
        alert("Driver deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting driver:", err);
      alert("Failed to delete driver");
    }
  };

  if (error) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeader title="Driver Management" />
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Driver Management"
        buttonText="Add Driver"
        buttonLink="create"
      />

      {/* Filter Controls Section */}
      <div className="my-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SearchComponent
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search by Name, Email, Phone, License..."
        />

        <div className="flex gap-2">
          <SingleFilterHeader
            label="City"
            id="city-filter"
            options={cities}
            value={selectedCity}
            onChange={(city) => {
              setSelectedCity(city);
              setCurrentPage(1);
            }}
            optionValueKey="id"
            optionLabelKey="name"
            placeholder="All Cities"
          />

          <SingleFilterHeader
            label="Status"
            id="status-filter"
            options={[
              { id: "active", name: "Active" },
              { id: "inactive", name: "Inactive" },
              { id: "suspended", name: "Suspended" },
            ]}
            value={selectedStatus}
            onChange={(status) => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            optionValueKey="id"
            optionLabelKey="name"
            placeholder="All Status"
          />

          <SingleFilterHeader
            label="License Type"
            id="license-filter"
            options={licenseTypes}
            value={selectedLicenseType}
            onChange={(type) => {
              setSelectedLicenseType(type);
              setCurrentPage(1);
            }}
            optionValueKey="id"
            optionLabelKey="name"
            placeholder="All Types"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">Loading...</div>
        </div>
      ) : (
        <>
          <Table<Driver>
            list={displayDrivers}
            columns={columns}
            viewUrl="/drivers/show"
            editUrl="/drivers/edit"
            onDelete={handleDelete}
          />

          {/* Pagination Info */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {displayDrivers.length} of {allDrivers.length} drivers
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>
        </>
      )}
    </div>
  );
};

export default DriverIndexPage;
