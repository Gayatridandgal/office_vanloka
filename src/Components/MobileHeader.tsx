// import React from "react";
// import { FaBars } from "react-icons/fa";

// interface PanelHeaderProps {
//   title: string;
//   toggleSidebar: () => void;
//   bgColor?: string; // optional Tailwind color customization
//   textColor?: string;
// }

// const MobileHeader: React.FC<PanelHeaderProps> = ({
//   title,
//   toggleSidebar,
//   bgColor = "bg-white",
//   textColor = "text-purple-950",
// }) => {
//   return (
//     <div
//       className={`xxl:hidden flex items-center justify-between py-5 shadow-sm ${bgColor} `}
//     >
//       <h1 className={`text-lg font-bold ${textColor} py-2 uppercase`}>
        
//       </h1>
//       <button
//         onClick={toggleSidebar}
//         className="md:hidden text-purple-800 focus:outline-none ring-2 focus:ring-purple-500 rounded-md p-2 mx-5"
//       >
//         <FaBars size={24} />
//       </button>
//     </div>
//   );
// };

// export default MobileHeader;




import React from "react";
import { FaBars } from "react-icons/fa";

interface PanelHeaderProps {
  title: string;
  toggleSidebar: () => void;
}

const MobileHeader: React.FC<PanelHeaderProps> = ({ title, toggleSidebar }) => {
  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-lg transition-colors focus:outline-none"
        >
          <FaBars size={20} />
        </button>
        <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          {title}
        </h1>
      </div>

      {/* Optional: Add User Avatar or Notification Icon here for Mobile */}
      <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
        AD
      </div>
    </div>
  );
};

export default MobileHeader;
