import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LiveVehicle } from "../../Types/Index";

// --- Custom Icons for Markers (no change) ---
const defaultIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface LiveMapProps {
  vehicles: LiveVehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicleId: string) => void;
}

const LiveMap: React.FC<LiveMapProps> = ({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
}) => {
  const centerPosition: [number, number] = [15.8497, 74.4977]; // Belagavi

  return (
    <MapContainer
      center={centerPosition}
      zoom={13}
      // CRITICAL CHANGE: This ensures the map fills its parent container
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg" // Ensures map corners are rounded if the parent is
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.vehicleId}
          position={[vehicle.gps.lat, vehicle.gps.lng]}
          icon={
            vehicle.vehicleId === selectedVehicleId ? selectedIcon : defaultIcon
          }
          eventHandlers={{
            click: () => {
              onVehicleSelect(vehicle.vehicleId);
            },
          }}
        >
          <Popup>
            <b>{vehicle.vehicleName}</b>
            <br />
            {vehicle.gps.speed} km/h
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LiveMap;
