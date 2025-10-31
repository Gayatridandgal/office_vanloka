import SidebarLink from "./SidebarLink";
import BottomLink from "./BottomLink";

interface Props {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: Props) => {
  return (
    // The sidebar container is a flex column with full height.
    <div
      className={`fixed inset-y-0 left-0 w-72 border border-gray-200 bg-white text-white z-50  transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-2 border-b border-gray-200 border mb-4 bg-purple-50">
        <h3 className="text-2xl font-extrabold uppercase tracking-wide text-purple-950 overflow-hidden">
          Inst/org Admin
        </h3>
        <p className="text-sm font-bold uppercase text-black">
          Fleet Tracking System
        </p>
      </div>

      {/* The main navigation links, which will grow to fill available space */}
      <SidebarLink />

      {/* The Logout button container. 'mt-auto' pushes it to the bottom. */}
      <div className="mt-auto mb-4">
        <BottomLink />
      </div>
    </div>
  );
};

export default Sidebar;
