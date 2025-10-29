import { useState } from "react"; // Import useState
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { rolesData } from "../../Data/Index";
import type { Role } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";

// Column definitions remain the same
const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Role, index: number) => index + 1,
  },
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
];

const handleDelete = (role: Role) => {
  console.log("Delete role:", role);
  alert(`Deleting role: ${role.name}`);
};

const IndexPage = () => {
  // State to hold the list of roles that will be displayed
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(rolesData);
  // The search handler function
  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRoles(rolesData);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = rolesData.filter(
      (role) =>
        (role.name ?? "").toLowerCase().includes(lowercasedQuery) ||
        (role.description ?? "").toLowerCase().includes(lowercasedQuery)
    );
    setFilteredRoles(filtered);
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Roles & Permissions"
        buttonText="Add Role"
        buttonLink="create"
      />

      {/* Add the SearchComponent */}
      <div className="my-4">
        <SearchComponent
          onSearch={handleSearch}
          placeholder="Search by Role Name, Description..."
        />
      </div>

      <Table<Role>
        list={filteredRoles} // <-- Use the filtered state here
        columns={columns}
        editUrl="/roles_permissions/edit"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default IndexPage;
