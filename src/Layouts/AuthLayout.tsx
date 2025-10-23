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

        <div className="p-2">
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

            {/* Vehicles Pages */}
            <Route path="vehicles" element={<VehicleIndexPage />} />
            <Route path="vehicles/show/:id" element={<VehicleShowPage />} />
            <Route path="vehicles/create" element={<VehicleCreatePage />} />
            <Route path="vehicles/edit/:id" element={<VehicleEditPage />} />

            {/* Driver Pages */}
            <Route path="drivers" element={<DriverIndexPage />} />
            <Route path="drivers/create" element={<DriverCreatePage />} />
            <Route path="drivers/show/:id" element={<DriverShowPage />} />
            <Route path="drivers/edit/:id" element={<DriverEditPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
