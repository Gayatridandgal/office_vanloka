// src/components/drivers/DriverIndexPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icons
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserTie,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdEmail, MdClear } from "react-icons/md";

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

import type { Driver } from "./Driver.types";
import type { PaginatedResponse } from "../../Types/Index";
import { Loader } from "../../Components/UI/Loader";
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import { DUMMY_USER_IMAGE } from "../../Utils/Toolkit";

// --- Helpers ---

const getStatusStyles = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "active": return "bg-green-50 text-green-700 border-green-200";
    case "inactive": return "bg-red-100 text-red-600 border-red-200";
    default: return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const DriverIndexPage = () => {
  // Data State
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [displayDrivers, setDisplayDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter Options State
  const [cities, setCities] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);

  // Filter Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployment, setSelectedEmployment] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(15);

  // 1. Fetch Data
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await tenantApi.get<PaginatedResponse<Driver>>("/drivers", {
        params: { page: currentPage, per_page: perPage },
      });

      console.log(response.data.data);
      if (response.data.success && response.data.data) {
        const drivers = response.data.data.data || [];
        setAllDrivers(drivers);
        setDisplayDrivers(drivers);

        // Extract Options
        setCities(Array.from(new Set(drivers.map(d => d.city).filter(Boolean))) as string[]);
        setEmploymentTypes(Array.from(new Set(drivers.map(d => d.employment_type).filter(Boolean))) as string[]);

        setTotalPages(response.data.data.last_page);
        setTotalItems(response.data.data.total);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, perPage]);

  // 2. Filter Logic
  useEffect(() => {
    let result = allDrivers;

    if (selectedCity) result = result.filter((d) => d.city === selectedCity);
    if (selectedStatus) result = result.filter((d) => d.status === selectedStatus);
    if (selectedEmployment) result = result.filter((d) => d.employment_type === selectedEmployment);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(lowerQuery) ||
        (d.email ?? "").toLowerCase().includes(lowerQuery) ||
        (d.mobile_number ?? "").includes(lowerQuery) ||
        (d.employee_id ?? "").toLowerCase().includes(lowerQuery)
      );
    }

    setDisplayDrivers(result);
  }, [searchQuery, selectedCity, selectedStatus, selectedEmployment, allDrivers]);

  // 3. Handlers
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedStatus("");
    setSelectedEmployment("");
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Delete driver ${driver.first_name}?`)) return;
    try {
      const response = await tenantApi.delete(`/drivers/${driver.id}`);
      if (response.data.success) {
        setAllDrivers(prev => prev.filter(d => d.id !== driver.id));
        setDisplayDrivers(prev => prev.filter(d => d.id !== driver.id)); // Optimistic UI update
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const renderAvatar = (driver: Driver) => {
    const imgSrc = driver.profile_photo
      ? `${tenantAsset}${driver.profile_photo}`
      : `${DUMMY_USER_IMAGE}`;

    return (
      <img
        src={imgSrc}
        alt={driver.first_name}
        className="h-10 w-10 rounded-full object-cover border border-slate-200"
        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${driver.first_name}+${driver.last_name}&background=random`; }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white px-2">
      <div className="mx-4">
        <PageHeader
          title="Driver Management"
          buttonText="Add Driver"
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, Phone"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">City</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="">All</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Status</label>
                <div className="relative">
                  <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>

                  </select>
                </div>
              </div>

              {/* Employment Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Employment</label>
                <div className="relative">
                  <FaUserTie className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    value={selectedEmployment}
                    onChange={(e) => setSelectedEmployment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="">All</option>
                    {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCity || selectedStatus || selectedEmployment) && (
              <div className="flex items-center flex-wrap gap-1 mt-2">
                {searchQuery && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold uppercase border border-amber-200">
                    {searchQuery}
                  </span>
                )}
                {selectedCity && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase border border-blue-200"> {selectedCity}</span>}
                {selectedStatus && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase border border-green-200"> {selectedStatus}</span>}
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
              <div className="py-20"><Loader /></div>
            ) : displayDrivers.length === 0 ? (
              <EmptyState
                title="No Drivers Found"
                description="Try adjusting your filters or add a new driver."
                icon={<FaUserTie className="text-slate-300 text-6xl mb-4" />}
              />
            ) : (
              <>
                <TableContainer maxHeight="70vh">
                  <Table>
                    <Thead>
                      <Th>S.No</Th>
                      <Th>Driver Profile</Th>
                      <Th>Contact</Th>
                      <Th>Location</Th>


                      <Th>Status</Th>
                      <Th align="center">Actions</Th>
                    </Thead>

                    <Tbody>
                      {displayDrivers.map((row, index) => {

                        return (
                          <Tr key={row.id}>
                            <Td isMono className="font-bold text-slate-500">
                              {(currentPage - 1) * Number(perPage) + index + 1}
                            </Td>

                            {/* Profile */}
                            <Td>
                              <div className="flex items-center gap-3">
                                {renderAvatar(row)}
                                <div>
                                  <div className="font-bold text-slate-800 uppercase text-sm">
                                    {row.first_name} {row.last_name}
                                  </div>
                                  <div className="text-xs text-slate-500 font-semibold mt-0.5">
                                    {row.employee_id || ""}
                                  </div>
                                </div>
                              </div>
                            </Td>

                            {/* Contact */}
                            <Td>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-700 text-sm font-semibold">
                                  <FaPhoneAlt className="text-slate-400 text-xs" />
                                  {row.mobile_number}
                                </div>
                                {row.email && (
                                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                    <MdEmail className="text-slate-400" />
                                    {row.email}
                                  </div>
                                )}
                              </div>
                            </Td>

                            {/* Location */}
                            <Td>
                              <div className="text-sm font-bold text-slate-700 uppercase">{row.city || "—"}</div>
                              <div className="text-xs text-slate-500">{row.state}</div>
                            </Td>



                            {/* Status */}
                            <Td>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getStatusStyles(row.status)}`}>
                                {row.status}
                              </span>
                            </Td>

                            {/* Actions */}
                            <Td>
                              <div className="flex items-center justify-center gap-2">
                                <Link to={`/drivers/show/${row.id}`} className="p-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                                  <FaEye size={14} />
                                </Link>
                                <Link to={`/drivers/edit/${row.id}`} className="p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                  <FaEdit size={14} />
                                </Link>
                                <button onClick={() => handleDelete(row)} className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
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

                {/* Pagination (Conditional) */}
                {totalPages > 10 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    itemName="Drivers"
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

export default DriverIndexPage;