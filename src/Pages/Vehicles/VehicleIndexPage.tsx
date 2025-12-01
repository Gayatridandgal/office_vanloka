// src/components/vehicles/VehicleIndexPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icons
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaBusAlt,
  FaGasPump,
  FaMapMarkerAlt
} from "react-icons/fa";
import { MdClear, MdDirectionsCar } from "react-icons/md";

// Components
import PageHeader from "../../Components/UI/PageHeader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import {
  TableDiv,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "../../Components/Table/Table";

// Services & Utils
import tenantApi from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Vehicle } from "./Vehicle.types";
import type { PaginatedResponse } from "../../Types/Index";
import { Loader } from "../../Components/UI/Loader";

// Helper for status
const getVehicleStatus = (vehicle: Vehicle): string => {
  const now = new Date();
  if (vehicle.permit_expiry_date && new Date(vehicle.permit_expiry_date) < now) return "Inactive";
  if (vehicle.insurance_expiry_date && new Date(vehicle.insurance_expiry_date) < now) return "Inactive";
  if (vehicle.fitness_expiry_date && new Date(vehicle.fitness_expiry_date) < now) return "Inactive";
  if (vehicle.next_service_due_date && new Date(vehicle.next_service_due_date) < now) return "Maintenance";
  return "Active";
};

