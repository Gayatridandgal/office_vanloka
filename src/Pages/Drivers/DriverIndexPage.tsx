import { useState, useEffect } from "react";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import SearchComponent from "../../Components/UI/SearchComponents";
import SingleFilterHeader from "../../Components/UI/SingleFilterHeader";
import tenantApi from "../../Services/ApiService";
import type { Driver } from "./Driver.types";
import type { PaginatedResponse } from "../../Types/Index";

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

// Helper to get license/insurance info from JSON array
const getLicenseInfo = (licenseInsurance?: any[]): string => {
  if (!licenseInsurance || !Array.isArray(licenseInsurance) || licenseInsurance.length === 0) {
    return "—";
  }
  
  const licenseItem = licenseInsurance.find(item => item.type === 'license');
  if (licenseItem && licenseItem.exp_date) {
    return new Date(licenseItem.exp_date).toLocaleDateString("en-IN");
  }
  
  return "—";
};

// Check if any license is expiring soon
const hasExpiringLicense = (licenseInsurance?: any[]): boolean => {
  if (!licenseInsurance || !Array.isArray(licenseInsurance)) return false;
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return licenseInsurance.some(item => {
    if (!item.exp_date) return false;
    const expiry = new Date(item.exp_date);
    return expiry <= thirtyDaysFromNow && expiry >= today;
  });
};

// Column definitions
const columns = [
  {
    key: "sno",
    label: "S.No",
    render: (_: Driver, index: number) => (
      <span className="text-sm font-medium">{index + 1}</span>
    ),
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
          <div className="text-xs text-gray-500 uppercase">
            {row.employee_id || "N/A"}
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
        <div className="text-sm font-medium uppercase">{row.mobile_number}</div>
        {row.email && (
          <div className="text-xs text-gray-500">{row.email}</div>
        )}
      </div>
    ),
  },
  {
    key: "address",
    label: "Location",
    render: (row: Driver) => (
      <div>
        <div className="text-sm font-medium uppercase">{row.city || "—"}</div>
        {row.state && (
          <div className="text-xs text-gray-500 uppercase">{row.state}</div>
        )}
      </div>
    ),
  },
  {
    key: "license_info",
    label: "License/Insurance",
    render: (row: Driver) => {
      const licenseCount = row.license_insurance?.length || 0;
      const isExpiring = hasExpiringLicense(row.license_insurance);
      const expiryDate = getLicenseInfo(row.license_insurance);
      
      return (
        <div>
          <div className="text-sm font-medium uppercase">
            {licenseCount} Record{licenseCount !== 1 ? 's' : ''}
          </div>
          {expiryDate !== "—" && (
            <div
              className={`text-xs uppercase ${
                isExpiring ? "text-red-600 font-bold" : "text-gray-500"
              }`}
            >
              Exp: {expiryDate}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "experience",
    label: "Experience",
    render: (row: Driver) => (
      <span className="text-sm uppercase">
        {row.driving_experience ? `${row.driving_experience} YRS` : "—"}
      </span>
    ),
  },
  {
    key: "employment",
    label: "Employment",
    render: (row: Driver) => (
      <span className="text-xs uppercase px-2 py-1 bg-blue-50 text-blue-700 rounded">
        {row.employment_type || "N/A"}
      </span>
    ),
  },
  {
    key: "verification",
    label: "Verification",
    render: (row: Driver) => (
      <div className="flex flex-col gap-1">
        {row.medical_fitness === "YES" && (
          <span className="text-xs uppercase px-2 py-0.5 bg-green-50 text-green-700 rounded">
            ✓ Medical
          </span>
        )}
        {row.police_verification === "YES" && (
          <span className="text-xs uppercase px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            ✓ Police
          </span>
        )}
        {row.safety_training_completion === "YES" && (
          <span className="text-xs uppercase px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
            ✓ Training
          </span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row: Driver) => (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getStatusColor(
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
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [displayDrivers, setDisplayDrivers] = useState<Driver[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [employmentTypes, setEmploymentTypes] = useState<
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

        // Extract unique employment types
        const uniqueEmploymentTypes = Array.from(
          new Set(drivers.map((d) => d.employment_type).filter(Boolean)),
        ) as string[];
        setEmploymentTypes(
          uniqueEmploymentTypes
            .sort()
            .map((type) => ({ id: type, name: type })),
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

    // Apply employment type filter
    if (selectedEmploymentType) {
      result = result.filter((d) => d.employment_type === selectedEmploymentType);
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
          (driver.employee_id ?? "")
            .toLowerCase()
            .includes(lowercasedQuery),
      );
    }

    setDisplayDrivers(result);
  }, [
    searchQuery,
    selectedCity,
    selectedStatus,
    selectedEmploymentType,
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
          placeholder="Search by Name, Email, Phone, Employee ID..."
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
            label="Employment"
            id="employment-filter"
            options={employmentTypes}
            value={selectedEmploymentType}
            onChange={(type) => {
              setSelectedEmploymentType(type);
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600 text-sm uppercase">Loading Drivers...</p>
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
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600 uppercase">
            <span>
              Showing {displayDrivers.length} of {allDrivers.length} drivers
            </span>
            {totalPages > 1 && (
              <span className="font-semibold">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DriverIndexPage;
