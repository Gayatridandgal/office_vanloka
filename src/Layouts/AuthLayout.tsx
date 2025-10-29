import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import IndexPage from "../Pages/RolesPermissions/IndexPage";
import EditPage from "../Pages/RolesPermissions/EditPage";
import CreatePage from "../Pages/RolesPermissions/CreatePage";
import GpsIndexPage from "../Pages/GpsDevices/GpsIndexPage";
import GpsCreatePage from "../Pages/GpsDevices/GpsCreatePage";
import GpsEditPage from "../Pages/GpsDevices/GpsEditPage";
import MobileHeader from "../Components/MobileHeader";
import BeaconIndexPage from "../Pages/BeaconDevices/BeaconIndexPage";
import BeaconCreatePage from "../Pages/BeaconDevices/BeaconCreatePage";
import BeaconEditPage from "../Pages/BeaconDevices/BeaconEditPage";
import VehicleIndexPage from "../Pages/Vehicles/VehicleIndexPage";
import VehicleShowPage from "../Pages/Vehicles/VehicleShowPage";
import VehicleCreatePage from "../Pages/Vehicles/VehicleCreatePage";
import VehicleEditPage from "../Pages/Vehicles/VehicleEditPage";
import DriverIndexPage from "../Pages/Drivers/DriverIndexPage";
import DriverShowPage from "../Pages/Drivers/DriverShowPage";
import DriverEditPage from "../Pages/Drivers/DriverEditPage";
import DriverCreatePage from "../Pages/Drivers/DriverCreatePage";
import BookingIndexPage from "../Pages/Bookings/BookingIndexPage";
import BookingShowPage from "../Pages/Bookings/BookingShowPage";
import TravelerIndexPage from "../Pages/Travelers/TravelerIndexPage";
import TravelerShowPage from "../Pages/Travelers/TravelerShowPage";
import BookingCreatePage from "../Pages/Bookings/BookingCreatePage";
import VehicleTrackPage from "../Pages/Vehicles/VehicleTrackPage";
import TravelerEditPage from "../Pages/Travelers/TravelerEditPage";
import StaffIndexPage from "../Pages/StaffUsers/StaffIndexPage";
import StaffCreatePage from "../Pages/StaffUsers/StaffCreatePage";
import StaffEditPage from "../Pages/StaffUsers/StaffEditPage";
import DashBoardPage2 from "../Pages/DashBoardPage2";

const AuthLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <main className="flex-grow flex flex-col transition-all duration-300">
        {/* Mobile Header with Toggle Button */}
        <MobileHeader title="Institute Panel" toggleSidebar={toggleSidebar} />

        <div className="p-2 overflow-y-auto">
          <Routes>
            {/* <Route path="dashboard" element={<DashBoardPage />} /> */}
            <Route path="dashboard" element={<DashBoardPage2 />} />

            {/* Roles and Permissions Pages*/}
            <Route path="roles_permissions" element={<IndexPage />} />
            <Route path="roles_permissions/create" element={<CreatePage />} />
            <Route path="roles_permissions/edit/:id" element={<EditPage />} />

            {/* Staff Management */}
            <Route path="staff" element={<StaffIndexPage />} />
            <Route path="staff/create" element={<StaffCreatePage />} />
            <Route path="staff/edit/:id" element={<StaffEditPage />} />

            {/* GPS Device Pages */}
            <Route path="gps" element={<GpsIndexPage />} />
            <Route path="gps/create" element={<GpsCreatePage />} />
            <Route path="gps/edit/:id" element={<GpsEditPage />} />

            {/* Beacon Device Pages */}
            <Route path="beacons" element={<BeaconIndexPage />} />
            <Route path="beacons/create" element={<BeaconCreatePage />} />
            <Route path="beacons/edit/:id" element={<BeaconEditPage />} />

            {/* Vehicle Pages */}
            <Route path="vehicles" element={<VehicleIndexPage />} />
            <Route path="vehicles/show/:id" element={<VehicleShowPage />} />
            <Route path="vehicles/create" element={<VehicleCreatePage />} />
            <Route path="vehicles/edit/:id" element={<VehicleEditPage />} />
            <Route path="/vehicles/track/:id" element={<VehicleTrackPage />} />

            {/* Driver Pages */}
            <Route path="drivers" element={<DriverIndexPage />} />
            <Route path="drivers/create" element={<DriverCreatePage />} />
            <Route path="drivers/show/:id" element={<DriverShowPage />} />
            <Route path="drivers/edit/:id" element={<DriverEditPage />} />

            {/* Booking Pages */}
            <Route path="bookings" element={<BookingIndexPage />} />
            <Route path="bookings/show/:id" element={<BookingShowPage />} />
            <Route path="bookings/create" element={<BookingCreatePage />} />

            {/* Traveler Pages */}
            <Route path="travelers" element={<TravelerIndexPage />} />
            <Route path="travelers/show/:id" element={<TravelerShowPage />} />
            <Route path="travelers/Edit/:id" element={<TravelerEditPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
