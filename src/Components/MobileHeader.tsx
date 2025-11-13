import React from "react";
import { FaBars } from "react-icons/fa";

interface PanelHeaderProps {
  title: string;
  toggleSidebar: () => void;
  bgColor?: string; // optional Tailwind color customization
  textColor?: string;
}

const MobileHeader: React.FC<PanelHeaderProps> = ({
  title,
  toggleSidebar,
  bgColor = "bg-white",
  textColor = "text-purple-950",
}) => {
  return (
    <div
      className={`xxl:hidden flex items-center justify-between py-5 shadow-sm ${bgColor} `}
    >
      <h1 className={`text-lg font-bold ${textColor} py-2 uppercase`}>
        
      </h1>
      <button
        onClick={toggleSidebar}
        className="md:hidden text-purple-800 focus:outline-none ring-2 focus:ring-purple-500 rounded-md p-2 mx-5"
      >
        <FaBars size={24} />
      </button>
    </div>
  );
};

export default MobileHeader;
