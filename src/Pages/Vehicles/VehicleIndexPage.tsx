import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import type { PaginatedResponse } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";
import SingleFilterHeader from "../../Components/UI/SingleFilterHeader";
import tenantApi from "../../Services/ApiService";
import { HiRefresh } from "react-icons/hi";

export interface Vehicle {
  id: string | number;
  vehicle_number?: string;
  vehicle_type?: string;
  manufacturer?: string;
  vehicle_model?: string;
  manufacturing_year?: number;
  fuel_type?: string;
  seating_capacity?: number;
  vehicle_color?: string;
  kilometers_driven?: number;
  gps_device_id?: string;
  sim_number?: string;
  beacon_count?: number;
  assigned_driver_id?: string;
  assigned_route_id?: string;
  permit_type?: string;
  permit_number?: string;
  permit_issue_date?: string;
  permit_expiry_date?: string;
  ownership_type?: string;
  owner_name?: string;
  owner_contact_number?: string;
  vendor_name?: string;
  vendor_contact_number?: string;
  organization_name?: string;
  gps_installation_date?: string;
  insurance_provider_name?: string;
  insurance_policy_number?: string;
  insurance_expiry_date?: string;
  fitness_certificate_number?: string;
  fitness_expiry_date?: string;
  pollution_certificate_number?: string;
  pollution_expiry_date?: string;
  last_service_date?: string;
  next_service_due_date?: string;
  tyre_replacement_due_date?: string;
  battery_replacement_due_date?: string;
  fire_extinguisher_status?: string;
  first_aid_kit_status?: string;
  cctv_installed?: boolean;
  panic_button_installed?: boolean;
  vehicle_remarks?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to determine status based on vehicle data
const getVehicleStatus = (vehicle: Vehicle): string => {
  const now = new Date();

  // Check if any compliance is expired
  if (
    vehicle.permit_expiry_date &&
    new Date(vehicle.permit_expiry_date) < now
  ) {
    return "Inactive";
  }
  if (
    vehicle.insurance_expiry_date &&
    new Date(vehicle.insurance_expiry_date) < now
  ) {
    return "Inactive";
  }
  if (
    vehicle.fitness_expiry_date &&
    new Date(vehicle.fitness_expiry_date) < now
  ) {
    return "Inactive";
  }

  // Check if service is due
  if (
    vehicle.next_service_due_date &&
    new Date(vehicle.next_service_due_date) < now
  ) {
    return "Maintenance";
  }

  return "Active";
};

// Column definitions
const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Vehicle, index: number) => index + 1,
  },
  {
    key: "vehicle_number",
    label: "Vehicle Number",
    render: (row: Vehicle) => (
      <div className="font-medium">{row.vehicle_number}</div>
    ),
  },
  {
    key: "details",
    label: "Vehicle Details",
    render: (row: Vehicle) => (
      <div>
        <div className="font-medium text-gray-900">
          {row.manufacturer} {row.vehicle_model}
        </div>
        <div className="text-sm text-gray-500">
          {row.vehicle_type} • {row.fuel_type}
        </div>
      </div>
    ),
  },
  {
    key: "seating_capacity",
    label: "Seats",
  },
  {
    key: "ownership",
    label: "Ownership",
    render: (row: Vehicle) => (
      <div>
        <div className="text-sm">{row.ownership_type}</div>
        {row.organization_name && (
          <div className="text-xs text-gray-500">{row.organization_name}</div>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row: Vehicle) => {
      const status = getVehicleStatus(row);
      const statusColor =
        status === "Active"
          ? "bg-green-100 text-green-800"
          : status === "Maintenance"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800";
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    key: "actions",
    label: "",
    render: (row: Vehicle) => (
      <div className="flex items-center gap-2">
        {row.gps_device_id && (
          <Link
            to={`/vehicles/track/${row.id}`}
            className="text-purple-950 bg-yellow-200 py-1 px-2 rounded-full font-semibold text-sm"
          >
            Track
          </Link>
        )}
      </div>
    ),
  },
];

const VehicleIndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [fuelTypes, setFuelTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Fetch vehicles from API
  useEffect(() => {
    fetchVehicles();
  }, [currentPage, perPage]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tenantApi.get<PaginatedResponse<Vehicle>>(
        "/vehicles",
        {
          params: {
            page: currentPage,
            per_page: perPage,
          },
        },
      );

      if (response.data.success && response.data.data) {
        const vehicles = response.data.data.data || [];
        setAllVehicles(vehicles);
        setDisplayVehicles(vehicles);

        // Extract unique vehicle types
        const uniqueVehicleTypes = Array.from(
          new Set(vehicles.map((v) => v.vehicle_type).filter(Boolean)),
        ) as string[];
        setVehicleTypes(
          uniqueVehicleTypes.sort().map((type) => ({ id: type, name: type })),
        );

        // Extract unique fuel types
        const uniqueFuelTypes = Array.from(
          new Set(vehicles.map((v) => v.fuel_type).filter(Boolean)),
        ) as string[];
        setFuelTypes(
          uniqueFuelTypes.sort().map((type) => ({ id: type, name: type })),
        );

        // Set pagination info
        if (response.data.data.last_page) {
          setTotalPages(response.data.data.last_page);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch vehicles";
      setError(errorMessage);
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    let result = allVehicles;

    // Apply vehicle type filter
    if (selectedVehicleType) {
      result = result.filter((v) => v.vehicle_type === selectedVehicleType);
    }

    // Apply fuel type filter
    if (selectedFuelType) {
      result = result.filter((v) => v.fuel_type === selectedFuelType);
    }

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(
        (vehicle) =>
          (vehicle.vehicle_number ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (vehicle.vehicle_type ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (vehicle.manufacturer ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (vehicle.vehicle_model ?? "")
            .toLowerCase()
            .includes(lowercasedQuery) ||
          (vehicle.permit_number ?? "").toLowerCase().includes(lowercasedQuery),
      );
    }

    setDisplayVehicles(result);
  }, [searchQuery, selectedVehicleType, selectedFuelType, allVehicles]);

  const handleDelete = async (vehicle: Vehicle) => {
    if (
      !confirm(
        `Are you sure you want to delete vehicle ${vehicle.vehicle_number}?`,
      )
    ) {
      return;
    }

    try {
      const response = await tenantApi.delete(`/vehicles/${vehicle.id}`);

      if (response.data.success) {
        // Remove from local state
        setAllVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
        setDisplayVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
        alert("Vehicle deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      alert("Failed to delete vehicle");
    }
  };

  if (error) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeader title="Vehicle Management" />
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Vehicle Management"
        buttonText="Add Vehicle"
        buttonLink="create"
      />

      {/* Filter Controls Section */}
      <div className="my-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SearchComponent
          onSearch={(query) => setSearchQuery(query)}
          placeholder="Search by Vehicle No., Type, Model, Permit..."
        />

        <div className="flex gap-2">
          <SingleFilterHeader
            label="Vehicle Type"
            id="vehicle-type-filter"
            options={vehicleTypes}
            value={selectedVehicleType}
            onChange={(type) => {
              setSelectedVehicleType(type);
              setCurrentPage(1);
            }}
            optionValueKey="id"
            optionLabelKey="name"
            placeholder="All Types"
          />

          <SingleFilterHeader
            label="Fuel Type"
            id="fuel-type-filter"
            options={fuelTypes}
            value={selectedFuelType}
            onChange={(type) => {
              setSelectedFuelType(type);
              setCurrentPage(1);
            }}
            optionValueKey="id"
            optionLabelKey="name"
            placeholder="All Fuels"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <HiRefresh className="w-6 h-6" />
          </div>
        </div>
      ) : (
        <>
          <Table<Vehicle>
            list={displayVehicles}
            columns={columns}
            viewUrl="/vehicles/show"
            editUrl="/vehicles/edit"
            onDelete={handleDelete}
          />

          {/* Pagination Info */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {displayVehicles.length} of {allVehicles.length} vehicles
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleIndexPage;
