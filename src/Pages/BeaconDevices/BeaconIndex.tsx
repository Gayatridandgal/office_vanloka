// src/Pages/GpsDevice/IndexPage.tsx

import PageTitle from "../../Components/UI/PageTitle";
import Table from "../../Components/UI/Table";
import { assignedBeacons } from "../../Data/Index";
import type { Beacon } from "../../Types/Index";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Beacon, index: number) => index + 1,
  },
  { key: "name", label: "Title" },
  { key: "imei_number", label: "Device ID" },
];

// Placeholder for the delete action
const handleDelete = (device: Beacon) => {
  console.log("Delete device:", device);
  alert(`Deleting ${device.name}`);
};

const BeaconIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageTitle title="Beacon Devices" />

      <Table<Beacon> list={assignedBeacons} columns={columns} />
    </div>
  );
};

export default BeaconIndexPage;
