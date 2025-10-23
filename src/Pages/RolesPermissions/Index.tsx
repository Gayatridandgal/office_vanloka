import type { Role } from "../../Types/Index";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { rolesData } from "../../Data/Index";
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
};

const IndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader title="Roles" buttonText="Add Role" buttonLink="create" />

      <Table<Role>
        list={rolesData}
        columns={columns}
        editUrl="/roles_permissions/edit"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default IndexPage;
