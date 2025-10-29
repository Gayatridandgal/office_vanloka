import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdOutlineSupportAgent } from "react-icons/md";
import { BsBusFront } from "react-icons/bs";
import { FaUserShield } from "react-icons/fa6";
import { FaBusinessTime } from "react-icons/fa6";
import { FaRegAddressBook } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import type { SidebarLinkType } from "../Types/Index";
import { GrBeacon, GrOrganization } from "react-icons/gr";
import { app_features as userFeatures } from "../Data/Index";
import { HiUsers } from "react-icons/hi";
import { RiGpsFill } from "react-icons/ri";

const sidebarLinks: SidebarLinkType[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard size={22} />,
    feature: "VIEW_DASHBOARD",
  },

  {
    name: "Roles & Permissions",
    path: "/roles_permissions",
    icon: <FaUsersCog size={22} />,
    feature: "MANAGE_VEHICLES",
  },

  {
    name: "Staff/Emp Management",
    path: "/staff",
    icon: <FaUserShield size={22} />,
    feature: "MANAGE_VEHICLES",
  },

  {
    name: "Vehicle Management",
    path: "/vehicles",
    icon: <BsBusFront size={22} />,
    feature: "MANAGE_VEHICLES",
  },

  {
    name: "Driver Management",
    path: "/drivers",
    icon: <HiUsers size={22} />,
    feature: "MANAGE_DRIVERS",
  },

  {
    name: "GPS Devices",
    path: "/gps",
    icon: <RiGpsFill size={22} />,
    feature: "MANAGE_GPS",
  },

  {
    name: "Beacon Devices",
    path: "/beacons",
    icon: <GrBeacon size={22} />,
    feature: "MANAGE_BEACON",
  },

  // {
  //   name: "Users Management",
  //   path: "/users",
  //   icon: <FaUsers size={22} />,
  //   feature: "MANAGE_USERS",
  // },

  {
    name: "Travelers Management",
    path: "/travelers",
    icon: <FaBusinessTime size={22} />,
    feature: "MANAGE_TRAVELERS",
  },

  {
    name: "Bookings Management",
    path: "/bookings",
    icon: <FaRegAddressBook size={22} />,
    feature: "MANAGE_BOOKINGS",
  },

  {
    name: "Vendor Management",
    path: "/vendors",
    icon: <GrOrganization size={22} />,
    feature: "MANAGE_TRAVELERS",
  },

  // {
  //   name: "Training Management",
  //   path: "/trainings",
  //   icon: <GiTrail size={22} />,
  //   feature: "MANAGE_TRAININGS",
  // },

  {
    name: "Rase Support Ticket",
    path: "/support-tickets",
    icon: <MdOutlineSupportAgent size={22} />,
    feature: "MANAGE_SUPPORT_TICKETS",
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
  // Filter links based on the user's features
  const accessibleLinks = sidebarLinks
    .filter((link) => userFeatures.includes(link.feature)) // First, filter parent links
    .map((link) => {
      // If the link has sub-links, we also need to filter them
      if (link.subLinks) {
        return {
          ...link,
          subLinks: link.subLinks.filter((sub) =>
            userFeatures.includes(sub.feature)
          ),
        };
      }
      return link;
    });

  // Find the active parent link to determine which dropdown should be open on page load
  // const activeParent = accessibleLinks.find((link) =>
  //   link.subLinks?.some((sub) => location.pathname.startsWith(sub.path))
  // );

  // State to track which dropdown is currently open
  // const [openDropdown, setOpenDropdown] = useState<string | null>(
  //   activeParent?.name || null
  // );

  // const handleDropdownToggle = (name: string) => {
  //   setOpenDropdown((current) => (current === name ? null : name)); // Toggle logic
  // };

  return (
    <nav className="flex-grow px-2">
      <ul className="space-y-2">
        {accessibleLinks.map((link) => {
          // const isDropdown = link.subLinks && link.subLinks.length > 0;

          // --- RENDER A DROPDOWN MENU ---
          // if (isDropdown) {
          //   const isParentActive = activeParent?.name === link.name;
          //   return (
          //     <li key={link.name}>
          //       <button
          //         onClick={() => handleDropdownToggle(link.name)}
          //         className={`flex w-full items-center justify-between py-2 px-4 rounded transition-all duration-80 ${
          //           isParentActive
          //             ? "bg-purple-400 text-white shadow-lg border-l-2 border-r-2 border-white font-bold"
          //             : "text-purple-950 hover:bg-purple-300 hover:shadow-lg"
          //         }`}
          //       >
          //         <div className="flex items-center space-x-4">
          //           {link.icon}
          //           <span className="font-bold text-sm uppercase">
          //             {link.name}
          //           </span>
          //         </div>
          //         <FaAngleDown
          //           className={`transition-transform duration-300 ${
          //             openDropdown === link.name ? "rotate-180" : ""
          //           }`}
          //         />
          //       </button>
          //       {openDropdown === link.name && (
          //         <ul className="pt-2 pl-8 space-y-1">
          //           {link.subLinks!.map((subLink) => (
          //             <li key={subLink.path}>
          //               <Link
          //                 to={subLink.path}
          //                 className={`block py-1 px-3 rounded-full text-sm font-semibold uppercase transition-all duration-300 ${
          //                   location.pathname === subLink.path
          //                     ? "text-purple-950 bg-purple-300"
          //                     : "text-purple-950"
          //                 }`}
          //               >
          //                 {subLink.name}
          //               </Link>
          //             </li>
          //           ))}
          //         </ul>
          //       )}
          //     </li>
          //   );
          // }

          // --- RENDER A STANDARD, SINGLE LINK ---
          return (
            <li key={link.name}>
              <Link
                to={link.path!}
                className={`flex items-center space-x-4 py-2 px-4 rounded-lg transition-all duration-80 ${
                  link.path && location.pathname.startsWith(link.path)
                    ? "bg-purple-200 text-purple-950 shadow-xl font-bold border border-gray-300"
                    : "text-purple-950 hover:bg-purple-100  "
                }`}
              >
                {link.icon}
                <span className="font-bold text-sm uppercase">{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
