import React from "react";
import type { Beacon } from "../../Types/Index";

interface BeaconDisplayProps {
  beacons: Beacon[] | null;
  vehicleName: string | null;
}

const BeaconDisplay: React.FC<BeaconDisplayProps> = ({
  beacons,
  vehicleName,
}) => {
  return (
    // The entire component is now a self-contained card
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h3 className="text-md font-bold text-purple-950 uppercase mb-4">
        {vehicleName ? `Travelers in ${vehicleName}` : ""}
      </h3>

      {/* Handle the initial state before a vehicle is clicked */}
      {!vehicleName && (
        <div className="flex items-center text-sm uppercase justify-center text-center text-gray-700 mb-4">
          <p>Click a vehicle on the map to see travelers.</p>
        </div>
      )}

      {/* Handle the state when a vehicle is selected but has no beacons */}
      {vehicleName && beacons && beacons.length === 0 && (
        <div className="flex items-center justify-center text-sm uppercase text-center text-gray-700 mb-4">
          <p>No travelers are found.</p>
        </div>
      )}

      {/* Render the table if there are beacons to display */}
      {vehicleName && beacons && beacons.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase"
                >
                  Traveler Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase"
                >
                  Beacon ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase"
                >
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beacons.map((beacon) => (
                <tr key={beacon.id} className="uppercase">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {beacon.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {beacon.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(beacon.lastSeen).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BeaconDisplay;
