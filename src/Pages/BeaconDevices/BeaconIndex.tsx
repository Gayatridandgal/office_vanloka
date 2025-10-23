// src/Pages/GpsDevice/IndexPage.tsx

import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { beaconDevicesData } from "../../Data/Index";
import type { Beacon } from "../../Types/Index";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Beacon, index: number) => index + 1,
  },
  { key: "title", label: "Title" },
  { key: "beacon_id", label: "Device ID" },
];

// Placeholder for the delete action
const handleDelete = (device: Beacon) => {
  console.log("Delete device:", device);
  alert(`Deleting ${device.title}`);
};

const BeaconIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="Beacon Devices"
        buttonText="Add Beacon"
        buttonLink="create"
      />

      <Table<Beacon>
        list={beaconDevicesData}
        columns={columns}
        editUrl="/beacon_devices/edit" // The base URL for editing
        onDelete={handleDelete}
      />
    </div>
  );
};

export default BeaconIndexPage;
