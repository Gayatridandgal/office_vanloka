// src/Pages/Staffs/StaffIndexPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icons (Lucide)
import { 
  Search, 
  Eye, 
  FileText, 
  Users, 
  UserCheck, 
  Umbrella, 
  UserX,
  ChevronDown,
  Mail,
  Phone
} from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";

// Services & Utils
import tenantApi from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Employee } from "./Staff.types";

const StaffIndexPage = () => {
  const { showAlert } = useAlert();

  // Data State
  const [staffList, setStaffList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [perPage] = useState(10);

  // 1. Fetch Staff Data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: perPage,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
      };

      const response = await tenantApi.get("/employees", { params });
      const { data, current_page, last_page, total } = response.data.data;

      setStaffList(data);
      setCurrentPage(current_page || 1);
      setTotalPages(last_page || 1);
      setTotalItems(total || 0);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      showAlert("Failed to load staff data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Roles for Filter
  const fetchRoles = async () => {
    try {
      const response = await tenantApi.get("/roles");
      setRoles(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, statusFilter, roleFilter, perPage]);

  // Derived Stats
  const stats = [
    { label: "Total Staff", value: totalItems, sub: `${staffList.filter(s => s.status === 'active').length} active`, icon: <Users size={20} />, color: "border-purple-100", iconBg: "bg-purple-50", iconCol: "text-purple-600" },
    { label: "Active", value: staffList.filter(s => s.status === 'active').length, icon: <UserCheck size={20} />, color: "border-emerald-100", iconBg: "bg-emerald-50", iconCol: "text-emerald-600" },
    { label: "On Leave", value: staffList.filter(s => s.status === 'on leave').length, icon: <Umbrella size={20} />, color: "border-amber-100", iconBg: "bg-amber-50", iconCol: "text-amber-600" },
    { label: "Inactive", value: staffList.filter(s => s.status === 'inactive').length, icon: <UserX size={20} />, color: "border-red-100", iconBg: "bg-red-50", iconCol: "text-red-600" }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-start">
        <div>
           <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Users size={18} />
              <h1 className="text-xl font-900 tracking-wider uppercase">Staff Management</h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-bold text-muted uppercase">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark">Staff Management</span>
           </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-success flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg focus:ring-0">
             <FileText size={16} />
             <span className="hidden md:inline font-800 text-[11px] uppercase tracking-wider">Import Excel</span>
          </button>
          <button className="btn btn-outline border-slate-200 text-slate-600 flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg focus:ring-0">
             <FileText size={16} />
             <span className="hidden md:inline font-800 text-[11px] uppercase tracking-wider">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.iconCol}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-800 text-muted uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-900 text-text">{stat.value}</span>
                  {stat.sub && <span className="text-[10px] font-700 text-success uppercase">{stat.sub}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="white-card p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, role or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border-none rounded-[10px] text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative min-w-[160px] flex-1 md:flex-initial">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-surface border-none rounded-[10px] text-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10 uppercase font-800 tracking-wide"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
            </div>
            <div className="relative min-w-[160px] flex-1 md:flex-initial">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-surface border-none rounded-[10px] text-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10 uppercase font-800 tracking-wide"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on leave">On Leave</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="white-card overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : staffList.length === 0 ? (
            <div className="py-20 flex flex-col items-center">
              <EmptyState title="No Staff Found" description="Try adjusting your filters or search query." />
              <button 
                onClick={() => { setSearchQuery(""); setStatusFilter(""); setRoleFilter(""); }}
                className="mt-4 text-primary font-800 text-[11px] uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-[10.5px] font-800 text-muted uppercase tracking-widest text-[10px]">Employee</th>
                    <th className="px-6 py-4 text-[10.5px] font-800 text-muted uppercase tracking-widest text-[10px]">Role</th>
                    <th className="px-6 py-4 text-[10.5px] font-800 text-muted uppercase tracking-widest text-[10px] hidden md:table-cell">Contact Details</th>
                    <th className="px-6 py-4 text-[10.5px] font-800 text-muted uppercase tracking-widest text-[10px] hidden lg:table-cell">Join Date</th>
                    <th className="px-6 py-4 text-[10.5px] font-800 text-muted uppercase tracking-widest text-[10px]">Status</th>
                    <th className="px-6 py-4 text-[10.5px] font-800 text-muted uppercase tracking-widest text-[10px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {staffList.map((row) => (
                    <tr key={row.id} className="hover:bg-[#fdfbff] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-800 border bg-primary-light text-primary-dark border-primary-mid/20`}>
                            {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-700 text-text">{row.first_name} {row.last_name}</div>
                            <div className="text-[10px] font-700 text-muted tracking-tight">ID: {row.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-600 text-slate-600 uppercase tracking-tight">{row.designation || "Staff"}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-500 text-muted">
                            <Mail size={10} /> {row.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-500 text-muted">
                            <Phone size={10} /> {row.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-500 text-muted hidden lg:table-cell">
                        {new Date(row.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          row.status?.toLowerCase() === 'active' ? 'badge-success' : 
                          row.status?.toLowerCase() === 'on leave' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Link to={`/staff/show/${row.id}`} className="p-1.5 hover:bg-info/10 text-info rounded-md transition-colors" title="View Details">
                            <Eye size={16} />
                          </Link>
                          <button className="p-1.5 hover:bg-primary/10 text-primary rounded-md transition-colors" title="Export PDF">
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-slate-50">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  itemName="Staff"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffIndexPage;