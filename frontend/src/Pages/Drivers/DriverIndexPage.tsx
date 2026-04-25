// src/Pages/Drivers/DriverIndexPage.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

// Icons (Lucide)
import {
  Users,
  Search,
  MapPin,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Phone,
  Mail,
  ChevronDown,
  Briefcase,
  UserPlus
} from "lucide-react";

// Components
import { Loader } from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import tenantApi, { tenantAsset } from "../../Services/ApiService";
import { DUMMY_USER_IMAGE } from "../../Utils/Toolkit";
import type { Driver } from "./Driver.types";
import type { PaginatedResponse } from "../../Types/Index";

const DriverIndexPage = () => {
  // Data State
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [displayDrivers, setDisplayDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter Options State
  const [cities, setCities] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);

  // Filter Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployment, setSelectedEmployment] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(15);

  // 1. Fetch Data
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await tenantApi.get<PaginatedResponse<Driver>>("/drivers", {
        params: { page: currentPage, per_page: perPage },
      });

      if (response.data.success && response.data.data) {
        const drivers = response.data.data.data || [];
        setAllDrivers(drivers);
        setDisplayDrivers(drivers);

        // Extract Options
        setCities(Array.from(new Set(drivers.map(d => d.city).filter(Boolean))) as string[]);
        setEmploymentTypes(Array.from(new Set(drivers.map(d => d.employment_type).filter(Boolean))) as string[]);

        setTotalPages(response.data.data.last_page);
        setTotalItems(response.data.data.total);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, perPage]);

  // 2. Filter Logic (Preserved)
  useEffect(() => {
    let result = allDrivers;

    if (selectedCity) result = result.filter((d) => d.city === selectedCity);
    if (selectedStatus) result = result.filter((d) => d.status === selectedStatus);
    if (selectedEmployment) result = result.filter((d) => d.employment_type === selectedEmployment);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(lowerQuery) ||
        (d.email ?? "").toLowerCase().includes(lowerQuery) ||
        (d.mobile_number ?? "").includes(lowerQuery) ||
        (d.employee_id ?? "").toLowerCase().includes(lowerQuery)
      );
    }

    setDisplayDrivers(result);
  }, [searchQuery, selectedCity, selectedStatus, selectedEmployment, allDrivers]);

  // 3. Handlers
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedStatus("");
    setSelectedEmployment("");
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Delete driver ${driver.first_name}?`)) return;
    try {
      const response = await tenantApi.delete(`/drivers/${driver.id}`);
      if (response.data.success) {
        setAllDrivers(prev => prev.filter(d => d.id !== driver.id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Stats Derived
  const stats = [
    { label: "Total Drivers", value: totalItems, icon: <Users size={20} />, bg: "bg-purple-50", text: "text-purple-600" },
    { label: "On Duty", value: allDrivers.filter(d => d.status?.toLowerCase() === 'active').length, icon: <UserCheck size={20} />, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "On Break", value: allDrivers.filter(d => d.status?.toLowerCase() === 'on break').length, icon: <Clock size={20} />, bg: "bg-amber-50", text: "text-amber-600" },
    { label: "Offline", value: allDrivers.filter(d => d.status?.toLowerCase() === 'inactive').length, icon: <UserX size={20} />, bg: "bg-rose-50", text: "text-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Users size={22} className="stroke-[2.5]" />
              <h1 className="text-xl font-900 tracking-wider uppercase">Driver Management</h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-0.5">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark">Driver Records</span>
           </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Link to="create" className="w-full sm:w-auto justify-center btn btn-primary flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg">
             <UserPlus size={16} />
             <span className="md:inline font-800 text-[11px] uppercase tracking-wider">Add Driver</span>
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card flex items-center gap-4 border border-slate-50 shadow-sm">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.text}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-800 text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-900 text-slate-800 tabular-nums">{stat.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Horizontal Filter Bar */}
        <div className="white-card p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, phone or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-xl text-sm font-600 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative min-w-[150px] flex-1 lg:flex-initial">
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-[11px] font-900 uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">All Cities</option>
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            <div className="relative min-w-[150px] flex-1 lg:flex-initial">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-[11px] font-900 uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            <button 
              onClick={handleClearFilters}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors shrink-0"
              title="Clear Filters"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Table Module */}
        <div className="white-card overflow-hidden border border-slate-100 shadow-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader />
              <p className="text-[10px] font-900 text-slate-300 uppercase tracking-widest">Accessing Secure Records...</p>
            </div>
          ) : displayDrivers.length === 0 ? (
            <div className="py-24 flex flex-col items-center">
              <EmptyState title="No Drivers Found" description="Try adjusting your filters or add a new driver file." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">S.No</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Driver Profile</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Contact Details</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Operational Base</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Current Status</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {displayDrivers.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-800 text-slate-300 tabular-nums">
                          {((currentPage - 1) * perPage + index + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={row.profile_photo ? `${tenantAsset}${row.profile_photo}` : `${DUMMY_USER_IMAGE}`} 
                            alt={row.first_name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-100"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${row.first_name}+${row.last_name}&background=random`; }}
                          />
                          <div>
                            <div className="text-sm font-800 text-slate-800 uppercase tracking-tight">{row.first_name} {row.last_name}</div>
                            <div className="text-[10px] font-700 text-slate-400 uppercase tracking-widest">ID: {row.employee_id || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-700 text-slate-700">
                             <Phone size={10} className="text-slate-300" /> {row.mobile_number}
                          </div>
                          {row.email && (
                            <div className="flex items-center gap-2 text-[10px] font-600 text-slate-400 lowercase">
                               <Mail size={10} className="text-slate-300" /> {row.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-800 text-slate-700 uppercase tracking-tight">
                            <MapPin size={10} className="text-indigo-500" /> {row.city || "Remote"}
                          </div>
                          <span className="text-[10px] font-700 text-slate-400 uppercase tracking-widest ml-3.5">{row.state}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-900 uppercase tracking-widest border ${
                          row.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Link to={`/drivers/show/${row.id}`} className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
                            <Eye size={16} />
                          </Link>
                          <Link to={`/drivers/edit/${row.id}`} className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
                            <Edit3 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(row)} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  itemName="Drivers"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverIndexPage;