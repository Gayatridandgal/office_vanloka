import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToolkit } from "../Utils/Toolkit";

// Icons
import { MdDashboard, MdLogout, MdDevices } from "react-icons/md";
import { FaAngleDown, FaUserShield, FaRegAddressBook, FaBusinessTime, FaFilePdf } from "react-icons/fa6";
import { FaUsersCog, FaUsers, FaBalanceScale } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { BsBusFront } from "react-icons/bs";
import { SiGooglemessages } from "react-icons/si";
import { PiUsersThreeFill } from "react-icons/pi";
import { IoSettings } from "react-icons/io5";
import { logout } from "../Services/AuthService";
import { Search, Bell, Bus, LogOut } from "lucide-react";
import type { SidebarLinkType } from "../Types/Index";

// Define app_features locally
const app_features = [
  "VIEW DASHBOARD",
  "MANAGE ROLE PERMISIONS",
  "MANAGE EMPLOYEES",
  "MANAGE VEHICLES",
  "MANAGE DRIVERS",
  "MANAGE COMPLIANCE",
  "MANAGE DEVICES",
  "MANAGE APP USERS",
  "MANAGE TRAVELERS",
  "MANAGE BOOKINGS",
];

const sidebarLinks: SidebarLinkType[] = [
  { name: "Dashboard", path: "/dashboard", icon: <MdDashboard size={22} />, feature: "VIEW DASHBOARD" },
  { name: "Roles & Permissions", path: "/roles_permissions", icon: <FaUsersCog size={22} />, feature: "MANAGE ROLE PERMISIONS" },
  { name: "Staff/Emp Management", path: "/staff", icon: <FaUserShield size={22} />, feature: "MANAGE EMPLOYEES" },
  { name: "Vehicle Management", path: "/vehicles", icon: <BsBusFront size={22} />, feature: "MANAGE VEHICLES" },
  { name: "Driver Management", path: "/drivers", icon: <HiUsers size={22} />, feature: "MANAGE DRIVERS" },
  { name: "Compliance & Laws", path: "/compliance", icon: <FaBalanceScale size={20} />, feature: "MANAGE COMPLIANCE" },
  { name: "Device Management", path: "/devices", icon: <MdDevices size={22} />, feature: "MANAGE DEVICES" },
  { name: "App Users", path: "/app-users", icon: <FaUsers size={20} />, feature: "MANAGE APP USERS" },
  { name: "Travellers Management", path: "/travellers", icon: <FaBusinessTime size={22} />, feature: "MANAGE TRAVELERS" },
  { name: "Bookings Management", path: "/bookings", icon: <FaRegAddressBook size={22} />, feature: "MANAGE BOOKINGS" },
  { name: "Vendor Management", path: "/vendors", icon: <PiUsersThreeFill size={20} />, feature: "MANAGE BOOKINGS" },
  { name: "Feedbacks", path: "/feedbacks", icon: <SiGooglemessages size={20} />, feature: "MANAGE BOOKINGS" },
  { name: "Reports", path: "/reports", icon: <FaFilePdf size={20} />, feature: "MANAGE BOOKINGS" },
  { name: "Settings", path: "/settings", icon: <IoSettings size={20} />, feature: "MANAGE BOOKINGS" },
];

interface Props {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: Props) => {
  const location = useLocation();
  const { canAny, roles } = useToolkit();
  const isAdmin = roles.some((role) => role?.toLowerCase?.() === "admin");
  const navigate = useNavigate();

  const accessibleLinks = sidebarLinks.filter((link) => {
    if (!app_features.includes(link.feature)) return false;
    return true; // Simplified for restore
  });

  const activeParent = accessibleLinks.find((link) =>
    link.subLinks?.some((sub) => location.pathname.startsWith(sub.path))
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(activeParent?.name || null);

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`mds-sidebar-overlay fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeSidebar}
      />

      <div
        className={`mds-sidebar fixed inset-y-0 left-0 z-50 flex flex-col transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-24 flex items-center pr-4 pl-6 mb-2">
          <div className="flex items-center gap-4 w-full">
             <div className="w-12 h-12 bg-[#6366f1] rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <BsBusFront size={24} />
             </div>
             <div className="flex-1">
                <h3 className="text-[16px] font-bold text-slate-800 leading-tight">Office</h3>
                <p className="text-[11px] font-bold text-slate-400 tracking-wide mt-0.5 uppercase">Admin Panel</p>
             </div>
             <Link to="/notifications" className="relative w-10 h-10 bg-slate-100 rounded-xl text-slate-500 flex items-center justify-center cursor-pointer hover:text-[#6366f1] transition-all shrink-0">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full text-[11px] text-white flex items-center justify-center font-bold shadow-sm">3</span>
             </Link>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
          {accessibleLinks.map((link) => {
            const isActive = link.path && location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path!}
                onClick={closeSidebar}
                className={`flex items-center gap-4 py-2.5 px-3 mb-2 rounded-xl transition-all ${isActive ? "" : "hover:bg-slate-50"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${isActive ? "bg-[#e0e7ff] text-[#6366f1]" : "bg-[#f1f5f9] text-slate-600"}`}>
                  {link.icon}
                </div>
                <span className={`text-[15px] ${isActive ? "font-bold text-[#6366f1]" : "font-medium text-slate-800"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-6 py-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-bold text-sm tracking-wide">
                  DU
               </div>
               <div>
                  <h4 className="text-[15px] font-bold text-slate-800 leading-tight">Dev User</h4>
                  <p className="text-[13px] font-medium text-slate-400 mt-0.5">hr@tcs.com</p>
               </div>
            </div>
            <button className="text-slate-400 hover:text-rose-500 transition-colors p-2 -mr-2" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
