import React from "react";
import { GoogleMap, MarkerF, InfoWindowF } from "@react-google-maps/api";
import type { LiveVehicle } from "../../Types/Index";

// NOTE: The icon definitions have been moved from here...

interface GoogleMapProps {
  vehicles: LiveVehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicleId: string) => void;
}

const GoogleMapDisplay: React.FC<GoogleMapProps> = ({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
}) => {
  // --- MOVED INSIDE THE COMPONENT ---
  // Now, this code only runs when the component renders, after the Google script has loaded.
  const defaultIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  };

  const selectedIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  };
  // ------------------------------------

  const mapContainerStyle = {
    height: "100%",
    width: "100%",
  };
  const centerPosition = { lat: 15.8497, lng: 74.4977 }; // Belagavi

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={centerPosition}
      zoom={13}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {vehicles.map((vehicle) => (
        <MarkerF
          key={vehicle.vehicleId}
          position={vehicle.gps}
          icon={
            vehicle.vehicleId === selectedVehicleId ? selectedIcon : defaultIcon
          }
          onClick={() => {
            onVehicleSelect(vehicle.vehicleId);
          }}
        >
          {vehicle.vehicleId === selectedVehicleId && (
            <InfoWindowF
              position={vehicle.gps}
              onCloseClick={() => {
                onVehicleSelect(vehicle.vehicleId);
              }}
            >
              <div className="p-2">
                <h4 className="font-bold uppercase">{vehicle.vehicleName}</h4>
                <p className="uppercase">{vehicle.gps.speed} km/h</p>
              </div>
            </InfoWindowF>
          )}
        </MarkerF>
      ))}
    </GoogleMap>
  );
};

export default GoogleMapDisplay;
