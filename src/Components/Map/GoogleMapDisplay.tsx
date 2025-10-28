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
  const carIcon = {
    // This is the "d" attribute from the <path> in the SVG
    path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 1.2,
    anchor: new window.google.maps.Point(12, 12), // Center of a 24x24 viewBox
  };

  const defaultIcon = {
    ...carIcon,
    fillColor: "#007BFF", // Blue
  };

  const selectedIcon = {
    ...carIcon,
    fillColor: "#8A2BE2", // Purple
    scale: 1.5, // Make it bigger
  };

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
          {/* {vehicle.vehicleId === selectedVehicleId && (
            <InfoWindowF
            
              position={vehicle.gps}
              onCloseClick={() => {
                onVehicleSelect(vehicle.vehicleId);
              }}
            >
              <div className="">
                <h4 className="font-bold uppercase">{vehicle.vehicleName}</h4>
                <p className="uppercase">{vehicle.gps.speed} km/h</p>
              </div>
            </InfoWindowF>
          )} */}
        </MarkerF>
      ))}
    </GoogleMap>
  );
};

export default GoogleMapDisplay;
