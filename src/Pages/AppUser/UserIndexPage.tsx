import PageHeader from "../../Components/UI/PageHeader";
import PageTitle from "../../Components/UI/PageTitle";
import Table from "../../Components/UI/Table";
import { usersData, organisationData } from "../../Data/Index";
import type { AppUser as User } from "../../Types/Index";

const findOrgName = (id: string | null) => {
  if (!id) return <span className="text-gray-500 italic">Public User</span>;
  return organisationData.find((org) => org.id === id)?.name || "Unknown Org";
};

const columns = [
  {
    key: "name",
    label: "Name",
    render: (row: User) => (
      <div className="flex items-center">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={row.photo as string}
          alt=""
        />
        <div className="ml-4">
          <div className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "organisation",
    label: "Organisation",
    render: (row: User) => findOrgName(row.organisation_id),
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "travelers",
    label: "Travelers",
    render: (row: User) => (
      <span className="font-semibold">{row.travelers?.length || 0}</span>
    ),
  },
];

const UserIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageTitle title="Users" />
      <Table<User>
        list={usersData}
        columns={columns}
        viewUrl="/users/show"
        editUrl="/users/edit"
      />
    </div>
  );
};

export default UserIndexPage;
