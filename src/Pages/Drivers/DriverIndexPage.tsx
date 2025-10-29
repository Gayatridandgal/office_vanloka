import { useState } from "react"; // Import useState
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { driverData } from "../../Data/Index";
import type { Driver } from "../../Types/Index";
import SearchComponent from "../../Components/UI/SearchComponents";

// Column definitions remain the same
const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Driver, index: number) => index + 1,
  },
  {
    key: "name",
    label: "Name",
    render: (row: Driver) => `${row.first_name} ${row.last_name}`, // Combine first and last name
  },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (row: Driver) => {
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

const handleDelete = (driver: Driver) => {
  console.log("Delete driver:", driver);
  alert(`Deleting driver ${driver.email}`);
};

const DriverIndexPage = () => {
  // State to hold the list of drivers that will be displayed
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>(driverData);

  // The search handler function
  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredDrivers(driverData);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = driverData.filter(
      (driver) =>
        (driver.first_name + " " + driver.last_name)
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (driver.email ?? "").toLowerCase().includes(lowercasedQuery) ||
        (driver.phone ?? "").toLowerCase().includes(lowercasedQuery)
    );
    setFilteredDrivers(filtered);
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Driver Management"
        buttonText="Add Driver"
        buttonLink="create"
      />

      {/* Add the SearchComponent */}
      <div className="my-4">
        <SearchComponent
          onSearch={handleSearch}
          placeholder="Search by Name, Email, Phone..."
        />
      </div>

      <Table<Driver>
        list={filteredDrivers} // <-- Use the filtered state here
        columns={columns}
        viewUrl="/drivers/show"
        editUrl="/drivers/edit"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DriverIndexPage;
