import { useState } from "react";
import PageHeader from "../../Components/UI/PageHeader"; // Use the PageHeader that can accept search props
import Table from "../../Components/UI/Table";
import {
  travelersData,
  appUsersData,
  organisationData,
} from "../../Data/Index";
import type { Traveler } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";

// // Helper functions to find related data
// const findParentUser = (userId: string) => {
//   const user = appUsersData.find((u) => u.id === userId);
//   // CORRECTED: Added backticks for the template literal
//   return user ? `${user.first_name} ${user.last_name}` : "N/A";
// };

// --- Active Helper Functions ---
const findActiveParentUser = (userId: string | undefined) => {
  const user = appUsersData.find((u) => u.id === userId);
  return user ? `${user.first_name} ${user.last_name}` : "N/A";
};

const findActiveOrgName = (orgId: string | undefined) => {
  return organisationData.find((o) => o.id === orgId)?.name || "N/A";
};

// --- Updated Column definitions for a more informative view ---
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
  {
    key: "user",
    label: "Primary User",
    render: (row: Traveler) => findActiveParentUser(row.user_id),
  },
  {
    key: "organisation",
    label: "Organisation",
    render: (row: Traveler) => findActiveOrgName(row.organisation_id),
  },
  {
    key: "beacon",
    label: "Beacon ID",
    render: (row: Traveler) => row.beacon || "N/A",
  },
];

const TravelerIndexPage = () => {
  // State to hold the list of travelers to be displayed
  const [filteredTravelers, setFilteredTravelers] =
    useState<Traveler[]>(travelersData);

  // The search handler function
  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredTravelers(travelersData);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = travelersData.filter(
      (traveler) =>
        (traveler.first_name + " " + traveler.last_name)
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (traveler.beacon ?? "").toLowerCase().includes(lowercasedQuery)
    );
    setFilteredTravelers(filtered);
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader title="Travelers" />

      {/* Add the SearchComponent */}
      <div className="my-4">
        <SearchComponent
          onSearch={handleSearch}
          placeholder="Search by Name, Beacon ID..."
        />
      </div>
      <Table<Traveler>
        list={filteredTravelers} // <-- Use the filtered state here
        columns={columns}
        viewUrl="/travelers/show"
        editUrl="/travelers/edit"
      />
    </div>
  );
};

export default TravelerIndexPage;
