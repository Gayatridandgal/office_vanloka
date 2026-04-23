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
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  
  // Permissions State
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const { showAlert } = useAlert();

  // 1. Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesRes, permsRes] = await Promise.all([
          adminApi.get("/roles"),
          adminApi.get("/permissions")
        ]);
        
        const rolesData = rolesRes.data.data || [];
        setRoles(rolesData);
        setFilteredRoles(rolesData);
        
        const permsData = permsRes.data.data || [];
        setPermissions(permsData);
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

  const handleAddPermission = async () => {
    if (!newPermissionName.trim()) return;
    setIsAddingPermission(true);
    try {
      const response = await adminApi.post("/permissions", { name: newPermissionName });
      setPermissions([...permissions, response.data.data]);
      setNewPermissionName("");
      showAlert("Permission added successfully.", "success");
    } catch (error) {
      showAlert("Failed to add permission.", "error");
    } finally {
      setIsAddingPermission(false);
    }
  };

  const handleDeletePermission = async (perm: Permission) => {
    if (!window.confirm(`Delete permission "${perm.name}"?`)) return;
    try {
      await adminApi.delete(`/permissions/${perm.id}`);
      setPermissions(permissions.filter(p => p.id !== perm.id));
      showAlert("Permission deleted.", "success");
    } catch (error) {
      showAlert("Failed to delete permission.", "error");
    }
  };

  const stats = [
    { label: "Total Roles", value: roles.length, icon: <Shield size={20} />, bg: "bg-indigo-50", text: "text-indigo-600" },
    { label: "Capabilities", value: permissions.length, icon: <Plus size={20} />, bg: "bg-emerald-50", text: "text-emerald-600" },
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-6 px-6">
          <button 
            onClick={() => setActiveTab("roles")}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'roles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Roles
          </button>
          <button 
            onClick={() => setActiveTab("permissions")}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'permissions' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Permissions
          </button>
        </div>

        {activeTab === "roles" ? (
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
        ) : (
          <div className="px-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-900 text-slate-800 uppercase tracking-wider">Permission Matrix</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Define granular access capabilities</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="text"
                      placeholder="New Permission Name..."
                      value={newPermissionName}
                      onChange={(e) => setNewPermissionName(e.target.value)}
                      className="px-4 py-2 text-xs font-600 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none w-full sm:w-64"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPermission()}
                    />
                    <button 
                      onClick={handleAddPermission}
                      disabled={isAddingPermission}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-900 uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                </div>
              </div>

              <div className="p-8">
                {permissions.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                    <Edit3 size={40} className="text-slate-300 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No permissions defined yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-emerald-200 hover:bg-white transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-800 text-slate-600 uppercase tracking-tight">{perm.name.replace(/_/g, ' ')}</span>
                        </div>
                        <button 
                          onClick={() => handleDeletePermission(perm)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 text-rose-500 rounded-md transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;