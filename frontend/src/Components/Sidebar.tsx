import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToolkit } from "../Utils/Toolkit";
// import { app_features } from "../Data/Index";
// import type { SidebarLinkType } from "../Types/Index";

// Icons
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaAngleDown, FaUserShield, FaRegAddressBook, FaBusinessTime, FaFilePdf } from "react-icons/fa6";

import { FaUsersCog, FaUsers } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { BsBusFront } from "react-icons/bs";
import { logout } from "../Services/AuthService";
import { IoSettings } from "react-icons/io5";
import { SiGooglemessages } from "react-icons/si";
import { PiUsersThreeFill } from "react-icons/pi";
import { MdDevices } from "react-icons/md";
import type { SidebarLinkType } from "../Types/Index";

// Temporarily defining app_features to unblock UI
const app_features = [
  "VIEW DASHBOARD",
  "MANAGE ROLE PERMISIONS",
  "MANAGE EMPLOYEES",
  "MANAGE VEHICLES",
  "MANAGE DRIVERS",
  "MANAGE DEVICES",
  "MANAGE APP USERS",
  "MANAGE TRAVELERS",
  "MANAGE BOOKINGS",
];

// --- Link Configuration ---
const sidebarLinks: SidebarLinkType[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard size={22} />,
    feature: "VIEW DASHBOARD",
    requiredPermissions: ["view dashboard"],
  },

  {
    name: "Roles & Permissions",
    path: "/roles_permissions",
    icon: <FaUsersCog size={22} />,
    feature: "MANAGE ROLE PERMISIONS",
    requiredPermissions: ["view role permissions"],
  },

  {
    name: "Staff/Emp Management",
    path: "/staff",
    icon: <FaUserShield size={22} />,
    feature: "MANAGE EMPLOYEES",
    requiredPermissions: ["view employees"],
  },


  {
    name: "Vehicle Management",
    path: "/vehicles",
    icon: <BsBusFront size={22} />,
    feature: "MANAGE VEHICLES",
    requiredPermissions: ["view vehicles"],
  },

  {
    name: "Driver Management",
    path: "/drivers",
    icon: <HiUsers size={22} />,
    feature: "MANAGE DRIVERS",
    requiredPermissions: ["view drivers"],
  },

  {
    name: "Device Management",
    path: "/devices",
    icon: <MdDevices size={22} />,
    feature: "MANAGE DEVICES",
  },

  {
    name: "App Users",
    path: "/app-users",
    icon: <FaUsers size={20} />,
    feature: "MANAGE APP USERS",
  },

  {
    name: "Travellers Management",
    path: "/travellers",
    icon: <FaBusinessTime size={22} />,
    feature: "MANAGE TRAVELERS",
    requiredPermissions: ["view travellers"],
  },

  {
    name: "Bookings Management",
    path: "/bookings",
    icon: <FaRegAddressBook size={22} />,
    feature: "MANAGE BOOKINGS",
    requiredPermissions: ["view bookings"],
  },

  { name: "Vendor Management", path: "/vendors", icon: <PiUsersThreeFill size={20} />, feature: "MANAGE BOOKINGS", requiredPermissions: ["view bookings"], },
  { name: "Feedbacks", path: "/feedbacks", icon: <SiGooglemessages size={20} />, feature: "MANAGE BOOKINGS", requiredPermissions: ["view bookings"], },

  { name: "Reports", path: "/reports", icon: <FaFilePdf size={20} />, feature: "MANAGE BOOKINGS", requiredPermissions: ["view bookings"], },
  { name: "Settings", path: "/settings", icon: <IoSettings size={20} />, feature: "MANAGE BOOKINGS", requiredPermissions: ["view bookings"], },

  // drop down link example
  // {
  //   name: "Masters",
  //   icon: <IoIosAddCircle size={22} />,
  //   feature: "ALL_ACCESS",
  //   subLinks: [
  //     { name: "Bus Stops", path: "/masters/pickup-locations", feature: "ALL_ACCESS", icon: <MdLocationOn size={18} /> },
  //     { name: "Form Fields", path: "/masters/form-fields", feature: "ALL_ACCESS", icon: <FaRegFileLines size={16} /> },
  //     { name: "States & Districts", path: "/masters/state-districts", feature: "ALL_ACCESS", icon: <FaLocationCrosshairs size={16} /> },
  //   ],
  // },

];
interface Props {
  isOpen: boolean;
  closeSidebar: () => void; // Added for mobile backdrop click
}

