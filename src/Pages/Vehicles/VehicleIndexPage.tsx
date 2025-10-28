import { Link } from "react-router-dom";
import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { vehiclesData } from "../../Data/Index";
import type { Vehicle } from "../../Types/Index";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Vehicle, index: number) => index + 1,
  },
  { key: "name", label: "Vehicle Name" },
  { key: "model", label: "Model" },
  { key: "registration_number", label: "Registration No." },
  {
    key: "status",
    label: "Status",
    render: (row: Vehicle) => {
      const statusColor =
        row.status === "Active"
          ? "bg-green-100 text-green-800"
          : row.status === "Maintenance"
          ? "bg-yellow-100 text-yellow-800"
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

  {
    key: "actions",
    label: "",
    render: (row: Vehicle) => (
      <div className="flex items-center gap-4">
        {/* The new "Track" button */}
        <Link
          to={`/vehicles/track/${row.id}`}
          className="text-purple-950 bg-amber-200 p-1 text-xs rounded-full font-semibold"
        >
          Track
        </Link>
      </div>
    ),
  },
];

const handleDelete = (vehicle: Vehicle) => {
  console.log("Delete vehicle:", vehicle);
  alert(`Deleting vehicle ${vehicle.registration_number}`);
};

const VehicleIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Vehicle Management"
        buttonText="Add Vehicle"
        buttonLink="create"
      />
      <Table<Vehicle>
        list={vehiclesData}
        columns={columns}
        viewUrl="/vehicles/show"
        editUrl="/vehicles/edit"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default VehicleIndexPage;
