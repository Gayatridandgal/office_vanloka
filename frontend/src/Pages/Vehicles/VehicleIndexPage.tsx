import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaEye, FaMapMarkerAlt, FaSearch, FaTrash } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import PageHeader from "../../Components/UI/PageHeader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import { TableDiv, TableContainer, Table, Thead, Tbody, Tr, Th, Td } from "../../Components/Table/Table";
import { Loader } from "../../Components/UI/Loader";
import tenantApi from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Vehicle } from "./Vehicle.types";
import type { PaginatedResponse } from "../../Types/Index";
import { formatDateTime } from "../../Utils/Toolkit";

const VehicleIndexPage = () => {
  const { showAlert } = useAlert();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 15;

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await tenantApi.get<PaginatedResponse<Vehicle>>("/vehicles", {
        params: { page: currentPage, per_page: perPage },
      });

      if (response.data.success && response.data.data) {
        setVehicles(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      showAlert("Failed to fetch vehicles.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVehicles();
  }, [currentPage]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    if (statusFilter) {
      result = result.filter((vehicle) => (vehicle.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      const value = searchQuery.toLowerCase();
      result = result.filter((vehicle) =>
        (vehicle.vehicle_name || "").toLowerCase().includes(value) ||
        (vehicle.vehicle_number || "").toLowerCase().includes(value) ||
        (vehicle.model || "").toLowerCase().includes(value) ||
        (vehicle.make || "").toLowerCase().includes(value)
      );
    }

    return result;
  }, [vehicles, searchQuery, statusFilter]);

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Delete vehicle ${vehicle.vehicle_number}?`)) return;

    try {
      const response = await tenantApi.delete(`/vehicles/${vehicle.id}`);
      if (response.data.success) {
        setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
        showAlert("Vehicle deleted successfully.", "success");
      }
    } catch (error) {
      showAlert("Failed to delete vehicle.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white px-2">
      <div className="mx-4">
        <PageHeader title="Vehicle Management" buttonText="Add Vehicle" buttonLink="create" />
      </div>

      <div className="px-4 pb-10">
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <FaSearch className="text-white" size={10} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase">Search & Filter</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Search Vehicles</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, number, model, make..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase bg-white"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                }}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold uppercase flex items-center gap-2"
              >
                <MdClear /> Clear
              </button>
            </div>
          </div>
        </div>

        <TableDiv>
          {loading ? (
            <div className="py-20">
              <Loader />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <EmptyState
              title="No Vehicles Found"
              description="Add a vehicle to start storing records in Azure PostgreSQL."
            />
          ) : (
            <>
              <TableContainer maxHeight="70vh">
                <Table>
                  <Thead>
                    <Th>S.No</Th>
                    <Th>Vehicle</Th>
                    <Th>Number</Th>
                    <Th>Details</Th>
                    <Th>Status</Th>
                    <Th>Telemetry</Th>
                    <Th align="center">Actions</Th>
                  </Thead>

                  <Tbody>
                    {filteredVehicles.map((vehicle, index) => (
                      <Tr key={vehicle.id}>
                        <Td isMono className="font-bold text-slate-500">
                          {(currentPage - 1) * perPage + index + 1}
                        </Td>
                        <Td>
                          <div className="font-bold text-slate-800 uppercase text-sm">{vehicle.vehicle_name}</div>
                        </Td>
                        <Td>
                          <div className="font-bold text-slate-700 uppercase text-sm">{vehicle.vehicle_number}</div>
                        </Td>
                        <Td>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 text-sm uppercase">
                              {vehicle.make || "-"} {vehicle.model || ""}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5 font-medium uppercase">
                              Capacity: {vehicle.capacity ?? "-"}
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border bg-slate-100 text-slate-700 border-slate-200">
                            {vehicle.status || "-"}
                          </span>
                        </Td>
                        <Td>
                          <div className="text-xs text-slate-600 uppercase font-semibold space-y-1">
                            <div>Battery: {vehicle.battery ?? "-"}</div>
                            <div>Speed: {vehicle.speed ?? "-"}</div>
                            <div>{formatDateTime(vehicle.lastGpsUpdate ?? null)}</div>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/vehicles/track/${vehicle.vehicle_number}`}
                              className="p-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-600 hover:text-white transition-all duration-200 shadow-sm"
                              title="Track Vehicle"
                            >
                              <FaMapMarkerAlt size={14} />
                            </Link>

                            <Link
                              to={`/vehicles/show/${vehicle.id}`}
                              className="p-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-sm"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </Link>

                            <Link
                              to={`/vehicles/edit/${vehicle.id}`}
                              className="p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm"
                              title="Edit Vehicle"
                            >
                              <FaEdit size={14} />
                            </Link>

                            <button
                              onClick={() => handleDelete(vehicle)}
                              className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                              title="Delete Vehicle"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={vehicles.length}
                  onPageChange={setCurrentPage}
                  itemName="Vehicles"
                />
              )}
            </>
          )}
        </TableDiv>
      </div>
    </div>
  );
};

export default VehicleIndexPage;