const Sidebar = ({ isOpen, closeSidebar }: Props) => {
  const location = useLocation();
  const { canAny, roles } = useToolkit();
  const isAdmin = roles.some((role) => role?.toLowerCase?.() === "admin");

  // 1. Filter Links Logic
  const accessibleLinks = sidebarLinks
    .filter((link) => app_features.includes(link.feature))
    .filter((link) => {
      if (!link.requiredPermissions || link.requiredPermissions.length === 0) return true;
      if (isAdmin) return true;
      return canAny(link.requiredPermissions);
    })
    .map((link) => {
      if (link.subLinks) {
        return {
          ...link,
          subLinks: link.subLinks.filter((sub) => {
            const featureAllowed = app_features.includes(sub.feature);
            const perms = sub.requiredPermissions;
            if (!perms || perms.length === 0) return featureAllowed;
            if (isAdmin) return featureAllowed;
            return featureAllowed && canAny(perms);
          }),
        };
      }
      return link;
    });

  // 2. Dropdown State
  const activeParent = accessibleLinks.find((link) =>
    link.subLinks?.some((sub) => location.pathname.startsWith(sub.path))
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(activeParent?.name || null);

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };


  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeSidebar}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 shadow-xl z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-xl font-extrabold uppercase tracking-wide text-purple-900 leading-none">
              Office
            </h3>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-800 mt-1">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {accessibleLinks.map((link) => {
            const isDropdown = link.subLinks && link.subLinks.length > 0;

            // --- DROPDOWN ITEM ---
            if (isDropdown) {
              const isParentActive = activeParent?.name === link.name;
              const isOpen = openDropdown === link.name;

              return (
                <div key={link.name} className="mb-1">
                  <button
                    onClick={() => handleDropdownToggle(link.name)}
                    className={`flex w-full items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${isParentActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "text-slate-800 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transition-colors ${isParentActive ? "text-white" : "text-slate-800 group-hover:text-slate-600"}`}>
                        {link.icon}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {link.name}
                      </span>
                    </div>
                    <FaAngleDown
                      size={12}
                      className={`transition-transform duration-300 text-slate-400 ${isOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                      }`}
                  >
                    <ul className="pl-4 space-y-2 mt-2 border-l-2 border-slate-100 ml-4">
                      {link.subLinks!.map((subLink) => {
                        const isSubActive = location.pathname === subLink.path;
                        return (
                          <li key={subLink.path}>
                            <Link
                              to={subLink.path}
                              onClick={closeSidebar} // Close on mobile click
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 ${isSubActive
                                ? "text-purple-700 bg-purple-100 border border-purple-500"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                              <span className={isSubActive ? "text-purple-500" : "text-slate-400"}>
                                {subLink.icon}
                              </span>
                              {subLink.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            }

            // --- SINGLE ITEM ---
            const isActive = link.path && location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path!}
                onClick={closeSidebar} // Close on mobile click
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mb-1 ${isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                  : "text-slate-800 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span className={`shrink-0 ${isActive ? "text-purple-100" : "text-slate-800 group-hover:text-slate-600"}`}>
                  {link.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout Section */}
        <div className="p-2 border-t border-slate-200 bg-slate-50" onClick={handleLogout} >
          <button className="flex items-center gap-3 w-full px-4 p-2 text-slate-600 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-lg transition-all duration-200 uppercase text-xs font-bold">
            <MdLogout size={18} />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
