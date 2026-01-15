// src/components/roles/IndexPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Icons
import { FaEdit, FaTrash, FaUserShield, FaSearch } from "react-icons/fa";
import { MdAdminPanelSettings, MdClear } from "react-icons/md";

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
  Td
} from "../../Components/Table/Table";

// Logic & Types
import { useAlert } from "../../Context/AlertContext";
import adminApi from "../../Services/ApiService";
import type { Role } from "./RolesPermissions.types";
import { BiLoader } from "react-icons/bi";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";

const IndexPage = () => {
  // Data State
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State (Client-Side)
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  const { showAlert } = useAlert();

  // 1. Fetch data
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await adminApi.get("/roles");
        const data = response.data.data || [];
        setRoles(data);
        setFilteredRoles(data);
      } catch (error) {
        showAlert("Failed to fetch roles.", "error");
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [showAlert]);

  // 2. Filter Logic
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRoles(roles);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = roles.filter((role) =>
        role.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredRoles(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, roles]);

  // 3. Pagination Logic
  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentItems = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / perPage);

  // Handlers
  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      const response = await adminApi.delete(`/roles/${role.id}`);

      const updatedList = roles.filter((r) => r.id !== role.id);
      setRoles(updatedList); // This will trigger filter effect automatically

      showAlert(response.data.message || "Role deleted successfully.", "success");
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Failed to delete role.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white px-2">
      {/* Header */}
      <div className="mx-4">
        <PageHeader
          title="Role Management"
          buttonText="Add Role"
          buttonLink="create"
        />
      </div>

      <div className="px-4 pb-10">
        <div className="mx-auto space-y-4">

          {/* Search Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <FaSearch className="text-white" size={10} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase">Search Roles</h3>
              </div>
            </div>

            <div className="mt-4 max-w-md">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Search by Name
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Manager, Admin..."
                  className="w-full pl-12 pr-4 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:border-blue-400"
                />
              </div>
              {/* Active Filters */}
              {(searchQuery) && (
                <div className="flex items-center flex-wrap gap-1 mt-3">
                  {searchQuery && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase border border-blue-200">
                      {searchQuery}
                    </span>
                  )}

                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold uppercase hover:bg-red-100 transition-all flex items-center gap-1 border border-red-200"
                  >
                    <MdClear /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table Area */}
          <TableDiv>
            {loading ? (
              <div className="py-20">
                <BiLoader />
              </div>
            ) : filteredRoles.length === 0 ? (
              <EmptyState
                title="No Roles Found"
                description="Get started by creating a new user role."
                icon={<MdAdminPanelSettings className="text-slate-300 text-6xl mb-4" />}
              />
            ) : (
              <>
                <TableContainer maxHeight="70vh">
                  <Table>
                    <Thead>
                      <Th >S.No</Th>
                      <Th align="left">Role Name</Th>
                      <Th align="center">Actions</Th>
                    </Thead>

                    <Tbody>
                      {currentItems.map((role, index) => (
                        <Tr key={role.id}>
                          {/* S.No */}
                          <Td isMono className="font-bold text-slate-500">
                            {(currentPage - 1) * perPage + index + 1}
                          </Td>

                          {/* Role Name */}
                          <Td>
                            <div className="flex justify-start items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg text-purple-600 shadow-sm">
                                <FaUserShield size={16} />
                              </div>
                              <span className="font-bold text-slate-700 uppercase tracking-wide text-sm">
                                {role.name}
                              </span>
                            </div>
                          </Td>

                          {/* Actions */}
                          <Td>
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit Button */}
                              <Link
                                to={`/roles_permissions/edit/${role.id}`}
                                className="group p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm"
                                title="Edit Role"
                              >
                                <FaEdit size={14} />
                              </Link>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(role)}
                                className="group p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                                title="Delete Role"
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

                {/* Pagination */}
                {currentItems.length > 10 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredRoles.length}
                    onPageChange={setCurrentPage}
                    itemName="Roles"
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

export default IndexPage;