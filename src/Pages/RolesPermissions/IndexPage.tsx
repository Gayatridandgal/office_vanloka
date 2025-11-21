import { useEffect, useState } from "react";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { useAlert } from "../../Context/AlertContext";
import adminApi from "../../Services/ApiService";
import type { Role } from "./RolesPermissions.types";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Role, index: number) => index + 1,
  },
  { key: "name", label: "Role Name" },
  // {
  //   key: "permissions_count",
  //   label: "Permissions",
  //   render: (row: Role) => `${row.permissions_count} permissions assigned`, // A user-friendly display
  // },
];

const IndexPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await adminApi.get("/roles");
        setRoles(response.data.data);
      } catch (error) {
        showAlert("Failed to fetch roles. Please try again later.", "error");
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [showAlert]); // Dependency array includes showAlert as a good practice

  const handleDelete = async (role: Role) => {
    // 2. ADD A CONFIRMATION STEP
    // window.confirm() is a simple but effective way to do this.
    if (
      !window.confirm(
        `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`
      )
    ) {
      return; // Stop if the user clicks "Cancel"
    }

    try {
      // 3. MAKE THE API CALL
      const response = await adminApi.delete(`/roles/${role.id}`);

      // 4. UPDATE THE UI ON SUCCESS
      // Filter out the deleted role from the state to instantly update the table
      setRoles((currentRoles) => currentRoles.filter((r) => r.id !== role.id));

      // Show a success message
      showAlert(
        response.data.message || "Role deleted successfully.",
        "success"
      );
    } catch (error: any) {
      // 5. SHOW AN ERROR MESSAGE ON FAILURE
      const errorMessage =
        error.response?.data?.message || "Failed to delete the role.";
      showAlert(errorMessage, "error");
      console.error("Delete role error:", error);
    }
  };

  // Show a loading indicator while fetching data
  if (loading) {
    return <div className="p-4">Loading roles...</div>;
  }
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader title="Roles" buttonText="Add Role" buttonLink="create" />

      <Table<Role>
        list={roles}
        columns={columns}
        editUrl="/roles_permissions/edit"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default IndexPage;
