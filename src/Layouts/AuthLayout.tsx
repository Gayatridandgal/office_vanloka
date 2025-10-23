import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import Dashboard from "../Pages/DashboardPage";
import IndexPage from "../Pages/RolesPermissions/Index";
import EditPage from "../Pages/RolesPermissions/EditPage";
import CreatePage from "../Pages/RolesPermissions/CreatePage";
import GpsIndexPage from "../Pages/GpsDevice/GpsIndex";
import GpsCreatePage from "../Pages/GpsDevice/GpsCreate";
import GpsEditPage from "../Pages/GpsDevice/GpsEdit";

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
        <div className="xxl:hidden flex items-center justify-between py-2 mb-4 bg-purple-100 shadow-md">
          <h1 className="text-lg font-bold text-purple-950 p-3 uppercase">
            Institute Panel
          </h1>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-purple-800 focus:outline-none ring-2 focus:ring-purple-500 rounded-md p-2 mx-5"
          >
            <FaBars size={24} />
          </button>
        </div>
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
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
