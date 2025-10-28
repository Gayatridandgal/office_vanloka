import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Dashboard from "../Pages/DashboardPage";
import IndexPage from "../Pages/RolesPermissions/Index";
import EditPage from "../Pages/RolesPermissions/EditPage";
import CreatePage from "../Pages/RolesPermissions/CreatePage";
import GpsIndexPage from "../Pages/GpsDevice/GpsIndex";
import GpsCreatePage from "../Pages/GpsDevice/GpsCreate";
import GpsEditPage from "../Pages/GpsDevice/GpsEdit";
import MobileHeader from "../Components/MobileHeader";
import BeaconIndexPage from "../Pages/BeaconDevices/BeaconIndex";
import BeaconCreatePage from "../Pages/BeaconDevices/BeaconCreate";
import BeaconEditPage from "../Pages/BeaconDevices/BeaconEdit";
import VehicleIndexPage from "../Pages/Vehicles/VehicleIndexPage";
import VehicleShowPage from "../Pages/Vehicles/VehicleShowPage";
import VehicleCreatePage from "../Pages/Vehicles/VehicleCreatePage";
import VehicleEditPage from "../Pages/Vehicles/VehicleEditPage";
import DriverIndexPage from "../Pages/Drivers/DriverIndexPage";
import DriverShowPage from "../Pages/Drivers/DriverShowPage";
import DriverEditPage from "../Pages/Drivers/DriverEditPage";
import DriverCreatePage from "../Pages/Drivers/DriverCreatePage";
import UserIndexPage from "../Pages/AppUser/UserIndexPage";
import UserCreatePage from "../Pages/AppUser/UserCreatePage";
import UserShowPage from "../Pages/AppUser/UserShowPage";
import UserEditPage from "../Pages/AppUser/UserEditPage";
import BookingIndexPage from "../Pages/Booking/BookingIndexPage";
import BookingShowPage from "../Pages/Booking/BookingShowPage";
import TravelerIndexPage from "../Pages/Traveler/TravelerIndexPage";
import TravelerShowPage from "../Pages/Traveler/TravelerShowPage";
import BookingCreatePage from "../Pages/Booking/BookingCreatePage";

const AuthLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen relative overflow-hidden text-sm">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <main className="flex-grow flex flex-col transition-all duration-300">
        {/* Mobile Header with Toggle Button */}
        <MobileHeader title="Institute Panel" toggleSidebar={toggleSidebar} />

        <div className="p-2 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />

            {/* Roles and Permissions Pages*/}
            <Route path="roles_permissions" element={<IndexPage />} />
            <Route path="roles_permissions/create" element={<CreatePage />} />
            <Route path="roles_permissions/edit/:id" element={<EditPage />} />

            {/* GPS Device Pages */}
            <Route path="gps_devices" element={<GpsIndexPage />} />
            <Route path="gps_devices/create" element={<GpsCreatePage />} />
            <Route path="gps_devices/edit/:id" element={<GpsEditPage />} />

            {/* Beacon Device Pages */}
            <Route path="beacon_devices" element={<BeaconIndexPage />} />
            <Route
              path="beacon_devices/create"
              element={<BeaconCreatePage />}
            />
            <Route
              path="beacon_devices/edit/:id"
              element={<BeaconEditPage />}
            />

            {/* Vehicle Pages */}
            <Route path="vehicles" element={<VehicleIndexPage />} />
            <Route path="vehicles/show/:id" element={<VehicleShowPage />} />
            <Route path="vehicles/create" element={<VehicleCreatePage />} />
            <Route path="vehicles/edit/:id" element={<VehicleEditPage />} />

            {/* Driver Pages */}
            <Route path="drivers" element={<DriverIndexPage />} />
            <Route path="drivers/create" element={<DriverCreatePage />} />
            <Route path="drivers/show/:id" element={<DriverShowPage />} />
            <Route path="drivers/edit/:id" element={<DriverEditPage />} />

            {/* User Pages */}
            <Route path="users" element={<UserIndexPage />} />
            <Route path="users/create" element={<UserCreatePage />} />
            <Route path="users/show/:id" element={<UserShowPage />} />
            <Route path="users/edit/:id" element={<UserEditPage />} />

            {/* Booking Pages */}
            <Route path="bookings" element={<BookingIndexPage />} />
            <Route path="bookings/show/:id" element={<BookingShowPage />} />
            <Route path="bookings/create" element={<BookingCreatePage />} />

            {/* Traveler Pages */}
            <Route path="travelers" element={<TravelerIndexPage />} />
            <Route path="travelers/show/:id" element={<TravelerShowPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
