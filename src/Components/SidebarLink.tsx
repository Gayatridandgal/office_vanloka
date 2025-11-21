import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdOutlineSupportAgent } from "react-icons/md";
import { FaAngleDown, FaBusinessTime, FaRegAddressBook, FaUserCheck, FaUserShield } from "react-icons/fa";
import { GrOrganization } from "react-icons/gr";
import { FaUsersCog } from "react-icons/fa";
import type { SidebarLinkType } from "../Types/Index";
import { app_features } from "../Data/Index";
import { useState } from "react";
import { BsBusFront } from "react-icons/bs";
import { HiOutlineDocumentReport, HiUsers } from "react-icons/hi";
import { TbReport } from "react-icons/tb";
import { useToolkit } from "../Utils/Toolkit";

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
    name: "Attender Management",
    path: "/attenders",
    icon: <FaUserShield size={22} />,
    feature: "MANAGE ATTENDERS",
    requiredPermissions: ["view attenders"],
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
    name: "Instructor Management",
    path: "/instructors",
    icon: <FaUserCheck size={22} />,
    feature: "MANAGE INSTRUCTORS",
    requiredPermissions: ["view instructors"],
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

  {
    name: "Vendor Management",
    path: "/vendors",
    icon: <GrOrganization size={22} />,
    feature: "MANAGE VENDORS",
    requiredPermissions: ["view vendors"],
  },

  {
    name: "Rase Support Ticket",
    path: "/support_tickets",
    icon: <MdOutlineSupportAgent size={22} />,
    feature: "MANAGE SUPPORT TICKETS",
    requiredPermissions: ["view support tickets"],
  },

  {
    name: "Basic Reports",
    path: "/basic_reports",
    icon: <HiOutlineDocumentReport size={22} />,
    feature: "VIEW BASIC REPORTS",
    requiredPermissions: ["view basic reports"],
  },

  {
    name: "compliance Reports",
    path: "/complience_reports",
    icon: <TbReport size={22} />,
    feature: "VIEW COMPLIANCE REPORTS",
    requiredPermissions: ["view compliance reports"],
  },

  // Dropdown link example
  // {
  //     name: "User Management",
  //     icon: <PiUsersFill size={22} />,
  //     feature: "MANAGE_USERS",
  //     subLinks: [
  //         { name: "All Users", path: "/users", feature: "MANAGE_USERS" },
  //         { name: "User Roles", path: "/users/roles", feature: "MANAGE_ROLES" },
  //     ]
  // },

];

export default function Sidebar() {
  const location = useLocation();
  const { canAny } = useToolkit();

  // Filter links based on the user's features and permissions
  const accessibleLinks = sidebarLinks
    .filter((link) => app_features.includes(link.feature))
    .filter((link) => {
      if (!link.requiredPermissions || link.requiredPermissions.length === 0) {
        return true;
      }
      return canAny(link.requiredPermissions);
    })
    .map((link) => {
      if (link.subLinks) {
        return {
          ...link,
          subLinks: link.subLinks.filter((sub) => {
            const featureAllowed = app_features.includes(sub.feature);
            const perms = sub.requiredPermissions;
            if (!perms || perms.length === 0) {
              return featureAllowed;
            }
            return featureAllowed && canAny(perms);
          }),
        };
      }
      return link;
    });

  // Find the active parent link to determine which dropdown should be open on page load
  const activeParent = accessibleLinks.find((link) =>
    link.subLinks?.some((sub) => location.pathname.startsWith(sub.path))
  );

  // State to track which dropdown is currently open
  const [openDropdown, setOpenDropdown] = useState<string | null>(
    activeParent?.name || null
  );

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  return (
    <nav className="flex-1 px-2">
      <ul className="space-y-2">
        {accessibleLinks.map((link) => {
          const isDropdown = link.subLinks && link.subLinks.length > 0;

          // --- RENDER A DROPDOWN MENU ---
          if (isDropdown) {
            const isParentActive = activeParent?.name === link.name;
            const isOpen = openDropdown === link.name;

            return (
              <li key={link.name}>
                <button
                  onClick={() => handleDropdownToggle(link.name)}
                  className={`flex w-full items-center justify-between py-2.5 px-4 rounded-lg transition-all duration-200 ${isParentActive
                    ? "bg-purple-950 text-white shadow-sm"
                    : "text-purple-950 hover:bg-purple-100 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="shrink-0">{link.icon}</span>
                    <span className="font-bold text-sm uppercase tracking-wide">
                      {link.name}
                    </span>
                  </div>
                  <FaAngleDown
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>

                {/* Dropdown Submenu with smooth animation */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <ul className="mt-1 ml-4 space-y-1">
                    {link.subLinks!.map((subLink) => {
                      const isSubActive = location.pathname === subLink.path;
                      return (
                        <li key={subLink.path}>
                          <Link
                            to={subLink.path}
                            className={`flex items-center space-x-3 py-2 px-4 rounded-lg text-sm font-semibold uppercase transition-all duration-200 ${isSubActive
                              ? "border-b-2 border-purple-800"
                              : "text-purple-800 hover:bg-purple-50 hover:text-purple-950"
                              }`}
                          >
                            <span className="shrink-0">
                              {subLink.icon}
                            </span>
                            <span className="tracking-wide">{subLink.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          }

          // --- RENDER A STANDARD, SINGLE LINK ---
          const isActive = link.path && location.pathname.startsWith(link.path);
          return (
            <li key={link.name}>
              <Link
                to={link.path!}
                className={`flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-purple-950 text-white shadow-sm"
                  : "text-purple-950 hover:bg-purple-100 hover:shadow-md"
                  }`}
              >
                <span className="shrink-0">{link.icon}</span>
                <span className="font-bold text-sm uppercase tracking-wide">
                  {link.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
