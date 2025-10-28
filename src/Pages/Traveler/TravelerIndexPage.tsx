import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { travelersData } from "../../Data/Index";
import type { Traveler } from "../../Types/Index";

// // Helper functions to find related data
// const findParentUser = (userId: string) => {
//   const user = usersData.find((u) => u.id === userId);
//   // CORRECTED: Added backticks for the template literal
//   return user ? `${user.first_name} ${user.last_name}` : "N/A";
// };

// Column definitions for the travelers table
const columns = [
  {
    key: "name",
    label: "Full Name",
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
  { key: "beacon", label: "Beacon" },
];

const TravelerIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader title="Travelers" />
      <Table<Traveler>
        list={travelersData}
        columns={columns}
        viewUrl="/travelers/show"
        editUrl="/travelers/edit"
      />
    </div>
  );
};

export default TravelerIndexPage;
