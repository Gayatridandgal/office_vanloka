// import { useMemo, useState, useEffect } from "react"; // <-- Import useState and useEffect
// import { useParams } from "react-router-dom";
// import { LoadScript } from "@react-google-maps/api";
// import PageHeaderBack from "../../Components/UI/PageHeaderBack";
// import GoogleMapDisplay from "../../Components/Map/GoogleMapDisplay";
// import BeaconDisplay from "../../Components/Map/BeaconDisplay";
// import { liveVehicleData } from "../../Data/Index";
// import DetailItem from "../../Components/UI/DetailItem";

// const VehicleTrackPage = () => {
//   const { id } = useParams<{ id: string }>();

//   // --- State for the reverse-geocoded address ---
//   const [address, setAddress] = useState<string>("Loading address...");

//   const vehicleToTrack = useMemo(
//     () => liveVehicleData.find((v) => v.vehicleId === id),
//     [id]
//   );

//   const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

//   // --- useEffect hook to fetch the address ---
//   useEffect(() => {
//     // Only run if we have a vehicle and an API key
//     if (vehicleToTrack && googleMapsApiKey) {
//       const { lat, lng } = vehicleToTrack.gps;
//       const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;

//       fetch(apiUrl)
//         .then((response) => response.json())
//         .then((data) => {
//           // Check if the API returned a valid result
//           if (data.results && data.results[0]) {
//             // The first result is usually the most specific address
//             setAddress(data.results[0].formatted_address);
//           } else {
//             setAddress("Address not found for these coordinates.");
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching address:", error);
//           setAddress("Could not fetch address.");
//         });
//     }
//   }, [vehicleToTrack, googleMapsApiKey]); // Re-run this effect if the vehicle or key changes

//   if (!googleMapsApiKey) {
//     return (
//       <div className="p-10 font-bold text-red-600">
//         Error: Google Maps API Key is missing.
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 bg-white min-h-screen">
//       <PageHeaderBack
//         title={
//           vehicleToTrack
//             ? `Tracking ${vehicleToTrack.vehicleName}`
//             : "Tracking Vehicle"
//         }
//         buttonLink="/vehicles"
//       />

//       {vehicleToTrack ? (
//         <div className="space-y-4">
//           {/* Map Card (no changes) */}
//           <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
//             <div className="h-[60vh] w-full rounded-lg overflow-hidden">
//               <LoadScript googleMapsApiKey={googleMapsApiKey}>
//                 <GoogleMapDisplay
//                   vehicles={[vehicleToTrack]}
//                   selectedVehicleId={vehicleToTrack.vehicleId}
//                   onVehicleSelect={() => {}}
//                 />
//               </LoadScript>
//             </div>
//           </div>

//           {/* --- MODIFIED: Details Card --- */}
//           <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//             <h2 className="text-md font-bold text-purple-950 uppercase mb-4">
//               Live Data
//             </h2>
//             {/* The grid is now 3 columns for a cleaner look */}
//             <div className="grid grid-cols-2">
//               {/* The new, combined location/address field */}
//               <DetailItem label="Vehicle" value={vehicleToTrack.vehicleName} />

//               <div className="space-y-2">
//                 <DetailItem label="Last Seen" value={address} />

//                 <DetailItem
//                   label="Speed"
//                   value={`${vehicleToTrack.gps.speed} km/h`}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Travelers (Beacons) Section (no changes) */}
//           <BeaconDisplay
//             beacons={vehicleToTrack.beacons}
//             vehicleName={vehicleToTrack.vehicleName}
//           />
//         </div>
//       ) : (
//         <div className="mt-10 text-center text-gray-600">
//           <h2 className="text-xl font-bold">Live Data Not Available</h2>
//           <p>
//             This vehicle is currently offline or has not reported its location.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VehicleTrackPage;