const VehicleIndexPage = () => {
  const { showAlert } = useAlert();

  // Data State
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filter Options State
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);

  // Filter Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // 1. Fetch Data
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      const response = await tenantApi.get<PaginatedResponse<Vehicle>>("/vehicles", {
        params: { page: currentPage, per_page: perPage },
      });

      if (response.data.success && response.data.data) {
        const vehicles = response.data.data.data || [];
        setAllVehicles(vehicles);
        setDisplayVehicles(vehicles);

        // Extract Filter Options
        setVehicleTypes(Array.from(new Set(vehicles.map(v => v.vehicle_type).filter(Boolean))) as string[]);
        setFuelTypes(Array.from(new Set(vehicles.map(v => v.fuel_type).filter(Boolean))) as string[]);

        if (response.data.data.last_page) {
          setTotalPages(response.data.data.last_page);
        }
      }
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      showAlert("Failed to fetch vehicles.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, perPage]);

  // 2. Filter Logic
  useEffect(() => {
    let result = allVehicles;

    if (selectedVehicleType) result = result.filter((v) => v.vehicle_type === selectedVehicleType);
    if (selectedFuelType) result = result.filter((v) => v.fuel_type === selectedFuelType);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((v) =>
        (v.vehicle_number ?? "").toLowerCase().includes(lowerQuery) ||
        (v.vehicle_model ?? "").toLowerCase().includes(lowerQuery) ||
        (v.permit_number ?? "").toLowerCase().includes(lowerQuery)
      );
    }

    setDisplayVehicles(result);
  }, [searchQuery, selectedVehicleType, selectedFuelType, allVehicles]);

  // 3. Handlers
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedVehicleType("");
    setSelectedFuelType("");
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Are you sure you want to delete vehicle ${vehicle.vehicle_number}?`)) return;

    try {
      const response = await tenantApi.delete(`/vehicles/${vehicle.id}`);
      if (response.data.success) {
        setAllVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
        showAlert("Vehicle deleted successfully", "success");
      }
    } catch (err) {
      showAlert("Failed to delete vehicle", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white px-2">
      {/* Header */}
      <div className="mx-2">
        <PageHeader
          title="Vehicle Management"
          buttonText="Add Vehicle"
          buttonLink="create"
        />
      </div>

      <div className="px-4 pb-10">
        <div className="mx-auto space-y-4">

          {/* Search & Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <FaSearch className="text-white" size={10} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">Search & Filter</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Search Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Search Vehicles
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Vehicle No, Model, Permit..."
                    className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:border-blue-400"
                  />
                </div>
              </div>

              {/* 2. Type Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Vehicle Type
                </label>
                <div className="relative">
                  <FaBusAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => setSelectedVehicleType(e.target.value)}
                    className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase transition-all appearance-none bg-white shadow-sm hover:border-blue-400 cursor-pointer"
                  >
                    <option value="">All</option>
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Fuel Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Fuel Type
                </label>
                <div className="relative">
                  <FaGasPump className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={selectedFuelType}
                    onChange={(e) => setSelectedFuelType(e.target.value)}
                    className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase transition-all appearance-none bg-white shadow-sm hover:border-blue-400 cursor-pointer"
                  >
                    <option value="">All</option>
                    {fuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedVehicleType || selectedFuelType) && (
              <div className="flex items-center flex-wrap gap-2 pt-4 mt-2 border-t border-slate-50">
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase border border-blue-200">
                    Search: {searchQuery}
                  </span>
                )}
                {selectedVehicleType && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold uppercase border border-purple-200">
                    Type: {selectedVehicleType}
                  </span>
                )}
                {selectedFuelType && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold uppercase border border-orange-200">
                    Fuel: {selectedFuelType}
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold uppercase hover:bg-red-100 transition-all flex items-center gap-1 border border-red-200"
                >
                  <MdClear /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Table Section */}
          <TableDiv>
            {loading ? (
              <div className="py-20">
                <Loader />
              </div>
            ) : displayVehicles.length === 0 ? (
              <EmptyState 
                title="No Vehicles Found" 
                description="Try adjusting filters or add a new vehicle."
                icon={<MdDirectionsCar className="text-slate-300 text-6xl mb-4" />}
              />
            ) : (
              <>
                <TableContainer maxHeight="65vh">
                  <Table>
                    <Thead>
                      <Th width="5%">S.No</Th>
                      <Th>Vehicle Number</Th>
                      <Th>Details</Th>
                      <Th>Ownership</Th>
                      <Th>Status</Th>
                      <Th align="right">Actions</Th>
                    </Thead>

                    <Tbody>
                      {displayVehicles.map((row, index) => {
                        const status = getVehicleStatus(row);
                        let statusStyles = "bg-gray-100 text-gray-800 border-gray-200";
                        if (status === "Active") statusStyles = "bg-green-50 text-green-700 border-green-200";
                        if (status === "Maintenance") statusStyles = "bg-yellow-50 text-yellow-700 border-yellow-200";
                        if (status === "Inactive") statusStyles = "bg-red-50 text-red-700 border-red-200";

                        return (
                          <Tr key={row.id}>
                            {/* S.No */}
                            <Td isMono className="font-bold text-slate-500">
                              {(currentPage - 1) * perPage + index + 1}
                            </Td>

                            {/* Vehicle Number */}
                            <Td>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                   <FaBusAlt size={16} />
                                </div>
                                <span className="font-bold text-slate-800 uppercase text-sm">
                                  {row.vehicle_number}
                                </span>
                              </div>
                            </Td>

                            {/* Details */}
                            <Td>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm">
                                  {row.manufacturer} {row.vehicle_model}
                                </span>
                                <span className="text-xs text-slate-500 mt-0.5 font-medium uppercase">
                                  {row.vehicle_type} • {row.fuel_type} • {row.seating_capacity} Seats
                                </span>
                              </div>
                            </Td>

                            {/* Ownership */}
                            <Td>
                               <span className="text-sm text-slate-700 font-medium">
                                  {row.ownership_type}
                               </span>
                            </Td>

                            {/* Status */}
                            <Td>
                               <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${statusStyles}`}>
                                  {status}
                               </span>
                            </Td>

                            {/* Actions */}
                            <Td align="right">
                              <div className="flex items-center justify-end gap-2">
                                {row.gps_device && (
                                  <Link
                                    to={`/vehicles/track/${row.id}`}
                                    className="flex items-center gap-1 px-2 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold uppercase hover:bg-yellow-100 transition-colors mr-2"
                                    title="Track Vehicle"
                                  >
                                    <FaMapMarkerAlt /> Track
                                  </Link>
                                )}
                                
                                <Link
                                  to={`/vehicles/show/${row.id}`}
                                  className="p-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-sm"
                                  title="View Details"
                                >
                                  <FaEye size={14} />
                                </Link>

                                <Link
                                  to={`/vehicles/edit/${row.id}`}
                                  className="p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm"
                                  title="Edit Vehicle"
                                >
                                  <FaEdit size={14} />
                                </Link>

                                <button
                                  onClick={() => handleDelete(row)}
                                  className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                                  title="Delete Vehicle"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 10 && (
                  <Pagination 
                     currentPage={currentPage}
                     totalPages={totalPages}
                     totalItems={allVehicles.length}
                     onPageChange={setCurrentPage}
                     itemName="Vehicles"
                  />
                )}
              </>
            )}
          </TableDiv>

        </div>
      </div>
    </div>
  );
};

export default VehicleIndexPage;