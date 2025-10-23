import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { driverData } from "../../Data/Index";
import type { Driver } from "../../Types/Index";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Driver, index: number) => index + 1,
  },
  { key: "first_name", label: "Name" },
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
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Driver Management"
        buttonText="Add Driver"
        buttonLink="create"
      />
      <Table<Driver>
        list={driverData}
        columns={columns}
        viewUrl="/drivers/show" // <-- Add this prop for the Show page
        editUrl="/drivers/edit" // <-- Keep this for the Edit page
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DriverIndexPage;
