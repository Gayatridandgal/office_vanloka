import PageTitle from "../../Components/UI/PageTitle";
import Table from "../../Components/UI/Table";
import { assignedGps } from "../../Data/Index";
import type { Gps } from "../../Types/Index";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Gps, index: number) => index + 1,
  },
  { key: "name", label: "Name" },
  { key: "imei_number", label: "Device ID" },
];

// Placeholder for the delete action
// const handleDelete = (device: Gps) => {
//   console.log("Delete device:", device);
//   alert(`Deleting ${device.name}`);
// };

const GpsIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageTitle title="Assigned GPS Devices" />

      <Table<Gps> list={assignedGps} columns={columns} />
    </div>
  );
};

export default GpsIndexPage;
