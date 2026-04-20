// src/components/roles/EditPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Icons
import { FaUserEdit, FaKey, FaCheck, FaShieldAlt, FaTimes } from "react-icons/fa";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import CancelButton from "../../Components/Form/CancelButton";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";

// Services & Context
import { useAlert } from "../../Context/AlertContext";
import { useAuth } from "../../Context/AuthContext";
import tenantApi from "../../Services/ApiService";
import type { Permission } from "./RolesPermissions.types";
import { FaCheckDouble } from "react-icons/fa6";

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

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* 1. Sticky Header */}

      <PageHeaderBack title="Edit Role" buttonLink="/roles_permissions" />


      {/* 2. Main Container */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 3. The Form Card */}
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">

            {/* Card Header */}
            <div className="bg-blue-50 px-8 py-2 border-b border-blue-100 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 border border-blue-100">
                <FaUserEdit size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  Role Configuration
                </h2>
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="overflow-y-auto h-[70vh] p-8 space-y-8">

              {/* SECTION: Role Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaShieldAlt className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Role Details</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="roleName" className="block text-sm font-medium text-slate-700 mb-1">
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="roleName"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Permissions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaKey className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Assign Permissions</h3>

                </div>
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-200 transition-colors flex items-center gap-1.5 uppercase"
                  >
                    <FaCheckDouble size={12} /> Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded border border-amber-300 transition-colors flex items-center gap-1.5 uppercase"
                  >
                    <FaTimes size={12} /> Deselect All
                  </button>
                </div>



                <div className="bg-gray-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allPermissions.map((permission) => {
                      const isSelected = selectedPermissions.includes(permission.id);
                      return (
                        <label
                          key={permission.id}
                          className={`
                            relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all select-none
                            ${isSelected
                              ? 'bg-blue-50 border-blue-50 shadow-sm'
                              : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className={`text-xs font-bold uppercase ${isSelected ? 'text-blue-950' : 'text-slate-600'}`}>
                              {permission.name.replace(/-/g, " ")}
                            </span>
                          </div>
                          {isSelected && <FaCheck className="text-purple-600 text-[10px]" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-3 border-t border-slate-200 flex flex-wrap justify-start items-center gap-4">
              <CancelButton label="cancel" type="button" onClick={() => navigate("/roles_permissions")} />
              <SaveButton label="save" isSaving={isSubmitting} onClick={handleSubmit} />
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;