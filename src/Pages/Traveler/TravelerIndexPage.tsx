import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { travelersData, usersData, organisationData } from "../../Data/Index";
import type { Traveler } from "../../Types/Index";

// Helper functions to find related data
const findParentUser = (userId: string) => {
  const user = usersData.find((u) => u.id === userId);
  // CORRECTED: Added backticks for the template literal
  return user ? `${user.first_name} ${user.last_name}` : "N/A";
};

const findOrgName = (userId: string) => {
  const user = usersData.find((u) => u.id === userId);
  const org = organisationData.find((o) => o.id === user?.organisation_id);
  return org ? (
    org.name
  ) : (
    <span className="italic text-gray-500">Public User</span>
  );
};

// Column definitions for the travelers table
const columns = [
  {
    key: "name",
    label: "Traveler Name",
    render: (row: Traveler) => (
      <div className="flex items-center">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={row.photo as string}
          alt={`${row.first_name} ${row.last_name}`}
        />
        <div className="ml-4">
          <div className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-sm text-gray-500">{row.relationship}</div>
        </div>
      </div>
    ),
  },
  {
    key: "user",
    label: "Primary User",
    render: (row: Traveler) => findParentUser(row.user_id),
  },
  {
    key: "organisation",
    label: "Organisation",
    render: (row: Traveler) => findOrgName(row.user_id),
  },
  {
    key: "dob",
    label: "Date of Birth",
  },
];

const TravelerIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader title="Travelers" />
      <Table<Traveler>
        list={travelersData}
        columns={columns}
        viewUrl="/travelers/show"
      />
    </div>
  );
};

export default TravelerIndexPage;
