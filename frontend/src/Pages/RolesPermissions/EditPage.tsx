import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Key, 
  Save, 
  ArrowLeft, 
  ShieldAlert, 
  Edit3, 
  Clock,
  LayoutDashboard,
  CheckCheck,
  XCircle,
  X
} from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";

// Services & Context
import { useAlert } from "../../Context/AlertContext";
import { useAuth } from "../../Context/AuthContext";
import tenantApi from "../../Services/ApiService";
import type { Permission } from "./RolesPermissions.types";

/* ── UI Components ────────────────────────── */
const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-6 ring-1 ring-slate-100/50 transition-all hover:shadow-md">
    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Icon size={18} className="stroke-[2.5]" />
        </div>
        <h3 className="text-[11px] font-900 tracking-wider text-slate-500 uppercase">{title}</h3>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const FormLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="block text-[10px] font-900 text-slate-400 tracking-widest uppercase mb-2">
    {children}
    {required && <span className="text-rose-500 ml-1 italic">*</span>}
  </label>
);

const EditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { refreshMe } = useAuth();

  // State
  const [roleName, setRoleName] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      if (!id) return;

      try {
        const [roleResponse, permissionsResponse] = await Promise.all([
          tenantApi.get(`/roles/${id}`),
          tenantApi.get("/permissions"),
        ]);

        const roleData = roleResponse.data.data;

        setRoleName(roleData.name);
        setAllPermissions(permissionsResponse.data.data);

        // Map existing permissions to IDs
        const currentPermissionIds = roleData.permissions.map(
          (p: Permission) => p.id
        );
        setSelectedPermissions(currentPermissionIds);
      } catch (error) {
        showAlert("Failed to load role data. Please go back and try again.", "error");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndPermissions();
  }, [id, showAlert]);

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((pId) => pId !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: roleName,
      permissions: selectedPermissions,
    };

    try {
      const response = await tenantApi.put(`/roles/${id}`, payload);
      showAlert(response.data.message || "Role updated successfully!", "success");
      await refreshMe();
      navigate("/roles_permissions");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "An error occurred while updating the role.";
      showAlert(errorMessage, "error");
      console.error("Update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    const allIds = allPermissions.map((p) => p.id);
    setSelectedPermissions(allIds);
  };

  // Handle Deselect All
  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  // Grouping Logic
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    const actions = ["view", "create", "edit", "delete", "manage", "list", "analyze", "export", "report"];

    allPermissions.forEach((p) => {
      const parts = p.name.split(/[-_ ]/);
      let category = "Other";

      if (parts.length > 1) {
        // If first word is an action, the second word is the category
        if (actions.includes(parts[0].toLowerCase())) {
          category = parts[1];
        } else {
          category = parts[0];
        }
      } else if (parts.length === 1) {
        category = parts[0];
      }

      // Beautify category: capitalize first letter
      category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      if (!groups[category]) groups[category] = [];
      groups[category].push(p);
    });
    return groups;
  }, [allPermissions]);

  const toggleCategory = (category: string) => {
    const categoryIds = groupedPermissions[category].map(p => p.id);
    const allSelectedInCat = categoryIds.every(id => selectedPermissions.includes(id));

    if (allSelectedInCat) {
      setSelectedPermissions(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...categoryIds])));
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Shield size={22} className="stroke-[2.5]" />
              <h1 className="text-xl font-900 tracking-wider uppercase">
                Modify Role Configuration
              </h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-1">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span>Roles & Permissions</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark uppercase">Edit Role</span>
           </div>
        </div>

        <button 
          onClick={() => navigate("/roles_permissions")}
          className="w-full md:w-auto justify-center btn flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-900 uppercase tracking-widest transition-all bg-white border border-slate-100 hover:bg-slate-50 shadow-sm"
        >
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto space-y-6 pb-20">
          
          {/* Identity Card */}
          <SectionCard icon={LayoutDashboard} title="Role Identity">
            <div className="max-w-md">
              <FormLabel required>Role Name</FormLabel>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-700 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g. System Administrator"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>
          </SectionCard>

          {/* Permissions Center */}
          <SectionCard icon={Key} title="Update Permission Matrix">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-50">
              <div>
                <p className="text-[10px] font-900 text-slate-800 uppercase tracking-tight">Active Access Control</p>
                <p className="text-[9px] font-700 text-slate-400 uppercase tracking-widest">Update system module access for this specific authority</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-900 uppercase tracking-widest bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                >
                  <CheckCheck size={12} /> Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-900 uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                >
                  <XCircle size={12} /> Deselect All
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedPermissions).map(([category, perms]) => {
                const categoryIds = perms.map(p => p.id);
                const selectedInCat = categoryIds.filter(id => selectedPermissions.includes(id)).length;
                const allSelectedInCat = selectedInCat === perms.length;

                return (
                  <div key={category} className="group">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                         <div className={`w-1.5 h-1.5 rounded-full ${allSelectedInCat ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                         <h4 className="text-[10px] font-900 text-slate-700 uppercase tracking-widest">{category} Management</h4>
                         <span className="text-[9px] font-800 text-slate-300 py-0.5 px-2 bg-slate-50 rounded-full">{selectedInCat} / {perms.length}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`text-[9px] font-900 uppercase tracking-tighter px-2 py-1 rounded transition-colors ${allSelectedInCat ? 'text-rose-500 hover:bg-rose-50' : 'text-indigo-500 hover:bg-indigo-50'}`}
                      >
                        {allSelectedInCat ? 'Clear Category' : 'Select Category'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                      {perms.map((permission) => {
                        const isSelected = selectedPermissions.includes(permission.id);
                        return (
                          <label
                            key={permission.id}
                            className={`
                              flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none
                              ${isSelected
                                ? 'bg-white border-indigo-200 shadow-sm text-indigo-600'
                                : 'bg-transparent border-transparent text-slate-400 hover:bg-white hover:border-slate-100'}
                            `}
                          >
                            <div className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-600/20' : 'border-slate-200 bg-white shadow-inner'}`}>
                              {isSelected && <CheckCheck size={10} className="text-white" />}
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isSelected}
                                onChange={() => handlePermissionChange(permission.id)}
                              />
                            </div>
                            <span className="text-[10px] font-800 uppercase tracking-tight">
                              {permission.name.split(/[-_ ]/).filter(p => p.toLowerCase() !== category.toLowerCase()).join(" ") || permission.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {allPermissions.length === 0 && (
                <div className="py-20 flex flex-col items-center gap-4 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100 mt-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                    <ShieldAlert size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-900 text-slate-400 uppercase tracking-widest">No permissions available</p>
                    <p className="text-[9px] font-700 text-slate-300 uppercase tracking-widest mt-1">Check system configuration or contact admin</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Action Center */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 p-6 sm:p-8 bg-white border border-slate-100 rounded-[32px] shadow-lg">
             <button 
               type="button"
               onClick={() => navigate("/roles_permissions")}
               className="px-8 py-4 text-[11px] font-900 text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors w-full sm:w-auto"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] shadow-xl shadow-indigo-600/20 font-900 uppercase tracking-widest text-[11px] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
             >
               {isSubmitting ? (
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="animate-spin text-indigo-200" />
                    Updating...
                 </div>
               ) : (
                 <>
                   <Edit3 size={18} />
                   Update Role
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;