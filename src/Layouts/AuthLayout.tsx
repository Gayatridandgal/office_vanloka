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
import TravelerIndexPage from "../Pages/Travelers/TravelerIndexPage";
import TravelerShowPage from "../Pages/Travelers/TravelerShowPage";
import StaffIndexPage from "../Pages/Staffs/StaffIndexPage";
import StaffCreatePage from "../Pages/Staffs/StaffCreatePage";
import StaffEditPage from "../Pages/Staffs/StaffEditPage";
import DashBoardPage from "../Pages/DashBoardPage";
import InstructorIndexPage from "../Pages/Instructors/InstructorIndexPage";
import InstructorCreatePage from "../Pages/Instructors/InstructorCreatePage";
import InstructorShowPage from "../Pages/Instructors/InstructorShowPage";
import InstructorEditPage from "../Pages/Instructors/InstructorEditpage";

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

        {/* 
           Content Container:
           - overflow-y-auto: Allows the page content (like Forms) to scroll if it gets too long.
           - h-full: Takes remaining height.
           - For Table Pages: Because we used 'maxHeight' on tables, they will scroll internally 
             and likely won't trigger this outer scrollbar, giving you that "Application" feel.
        */}
        <div className="flex-1 h-full w-full mt-4">
          <div className="mx-auto w-full h-full">
            <Routes>
              {/* <Route path="dashboard" element={<DashBoardPage />} /> */}
              <Route path="dashboard" element={<DashBoardPage />} />

              {/* Roles and Permissions Pages*/}
              <Route path="roles_permissions" element={<IndexPage />} />
              <Route path="roles_permissions/create" element={<CreatePage />} />
              <Route path="roles_permissions/edit/:id" element={<EditPage />} />

              {/* Staff Management */}
              <Route path="staff" element={<StaffIndexPage />} />
              <Route path="staff/create" element={<StaffCreatePage />} />
              <Route path="staff/edit/:id" element={<StaffEditPage />} />

              {/* GPS Device Pages */}
              {/* <Route path="gps" element={<GpsIndexPage />} />
              <Route path="gps/create" element={<GpsCreatePage />} />
              <Route path="gps/edit/:id" element={<GpsEditPage />} /> */}

              {/* Beacon Device Pages */}
              {/* <Route path="beacons" element={<BeaconIndexPage />} />
              <Route path="beacons/create" element={<BeaconCreatePage />} />
              <Route path="beacons/edit/:id" element={<BeaconEditPage />} /> */}

              {/* Vehicle Pages */}
              <Route path="vehicles" element={<VehicleIndexPage />} />
              <Route path="vehicles/show/:id" element={<VehicleShowPage />} />
              <Route path="vehicles/create" element={<VehicleCreatePage />} />
              <Route path="vehicles/edit/:id" element={<VehicleEditPage />} />
              {/* <Route path="/vehicles/track/:id" element={<VehicleTrackPage />} /> */}

              {/* Driver Pages */}
              <Route path="drivers" element={<DriverIndexPage />} />
              <Route path="drivers/create" element={<DriverCreatePage />} />
              <Route path="drivers/show/:id" element={<DriverShowPage />} />
              <Route path="drivers/edit/:id" element={<DriverEditPage />} />

              {/* Booking Pages */}
              <Route path="bookings" element={<BookingIndexPage />} />
              <Route path="bookings/show/:id" element={<BookingShowPage />} />
              {/* <Route path="bookings/create" element={<BookingCreatePage />} /> */}

              {/* Traveler Pages */}
              <Route path="travellers" element={<TravelerIndexPage />} />
              <Route path="travellers/show/:id" element={<TravelerShowPage />} />
              {/* <Route path="travellers/Edit/:id" element={<TravelerEditPage />} /> */}

              {/* Plan Detail Page */}
              {/* <Route path="plan" element={<MyPlanPage />} /> */}

              {/*Instructor */}
              <Route path="instructors" element={<InstructorIndexPage />} />
              <Route
                path="instructors/create"
                element={<InstructorCreatePage />}
              />
              <Route
                path="instructors/show/:id"
                element={<InstructorShowPage />}
              />
              <Route
                path="instructors/edit/:id"
                element={<InstructorEditPage />}
              />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
