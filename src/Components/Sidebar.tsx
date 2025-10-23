import SidebarLink from "./SidebarLink";
import BottomLink from "./BottomLink";

const Sidebar = ({ isOpen }: any) => {
  return (
    // The sidebar container is a flex column with full height.
    <div
      className={`fixed inset-y-0 left-0 w-72 bg-purple-200 text-white shadow-2xl z-50  transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-5">
        <h3 className="text-3xl font-extrabold uppercase tracking-wide text-purple-950 overflow-hidden">
          balaloka
        </h3>
        <p className="text-sm font-bold tracking-widest uppercase text-black">
          technologies
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
