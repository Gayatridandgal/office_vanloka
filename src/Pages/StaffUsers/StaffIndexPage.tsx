import { useState } from "react"; // Import useState
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { staffData } from "../../Data/Index";
import type { Staff } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";

// Column definitions remain the same
const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Staff, index: number) => index + 1,
  },
  {
    key: "name",
    label: "Full Name",
    render: (row: Staff) => (
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
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "designation",
    label: "Designation",
  },
  {
    key: "roles",
    label: "Roles",
    render: (row: Staff) => (
      <div className="flex flex-wrap gap-1">
        {row.role.map((r) => (
          <span
            key={r.id}
            className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
          >
            {r.name}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row: Staff) => {
      const statusColor =
        row.status === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
        >
          {row.status}
        </span>
      );
    },
  },
];

const StaffIndexPage = () => {
  // State to hold the list of staff members that will be displayed
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(staffData);

  // The search handler function
  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredStaff(staffData);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = staffData.filter(
      (staff) =>
        (staff.first_name + " " + staff.last_name)
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (staff.email ?? "").toLowerCase().includes(lowercasedQuery) ||
        (staff.designation ?? "").toLowerCase().includes(lowercasedQuery)
    );
    setFilteredStaff(filtered);
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Staff Management"
        buttonText="Add Staff"
        buttonLink="/staff/create"
      />

      {/* Add the SearchComponent */}
      <div className="my-4">
        <SearchComponent
          onSearch={handleSearch}
          placeholder="Search by Name, Email, Designation..."
        />
      </div>

      <Table<Staff>
        list={filteredStaff} // <-- Use the filtered state here
        columns={columns}
        editUrl="/staff/edit"
        // viewUrl="/staff/show"
      />
    </div>
  );
};

export default StaffIndexPage;
