import { useState } from "react";
import type { LiveVehicle } from "../Types/Index";
import { liveVehicleData } from "../Data/Index";
import LiveMap from "../Components/Map/MapDisplay";
import BeaconDisplay from "../Components/Map/BeaconDisplay";

const DashboardPage = () => {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>(liveVehicleData);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  const selectedVehicle =
    vehicles.find((v) => v.vehicleId === selectedVehicleId) || null;

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId((prevId) => (prevId === vehicleId ? null : vehicleId));
  };

  return (
    // Main dashboard container with a light background and padding
    <div className="mx-4 bg-white min-h-screen">
      <div className="space-y-5">
        {/* Card for the Map */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="text-md font-bold text-purple-950 uppercase mb-4">
            Live Vehicle Map
          </h2>
          {/* Container that defines the map's height */}
          <div className="h-[55vh] w-full rounded-lg overflow-hidden">
            <LiveMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onVehicleSelect={handleVehicleSelect}
            />
          </div>
        </div>

        {/* The BeaconDisplay component will now be a self-contained card */}
        <BeaconDisplay
          beacons={selectedVehicle ? selectedVehicle.beacons : null}
          vehicleName={selectedVehicle ? selectedVehicle.vehicleName : null}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
