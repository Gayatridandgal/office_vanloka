import { useState, useEffect } from "react";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import SearchComponent from "../../Components/UI/SearchComponents";
import SingleFilterHeader from "../../Components/UI/SingleFilterHeader";
import tenantApi from "../../Services/ApiService";
import type { Instructor } from "./Instructor.types";

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

// Check if certification is expiring soon
const isCertificationExpiringSoon = (expiryDate?: string): boolean => {
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
    render: (_: Instructor, index: number) => index + 1,
  },
  {
    key: "name",
    label: "Instructor Name",
    render: (row: Instructor) => (
      <div className="flex items-center gap-3">
        {row.profile_photo_path && (
          <img
            src={`http://localhost/storage/${row.profile_photo_path}`}
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
            {row.instructor_certification_number}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    render: (row: Instructor) => (
      <div>
        <div className="text-sm font-medium">{row.mobile_number}</div>
        {row.email && <div className="text-xs text-gray-500">{row.email}</div>}
      </div>
    ),
  },
  {
    key: "certification_info",
    label: "Certification",
    render: (row: Instructor) => (
      <div>
        <div className="text-sm">{row.instructor_type || "—"}</div>
        {row.certification_expiry_date && (
          <div
            className={`text-xs ${
              isCertificationExpiringSoon(row.certification_expiry_date)
                ? "text-red-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Exp:{" "}
            {new Date(row.certification_expiry_date).toLocaleDateString(
              "en-IN",
            )}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "license_info",
    label: "License Info",
    render: (row: Instructor) => (
      <div>
        <div className="text-sm">{row.license_type || "—"}</div>
        {row.license_expiry_date && (
          <div className="text-xs text-gray-500">
            Exp: {new Date(row.license_expiry_date).toLocaleDateString("en-IN")}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "students",
    label: "Students Trained",
    render: (row: Instructor) => (
      <span className="text-sm">{row.no_of_students_trained ?? "—"}</span>
    ),
  },
  {
    key: "rating",
    label: "Rating",
    render: (row: Instructor) => (
      <div className="flex items-center">
        {row.instructor_rating_internal ? (
          <>
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-sm font-medium">
              {row.instructor_rating_internal}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </div>
    ),
  },
  {
    key: "city",
    label: "City",
    render: (row: Instructor) => (
      <span className="text-sm">{row.city_town || "—"}</span>
    ),
  },
];

const InstructorIndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedInstructorType, setSelectedInstructorType] = useState("");
  const [selectedLicenseType, setSelectedLicenseType] = useState("");
  const [displayInstructors, setDisplayInstructors] = useState<Instructor[]>(
    [],
  );
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [instructorTypes, setInstructorTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [licenseTypes, setLicenseTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Fetch instructors from API
  useEffect(() => {
    fetchInstructors();
  }, [currentPage, perPage]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get("/instructors", {
        params: {
          page: currentPage,
          per_page: perPage,
        },
      });

      const instructors = response.data.data || [];
      setAllInstructors(instructors);
      setDisplayInstructors(instructors);

      // Extract unique cities for filter
      const uniqueCities = Array.from(
        new Set(
          instructors.map((i: Instructor) => i.city_town).filter(Boolean),
        ),
      ) as string[];
      setCities(uniqueCities.sort().map((city) => ({ id: city, name: city })));

      // Extract unique instructor types
      const uniqueInstructorTypes = Array.from(
        new Set(
          instructors.map((i: Instructor) => i.instructor_type).filter(Boolean),
        ),
      ) as string[];
      setInstructorTypes(
        uniqueInstructorTypes.sort().map((type) => ({ id: type, name: type })),
      );

      // Extract unique license types
      const uniqueLicenseTypes = Array.from(
        new Set(
          instructors.map((i: Instructor) => i.license_type).filter(Boolean),
        ),
      ) as string[];
      setLicenseTypes(
        uniqueLicenseTypes.sort().map((type) => ({ id: type, name: type })),
      );

      // Set pagination info from meta
      if (response.data.meta?.last_page) {
        setTotalPages(response.data.meta.last_page);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch instructors";
      setError(errorMessage);
      console.error("Error fetching instructors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    let result = allInstructors;

    // Apply city filter
    if (selectedCity) {
      result = result.filter((i) => i.city_town === selectedCity);
    }

    // Apply instructor type filter
    if (selectedInstructorType) {
      result = result.filter(
        (i) => i.instructor_type === selectedInstructorType,
      );
    }

    // Apply license type filter
    if (selectedLicenseType) {
      result = result.filter((i) => i.license_type === selectedLicenseType);
    }

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        (instructor) =>
          `${instructor.first_name} ${instructor.last_name}`
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (instructor.email ?? "").toLowerCase().includes(lowercasedQuery) ||
          (instructor.mobile_number ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (instructor.instructor_certification_number ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (instructor.affiliated_driving_school_name ?? "")
            .toLowerCase()
            .includes(lowercasedQuery),
      );
    }

    setDisplayInstructors(result);
  }, [
    searchQuery,
    selectedCity,
    selectedInstructorType,
    selectedLicenseType,
    allInstructors,
  ]);

  const handleDelete = async (instructor: Instructor) => {
    if (
      !confirm(
        `Are you sure you want to delete instructor ${instructor.first_name} ${instructor.last_name}?`,
      )
    ) {
      return;
    }

    try {
      await tenantApi.delete(`/instructors/${instructor.id}`);
      setAllInstructors((prev) => prev.filter((i) => i.id !== instructor.id));
      setDisplayInstructors((prev) =>
        prev.filter((i) => i.id !== instructor.id),
      );
      alert("Instructor deleted successfully");
    } catch (err) {
      console.error("Error deleting instructor:", err);
      alert("Failed to delete instructor");
    }
  };

  if (error) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeader title="Instructor Management" />
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Instructor Management"
        buttonText="Add Instructor"
        buttonLink="create"
      />

      {/* Filter Controls Section */}
      <div className="my-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SearchComponent
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search by Name, Email, Phone, Certification..."
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
            label="Instructor Type"
            id="instructor-type-filter"
            options={instructorTypes}
            value={selectedInstructorType}
            onChange={(type) => {
              setSelectedInstructorType(type);
              setCurrentPage(1);
            }}
            optionValueKey="id"
            optionLabelKey="name"
            placeholder="All Types"
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
            placeholder="All Licenses"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">Loading...</div>
        </div>
      ) : (
        <>
          <Table<Instructor>
            list={displayInstructors}
            columns={columns}
            viewUrl="/instructors/show"
            editUrl="/instructors/edit"
            onDelete={handleDelete}
          />

          {/* Pagination Info */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {displayInstructors.length} of {allInstructors.length}{" "}
            instructors
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorIndexPage;
