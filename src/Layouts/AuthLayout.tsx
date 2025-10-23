import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import Dashboard from "../Pages/DashboardPage";
import IndexPage from "../Pages/RolesPermissions/Index";
import EditPage from "../Pages/RolesPermissions/EditPage";
import CreatePage from "../Pages/RolesPermissions/CreatePage";

const AuthLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <main className="flex-grow flex flex-col overflow-y-auto transition-all duration-300">
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
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="roles_permissions" element={<IndexPage />} />
          <Route path="roles_permissions/edit/:id" element={<EditPage />} />
          <Route path="roles_permissions/create" element={<CreatePage />} />
          {/* Add other nested routes here */}
        </Routes>
      </main>
    </div>
  );
};

export default AuthLayout;
