import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import { useAlert } from "../../Context/AlertContext";
import type { Permission } from "./RolesPermissions.types";
import { useAuth } from "../../Context/AuthContext";
import tenantApi from "../../Services/ApiService";

const EditPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the role ID from the URL
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { refreshMe } = useAuth();

  // State for the form and data
  const [roleName, setRoleName] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      if (!id) return; // Guard against missing ID

      try {
        // Use Promise.all to fetch both sets of data in parallel for speed
        const [roleResponse, permissionsResponse] = await Promise.all([
          tenantApi.get(`/roles/${id}`),
          tenantApi.get("/permissions"),
        ]);

        const roleData = roleResponse.data.data;

        // Populate the form with the fetched data
        setRoleName(roleData.name);
        setAllPermissions(permissionsResponse.data.data);

        // Pre-select the checkboxes by mapping the role's permissions to just their IDs
        const currentPermissionIds = roleData.permissions.map(
          (p: Permission) => p.id
        );
        setSelectedPermissions(currentPermissionIds);
      } catch (error) {
        showAlert(
          "Failed to load role data. Please go back and try again.",
          "error"
        );
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndPermissions();
  }, [id, showAlert]); // Re-run effect if ID changes

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((pId) => pId !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      name: roleName,
      permissions: selectedPermissions,
    };

    try {
      const response = await tenantApi.put(`/roles/${id}`, payload);
      showAlert(
        response.data.message || "Role updated successfully!",
        "success"
      );
      refreshMe()
      navigate("/roles_permissions"); // Redirect back to the list
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while updating the role.";
      showAlert(errorMessage, "error");
      console.error("Update error:", err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading role information...</div>;
  }

  return (
    <>
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack
          title="Edit Role & Permissions" // Updated title
          buttonLink="/roles_permissions"
        />

        <div className="p-8 mx-auto rounded-lg shadow-sm ">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="roleName"
                className="block text-sm text-purple-950 uppercase font-bold mb-2"
              >
                Role Name
              </label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 border border-lite-purple-200 uppercase rounded-lg focus:outline-none focus:ring-2 focus:ring-lite-purple-800"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-purple-950 uppercase font-bold mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-4">
                {allPermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      // Check if the permission ID is in our selected array
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-5 w-5 text-purple-950 rounded border-purple-200 focus:ring-purple-800"
                    />
                    <span className="text-gray-700 uppercase text-sm">
                      {permission.name.replace(/-/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <SaveButton label="save" /> {/* Changed label for clarity */}
          </form>
        </div>
      </div>
    </>
  );
};

export default EditPage;
