import { Link, useLocation } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { logout } from "../Services/AuthService";
import { useNavigate } from "react-router-dom";
import { IoSettings } from "react-icons/io5";

import { FaIdCard } from "react-icons/fa";

export default function BottomLink() {
  const location = useLocation();
  const links = [
    {
      path: "/settings",
      name: "Settings",
      icon: <IoSettings size={22} />,
    },
    {
      path: "/plan",
      name: "Plan",
      icon: <FaIdCard size={22} />,
    },
  ];

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <nav className="flex-grow px-2">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`flex items-center space-x-4 py-2 px-4 rounded-lg transition-all duration-80 ${
                link.path && location.pathname.startsWith(link.path)
                  ? "bg-purple-200 text-purple-950 shadow-xl font-bold"
                  : "text-purple-950 hover:bg-purple-200 hover:shadow-lg border border-gray-300"
              }`}
            >
              {link.icon}
              <span className="font-bold text-sm uppercase">{link.name}</span>
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 py-2 px-4 bg-purple-200 rounded-lg transition-all duration-300 text-purple-950 hover:bg-purple-300 hover:shadow-lg"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="font-bold text-sm uppercase">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
