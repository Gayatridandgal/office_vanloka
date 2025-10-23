import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { allPermissions } from "../../Data/Index";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { rolesData } from "../../Data/Index";

const EditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const roleId = parseInt(id || "0");
    const role = rolesData.find((r) => r.id === roleId);
    if (role) {
      setRoleName(role.name);
      setSelectedPermissions(role.permissions);
    }
  }, [id]);

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Updated Role Name:", roleName);
    console.log("Updated Permissions:", selectedPermissions);
    navigate("/roles"); // Redirect after submission
  };

  return (
    <>
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack
          title="Create Role & Assign Permissions"
          buttonLink="/roles_permissions"
        />

        <div className="p-8 mx-auto rounded-lg shadow-sm ">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="roleName"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Role Name
              </label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-2xl px-4 py-2 border border-lite-purple-200 uppercase rounded-lg focus:outline-none focus:ring-2 focus:ring-lite-purple-800"
                placeholder="Marketing Manager"
              />
            </div>
            <div className="mb-6">
              <label className="block text-purple-950 uppercase font-bold mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-4">
                {allPermissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      className="h-5 w-5 text-purple-950 rounded border-purple-200 focus:ring-purple-800"
                    />
                    <span className="text-gray-700 uppercase">
                      {permission}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className=" bg-purple-200 text-purple-900 font-bold py-1 px-4 rounded-lg hover:bg-purple-300 uppercase transition-colors"
            >
              save
            </button>
          </form>
        </div>
      </div>

      <div className="p-8 bg-white max-w-2xl mx-auto rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold text-lite-purple-900 mb-6">
          Edit Role
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="roleName"
              className="block text-lite-purple-800 font-bold mb-2"
            >
              Role Name
            </label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2 border border-lite-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lite-purple-800"
            />
          </div>
          <div className="mb-6">
            <label className="block text-lite-purple-800 font-bold mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allPermissions.map((permission) => (
                <label key={permission} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-5 w-5 text-lite-purple-800 rounded border-lite-purple-200 focus:ring-lite-purple-800"
                  />
                  <span className="text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-lite-purple-100 text-lite-purple-900 font-bold py-2 px-4 rounded-lg hover:bg-lite-purple-200 transition-colors"
          >
            Update Role
          </button>
        </form>
      </div>
    </>
  );
};

export default EditPage;
