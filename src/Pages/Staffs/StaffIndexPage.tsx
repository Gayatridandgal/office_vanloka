// src/components/staff/StaffIndexPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icons
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaUserTie,
  FaPhoneAlt,
  FaIdBadge
} from "react-icons/fa";
import { MdEmail, MdWork, MdClear } from "react-icons/md";

// Components
import PageHeader from "../../Components/UI/PageHeader";
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
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Staff } from "./Staff.types";
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";

const StaffIndexPage = () => {
  // const { can } = useToolkit();
  const { showAlert } = useAlert();

  // Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);

  // 1. Fetch Data
  const fetchStaff = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        per_page: perPage,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
      };

      const response = await tenantApi.get("/employees", { params });
      const { data, current_page, last_page, total } = response.data.data;

      setStaffList(data);
      setCurrentPage(current_page);
      setTotalPages(last_page);
      setTotalItems(total);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      showAlert("Failed to load staff data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search to prevent too many API calls
    const timer = setTimeout(() => {
      fetchStaff();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, statusFilter, roleFilter, perPage]);

  // 2. Handlers
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setRoleFilter("");
    setCurrentPage(1);
  };

  // Helper: Render Avatar
  const renderAvatar = (row: Staff) => {
    if (row.photo) {
      return (
        <img
          className="h-10 w-10 rounded-full object-cover border border-slate-200"
          src={`${tenantAsset}${row.photo}`}
          alt={`${row.first_name}`}
        />
      );
    }
    return (
      <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm shadow-sm">
        {row.first_name?.charAt(0)}
        {row.last_name?.charAt(0)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white px-2">
      {/* Header */}
      <div className="mx-4">
        <PageHeader
          title="Staff Management"
          buttonText="Add Staff"
          buttonLink="/staff/create"
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

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* 1. Search Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Search Staff
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Name, Email, ID..."
                    className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:border-blue-400"
                  />
                </div>
              </div>

              {/* 2. Status Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Filter by Status
                </label>
                <div className="relative">
                  <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase transition-all appearance-none bg-white shadow-sm hover:border-blue-400 cursor-pointer"
                  >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* 3. Role Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  Filter by Role
                </label>
                <div className="relative">
                  <FaUserTie className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Enter Role Name..."
                    className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter || roleFilter) && (
              <div className="flex items-center flex-wrap gap-1 mt-3">
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase border border-blue-200">
                    {searchQuery}
                  </span>
                )}
                {statusFilter && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase border border-green-200">
                    {statusFilter}
                  </span>
                )}
                {roleFilter && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold uppercase border border-purple-200">
                    {roleFilter}
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
            ) : staffList.length === 0 ? (
              <EmptyState
                title="No Staff Found"
                description="Try adjusting your filters or add a new staff member."
                icon={<FaUserTie className="text-slate-300 text-6xl mb-4" />}
              />
            ) : (
              <>
                <TableContainer maxHeight="65vh">
                  <Table>
                    <Thead>
                      <Th >S.No</Th>
                      <Th>Staff Details</Th>
                      <Th>Employee ID</Th>
                      <Th>Designation</Th>
                      <Th>Roles</Th>
                      <Th>Status</Th>
                      {/* {can("edit users") && <Th align="right">Actions</Th>} */}
                      <Th align="center">Actions</Th>
                    </Thead>

                    <Tbody>
                      {staffList.map((row, index) => (
                        <Tr key={row.id}>
                          {/* S.No */}
                          <Td isMono className="font-bold text-slate-500">
                            {(currentPage - 1) * perPage + index + 1}
                          </Td>

                          {/* Name & Avatar */}
                          <Td>
                            <div className="flex items-center gap-3">
                              {renderAvatar(row)}
                              <div>
                                <div className="font-bold text-slate-800 uppercase text-sm">
                                  {row.first_name} {row.last_name}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-semibold">
                                  <MdEmail className="text-slate-400" />
                                  {row.email}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 md:hidden">
                                  <FaPhoneAlt className="text-slate-400" />
                                  {row.phone}
                                </div>
                              </div>
                            </div>
                          </Td>

                          {/* Employee ID */}
                          <Td>
                            <div className="flex items-center gap-2">
                              <FaIdBadge className="text-slate-300" />
                              <span className="font-mono font-bold text-slate-700 text-sm">
                                {row.employee_id}
                              </span>
                            </div>
                          </Td>

                          {/* Designation */}
                          <Td>
                            <div className="flex items-center gap-2 text-slate-700 font-semibold uppercase text-xs">
                              <MdWork className="text-slate-400" />
                              {row.designation || "-"}
                            </div>
                          </Td>

                          {/* Roles */}
                          <Td>
                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                              {row.roles && row.roles.length > 0 ? (
                                row.roles.map((roleName, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 text-[10px] font-bold rounded bg-purple-50 text-purple-700 uppercase border border-purple-100 tracking-wide"
                                  >
                                    {roleName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic font-semibold">No roles</span>
                              )}
                            </div>
                          </Td>

                          {/* Status */}
                          <Td>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-sm
                                ${row.status === 'active'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {row.status}
                            </span>
                          </Td>

                          {/* Actions */}
                          {/* {can("edit users") && ( */}
                          <Td align="center">
                            <Link
                              to={`/staff/edit/${row.id}`}
                              className="inline-flex p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm"
                              title="Edit Staff"
                            >
                              <FaEdit size={14} />
                            </Link>
                          </Td>
                          {/* )} */}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                {/* Pagination (Reusable) */}
                {staffList.length > 10 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    itemName="Staff"
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

export default StaffIndexPage;