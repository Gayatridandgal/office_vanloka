// src/Pages/GpsDevice/IndexPage.tsx

import PageHeader from "../../Components/UI/PageHeader";
import Table from "../../Components/UI/Table";
import { gpsDevicesData } from "../../Data/Index";
import type { Gps } from "../../Types/Index";

const columns = [
  {
    key: "sno",
    label: "SNo",
    render: (_: Gps, index: number) => index + 1,
  },
  { key: "title", label: "Title" },
  { key: "gps_id", label: "Device ID" },
];

// Placeholder for the delete action
const handleDelete = (device: Gps) => {
  console.log("Delete device:", device);
  alert(`Deleting ${device.title}`);
};

const GpsIndexPage = () => {
  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeader
        title="GPS Devices"
        buttonText="Add GPS"
        buttonLink="create"
      />

      <Table<Gps>
        list={gpsDevicesData}
        columns={columns}
        editUrl="/gps_devices/edit" // The base URL for editing
        onDelete={handleDelete}
      />
    </div>
  );
};

export default GpsIndexPage;
