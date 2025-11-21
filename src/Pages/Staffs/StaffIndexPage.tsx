// src/components/staff/StaffIndexPage.tsx
import { useState, useEffect } from "react";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import SearchComponent from "../../Components/UI/SearchComponents";
import { useAlert } from "../../Context/AlertContext";
import type { Staff } from "./Staff.types";
import { useToolkit } from "../../Utils/Toolkit";
import { FcNext, FcPrevious } from "react-icons/fc";
import tenantApi, { asset } from "../../Services/ApiService";
import { Loader } from "../../Components/UI/Loader";

// Column definitions
const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Staff, index: number) => index + 1,
  },
  {
    key: "name",
    label: "Name",
    render: (row: Staff) => (
      <div className="flex items-center">
        {row.photo ? (
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={`${asset}/${row.photo}`}
            alt={`${row.first_name} ${row.last_name}`}
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-black font-semibold">
            {row.first_name?.charAt(0)}
            {row.last_name?.charAt(0)}
          </div>
        )}
        <div className="ml-4">
          <div className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "employee_id",
    label: "Employee ID",
    render: (row: Staff) => (
      <span className="text-sm font-mono text-gray-700">{row.employee_id}</span>
    ),
  },
  {
    key: "designation",
    label: "Designation",
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "roles",
    label: "Roles",
    render: (row: Staff) => (
      <div className="flex flex-wrap gap-1">
        {row.roles && row.roles.length > 0 ? (
          row.roles.map((roleName, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 uppercase"
            >
              {roleName}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">No roles assigned</span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row: Staff) => {
      const statusColor =
        row.status === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
        >
          {row.status}
        </span>
      );
    },
  },
];

const StaffIndexPage = () => {
  const { can } = useToolkit();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  const { showAlert } = useAlert();

  // Fetch staff data from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;

      const response = await tenantApi.get("/employees", { params });

      const { data, current_page, last_page, per_page, total } =
        response.data.data;

      setStaffList(data);
      setFilteredStaff(data);
      setCurrentPage(current_page);
      setTotalPages(last_page);
      setPerPage(per_page);
      setTotal(total);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      setError(err.response?.data?.message || "Failed to load staff data.");
      showAlert("Failed to load staff data.", "error");
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchStaff();
  }, [currentPage, searchQuery, statusFilter, roleFilter, perPage]);

  // Handle search with debouncing
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle role filter change
  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  // Handle delete
  // const handleDelete = async (id: number) => {
  //   if (!window.confirm("Are you sure you want to delete this staff member?")) {
  //     return;
  //   }

  //   try {
  //     await tenantApi.delete(`/employees/${id}`);
  //     showAlert("Staff member deleted successfully!", "success");
  //     fetchStaff(); // Refresh the list
  //   } catch (err: any) {
  //     console.error("Error deleting staff:", err);
  //     showAlert(
  //       err.response?.data?.message || "Failed to delete staff member.",
  //       "error"
  //     );
  //   }
  // };

  // Loading state
  if (loading && staffList.length === 0) {
    return (
      <Loader />
    );
  }

  // Error state
  if (error && staffList.length === 0) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeader
          title="Staff Management"
          buttonText="Add Staff"
          buttonLink="/staff/create"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchStaff}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Staff Management"
        buttonText="Add Staff"
        buttonLink="/staff/create"
      />

      {/* Filters Section */}
      <div className="my-4 space-y-4">
        {/* Search Component */}
        <SearchComponent
          onSearch={handleSearch}
          placeholder="Search by Name, Email, Employee ID, or Designation..."
        />

        {/* Filter Row */}
        <div className="grid grid-cols-1 text-sm md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm uppercase font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm uppercase font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <input
              type="text"
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              placeholder="Enter role name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
            />
          </div>

          {/* Per Page Selector */}
          <div>
            <label className="block text-sm uppercase font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-400"
            >

              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="150">150</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : filteredStaff.length > 0 ? (
        <>
          <Table<Staff>
            list={filteredStaff}
            columns={columns}
            // editUrl="/staff/edit"
            editUrl={can("edit users") ? "/staff/edit" : undefined}
          // onDelete={handleDelete}
          // viewUrl="/staff/show" // Uncomment if you have a show page
          />

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="py-1 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FcPrevious size={25} />
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg transition ${currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="py-1 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FcNext size={28} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-600 text-md uppercase">No data found..</p>
          <p className="text-gray-500 uppercase text-xs">
            Try adjusting your filters or add a new staff member
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffIndexPage;
