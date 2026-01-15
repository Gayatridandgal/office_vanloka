import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import IndexPage from "../Pages/RolesPermissions/IndexPage";
import EditPage from "../Pages/RolesPermissions/EditPage";
import CreatePage from "../Pages/RolesPermissions/CreatePage";
import MobileHeader from "../Components/MobileHeader";
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
import StaffIndexPage from "../Pages/Staffs/StaffIndexPage";
import StaffCreatePage from "../Pages/Staffs/StaffCreatePage";
import StaffEditPage from "../Pages/Staffs/StaffEditPage";
import VehicleTrackPage from "../Pages/Vehicles/VehicleTrackPage";
import TravellerIndexPage from "../Pages/Travelers/TravellerIndexPage";
import TravellerShowPage from "../Pages/Travelers/TravellerShowPage";
import TravellerEditPage from "../Pages/Travelers/TravellerEditPage";
import StaffShowPage from "../Pages/Staffs/StaffShowPage";
import DashboardPage from "../Pages/DashboardPage";

const AuthLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Sidebar - Fixed on desktop */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden transition-all duration-300 ease-in-out">

        {/* Mobile Header (Fixed at top inside main) */}
        <MobileHeader title="Admin Panel" toggleSidebar={toggleSidebar} />

        <div className="flex-1 h-full w-full mt-4">
          <div className="mx-auto w-full h-full">
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Roles and Permissions Pages*/}
              <Route path="roles_permissions" element={<IndexPage />} />
              <Route path="roles_permissions/create" element={<CreatePage />} />
              <Route path="roles_permissions/edit/:id" element={<EditPage />} />

              {/* Staff Management */}
              <Route path="staff" element={<StaffIndexPage />} />
              <Route path="staff/create" element={<StaffCreatePage />} />
              <Route path="staff/edit/:id" element={<StaffEditPage />} />
              <Route path="staff/show/:id" element={<StaffShowPage />} />

              {/* Vehicle Pages */}
              <Route path="vehicles" element={<VehicleIndexPage />} />
              <Route path="vehicles/show/:id" element={<VehicleShowPage />} />
              <Route path="vehicles/create" element={<VehicleCreatePage />} />
              <Route path="vehicles/edit/:id" element={<VehicleEditPage />} />
              <Route path="/vehicles/track/:vehicleNumber" element={<VehicleTrackPage />} />

              {/* Driver Pages */}
              <Route path="drivers" element={<DriverIndexPage />} />
              <Route path="drivers/create" element={<DriverCreatePage />} />
              <Route path="drivers/show/:id" element={<DriverShowPage />} />
              <Route path="drivers/edit/:id" element={<DriverEditPage />} />

              {/* Booking Pages */}
              <Route path="bookings" element={<BookingIndexPage />} />
              <Route path="bookings/show/:id" element={<BookingShowPage />} />

              {/* Traveller Pages */}
              <Route path="travellers" element={<TravellerIndexPage />} />
              <Route path="travellers/show/:id" element={<TravellerShowPage />} />
              <Route path="travellers/edit/:id" element={<TravellerEditPage />} />

            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
