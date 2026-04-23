// src/components/roles/IndexPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Edit3, Trash2, Shield, Plus, Eye } from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import adminApi from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Role, Permission } from "./RolesPermissions.types";

const IndexPage = () => {
  // Data State
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State (Client-Side)
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rolesRes = await adminApi.get("/roles");
        const rolesData = rolesRes.data.data || [];
        setRoles(rolesData);
        setFilteredRoles(rolesData);
      } catch (error) {
        showAlert("Failed to fetch data.", "error");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleClearFilters = () => {
    setSearchQuery("");
  };



  const stats = [
    { label: "Total Roles", value: roles.length, icon: <Shield size={20} />, bg: "bg-indigo-50", text: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Shield size={22} className="stroke-[2.5]" />
            <h1 className="text-xl font-900 tracking-wider uppercase">Role Management</h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-0.5">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary-dark">Roles & Permissions</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="create" className="btn btn-primary flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <Plus size={16} />
            <span className="hidden md:inline font-800 text-[11px] uppercase tracking-wider">Add Role</span>
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card flex items-center gap-4 border border-slate-50 shadow-sm bg-white p-4 rounded-xl">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.text}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-900 text-slate-800 tabular-nums">{stat.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>



        <>
          {/* Premium Horizontal Filter Bar */}
          <div className="white-card p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm bg-white rounded-xl mx-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search roles by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-xl text-sm font-600 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
              />
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              <button
                onClick={handleClearFilters}
                className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors shrink-0"
                title="Clear Filters"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Table Module */}
          <div className="white-card overflow-hidden border border-slate-100 shadow-sm bg-white rounded-xl mx-6 mt-6">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader />
                <p className="text-[10px] font-900 text-slate-300 uppercase tracking-widest">Loading Roles...</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="py-24 flex flex-col items-center">
                <EmptyState title="No Roles Found" description="Get started by creating a new user role." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">S.No</th>
                      <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Role Name</th>
                      <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {currentItems.map((role, index) => (
                      <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-xs font-800 text-slate-300 tabular-nums">
                            {((currentPage - 1) * perPage + index + 1).toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 shadow-sm border border-indigo-100/50">
                              <Shield size={16} className="stroke-[2.5]" />
                            </div>
                            <div>
                              <div className="text-sm font-800 text-slate-800 uppercase tracking-tight">{role.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Link to={`/roles_permissions/show/${role.id}`} className="p-2 bg-white hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5" title="View Role">
                              <Eye size={16} />
                            </Link>
                            <Link to={`/roles_permissions/edit/${role.id}`} className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5" title="Edit Role">
                              <Edit3 size={16} />
                            </Link>
                            <button onClick={() => handleDelete(role)} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5" title="Delete Role">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRoles.length > 0 && (
                  <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredRoles.length}
                      onPageChange={setCurrentPage}
                      itemName="Roles"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
};

export default IndexPage;