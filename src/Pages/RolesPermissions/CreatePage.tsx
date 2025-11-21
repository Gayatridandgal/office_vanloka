// src/components/roles/CreatePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import { useAlert } from "../../Context/AlertContext";
import type { Permission } from "./RolesPermissions.types";
import tenantApi from "../../Services/ApiService";


const CreatePage = () => {
  const [roleName, setRoleName] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await tenantApi.get("/permissions");
        setAllPermissions(response.data.data);
      } catch (err) {
        showAlert("Failed to load permissions.", "error");
        setError("Failed to load permissions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!roleName) {
      alert("Role name is required.");
      return;
    }

    const payload = {
      name: roleName,
      permissions: selectedPermissions,
    };

    try {
      const response = await tenantApi.post("/roles", payload);

      console.log("Role created successfully:", response.data);
      showAlert(
        response.data.message || "Role created successfully!",
        "success"
      );
      navigate("/roles_permissions");
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        console.error("Validation errors:", err.response.data.errors);
        alert("Validation failed: " + err.response.data.message);
      } else {
        console.error("An error occurred while creating the role:", err);
        alert("An error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="p-2">Loading Permissions...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack
          title="Create Role & Assign Permissions"
          buttonLink="/roles_permissions" // Corrected link
        />

        <div className="p-8 mx-auto rounded-lg shadow-sm ">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="roleName"
                className="block text-purple-950 text-sm uppercase font-bold mb-2"
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
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-5 w-5 text-purple-950 rounded border-purple-200 focus:ring-purple-800"
                    />
                    <span className="text-gray-700 uppercase text-sm">
                      {permission.name.replace(/-/g, " ")}{" "}
                      {/* Display name nicely */}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <SaveButton label="save" />
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePage;
