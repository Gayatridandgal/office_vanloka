import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Edit3, Trash2, Shield, Plus, Eye } from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import adminApi from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Role, Permission } from "./RolesPermissions.types";

// --- Components ---
const Badge = ({ variant, children }: { variant: string; children: React.ReactNode }) => {
  const variants: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    slate: "bg-slate-50 text-slate-500 border-slate-100",
  };
  const styleClass = variants[variant] ?? variants.slate;
  return (
    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-900 uppercase tracking-wider ${styleClass}`}>
      {children}
    </span>
  );
};

const IndexPage = () => {
  // Data State
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRole, setExpandedRole] = useState<number | null>(null);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Pagination State (Client-Side)
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rolesRes = await adminApi.get("/roles");
      // The backend returns { success: true, data: [...] }
      setRoles(rolesRes.data.data || []);
    } catch (error) {
      showAlert("Failed to fetch roles.", "error");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showAlert]);

  const handleExpand = async (roleId: number) => {
    if (expandedRole === roleId) {
      setExpandedRole(null);
      return;
    }

    setExpandedRole(roleId);

    const role = roles.find(r => r.id === roleId);
    if (role && !role.permissions) {
      try {
        const res = await adminApi.get(`/roles/${roleId}`);
        const roleData = res.data.data;
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: roleData.permissions } : r));
      } catch (err) {
        console.error("Failed to load permissions", err);
      }
    }
  };

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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight uppercase">
            <Shield size={24} /> Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500 font-medium">Configure system access and user authorities.</p>
        </div>
        <button className="w-full sm:w-auto btn btn-primary flex justify-center items-center gap-2" onClick={() => navigate("/roles_permissions/create")}>
          <Plus size={16} /> Add Role
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 underline">Total Roles</p>
            <p className="text-xl font-bold">{roles.length}</p>
          </div>
        </div>



        <>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Search roles..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <button
            onClick={handleClearFilters}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors bg-slate-50 border-none"
            title="Clear Filters"
          >
            <Filter size={18} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">#</th>
                      <th className="px-6 py-4">Role & Configuration</th>
                      <th className="px-6 py-4 text-center">Permissions Count</th>
                      <th className="px-6 py-4 text-right pr-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {currentItems.map((role, index) => (
                      <React.Fragment key={role.id}>
                        <tr 
                          className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${expandedRole === role.id ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => handleExpand(role.id)}
                        >
                          <td className="px-6 py-4">
                            <span className="text-xs font-800 text-slate-300 tabular-nums">
                              {((currentPage - 1) * perPage + index + 1).toString().padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Shield size={18} />
                              </div>
                              <div>
                                <p className="font-900 text-slate-800 uppercase tracking-tight">{role.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Authorised Access Role</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div 
                              className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-900 uppercase tracking-widest transition-all ${expandedRole === role.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}
                            >
                              {role.permissions_count || role.permissions?.length || 0} Modules
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right pr-12">
                            <div className="flex justify-end items-center gap-1">
                              <Link to={`/roles_permissions/show/${role.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View Role" onClick={(e) => e.stopPropagation()}>
                                <Eye size={16} />
                              </Link>
                              <Link to={`/roles_permissions/edit/${role.id}`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit Role" onClick={(e) => e.stopPropagation()}>
                                <Edit3 size={16} />
                              </Link>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(role); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete Role">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRole === role.id && (
                          <tr className="bg-indigo-50/20 border-b border-indigo-100/50">
                            <td colSpan={4} className="px-12 py-10">
                              <div className="flex flex-wrap gap-2 animate-fadeIn">
                                {!role.permissions ? (
                                  <div className="w-full py-4 text-center">
                                    <div className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-2">Accessing Matrix...</p>
                                  </div>
                                ) : role.permissions.length > 0 ? (
                                  role.permissions.map((p) => (
                                    <Badge key={p.id} variant="indigo">
                                      {p.name.replace(/[-_]/g, " ")}
                                    </Badge>
                                  ))
                                ) : (
                                  <div className="w-full py-4 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No specific permissions assigned to this role configuration.</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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