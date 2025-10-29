import { useState } from "react";
import type { LiveVehicle } from "../Types/Index";
import { liveVehicleData } from "../Data/Index";
import BeaconDisplay from "../Components/Map/BeaconDisplay";
import { LoadScript } from "@react-google-maps/api";
import GoogleMapDisplay from "../Components/Map/GoogleMapDisplay";

const DashBoardPage2 = () => {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>(liveVehicleData);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  const selectedVehicle =
    vehicles.find((v) => v.vehicleId === selectedVehicleId) || null;

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId((prevId) => (prevId === vehicleId ? null : vehicleId));
  };

  // The Google Maps API key from your .env file
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="p-10 text-center font-bold text-red-600">
        Error: Google Maps API Key is missing.
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <div className="space-y-8">
        {/* Card for the Map */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <h2 className="text-md font-bold text-purple-950 uppercase mb-4">
            Live Map
          </h2>
          <div className="h-[60vh] w-full rounded-lg overflow-hidden">
            {/* The LoadScript component handles loading the Google Maps API */}
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
              <GoogleMapDisplay
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onVehicleSelect={handleVehicleSelect}
              />
            </LoadScript>
          </div>
        </div>

        {/* The BeaconDisplay component remains the same */}
        <BeaconDisplay
          beacons={selectedVehicle ? selectedVehicle.beacons : null}
          vehicleName={selectedVehicle ? selectedVehicle.vehicleName : null}
        />
      </div>
    </div>
  );
};

export default DashBoardPage2;
