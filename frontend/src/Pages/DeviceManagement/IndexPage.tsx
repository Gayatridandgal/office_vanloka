import { useEffect, useMemo, useState } from "react";
import {
  Cpu,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  Navigation,
  Radio,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import EmptyState from "../../Components/UI/EmptyState";
import { Loader } from "../../Components/UI/Loader";
import { Pagination } from "../../Components/Table/Pagination";
import tenantApi from "../../Services/ApiService";
import type { PaginatedResponse } from "../../Types/Index";

type DeviceType = "GPS" | "BEACON";

interface DeviceRow {
  id: string;
  source_id: number;
  device_type: DeviceType;
  sequnce_number: string | null;
  device_id: string | null;
  serial_number: string | null;
  imei_number: string | null;
  manufacture_date: string | null;
  status: string | null;
}

const DeviceManagementIndexPage = () => {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "gps" | "beacon">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(15);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await tenantApi.get<PaginatedResponse<DeviceRow>>("/devices", {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchQuery || undefined,
          device_type: typeFilter || undefined,
          status: statusFilter || undefined,
        },
      });

      if (response.data.success && response.data.data) {
        setDevices(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
        setTotalItems(response.data.data.total || 0);
      } else {
        setDevices([]);
        setTotalItems(0);
      }
    } catch (err: any) {
      setDevices([]);
      setError(err?.response?.data?.message || "Failed to load devices.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError("");
      await tenantApi.post("/devices/sync-iot");
      await fetchDevices();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to sync devices from IoT.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void fetchDevices();
  }, [searchQuery, typeFilter, statusFilter, currentPage]);

  const statusOptions = useMemo(() => {
    // If we only have paged data, this might be incomplete, but it's a start
    const unique = Array.from(new Set(devices.map((item) => (item.status || "").toLowerCase()).filter(Boolean)));
    return unique.sort();
  }, [devices]);

  const stats = [
    { label: "Total Assets", value: totalItems, icon: <Cpu size={20} />, bg: "bg-indigo-50", text: "text-indigo-600" },
    { label: "GPS Trackers", value: devices.filter(d => d.device_type === 'GPS').length, icon: <Navigation size={20} />, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "IoT Beacons", value: devices.filter(d => d.device_type === 'BEACON').length, icon: <Radio size={20} />, bg: "bg-purple-50", text: "text-purple-600" },
    { label: "Online/Active", value: devices.filter(d => d.status?.toLowerCase() === 'active' || d.status?.toLowerCase() === 'available').length, icon: <CheckCircle2 size={20} />, bg: "bg-emerald-50", text: "text-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Premium Header */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Cpu size={22} className="stroke-[2.5]" />
            <h1 className="text-xl font-900 tracking-wider uppercase">Device Management</h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest px-0.5">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary-dark">Hardware Registry</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSync}
            disabled={syncing || loading}
            className={`w-full sm:w-auto justify-center btn ${syncing ? 'bg-slate-100 text-slate-400' : 'btn-primary'} flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg`}
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            <span className="font-800 text-[11px] uppercase tracking-wider">
              {syncing ? "Syncing..." : "Sync IoT Devices"}
            </span>
          </button>
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

        {/* Premium Filters */}
        <div className="white-card p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by Device ID, Serial, IMEI..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-xl text-sm font-600 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative min-w-[160px] flex-1 lg:flex-initial">
              <select 
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-[11px] font-900 uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">All Types</option>
                <option value="gps">GPS Trackers</option>
                <option value="beacon">IoT Beacons</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            <div className="relative min-w-[160px] flex-1 lg:flex-initial">
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-[11px] font-900 uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            <button 
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors shrink-0"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Device Table */}
        <div className="white-card overflow-hidden border border-slate-100 shadow-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader />
              <p className="text-[10px] font-900 text-slate-300 uppercase tracking-widest px-4 text-center">Interrogating Connected Hardware...</p>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center">
              <AlertCircle className="text-rose-300 mb-4" size={48} />
              <p className="text-sm font-800 text-slate-600 uppercase tracking-tight">System Fault Detected</p>
              <p className="text-xs font-600 text-slate-400 mt-1 max-w-xs text-center">{error}</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="py-24 flex flex-col items-center">
              <EmptyState 
                title="No Hardware Found" 
                description="Unable to locate any registered GPS or Beacon modules with current parameters." 
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">S.No</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Asset Category</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Hardware ID</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Sequence / SN</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Global Status</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {devices.map((device, index) => (
                    <tr key={device.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-800 text-slate-300 tabular-nums">
                          {((currentPage - 1) * perPage + index + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${device.device_type === 'GPS' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {device.device_type === 'GPS' ? <Navigation size={16} /> : <Radio size={16} />}
                          </div>
                          <div>
                            <div className="text-sm font-800 text-slate-800 uppercase tracking-tight">{device.device_type}</div>
                            <div className="text-[10px] font-700 text-slate-400 uppercase tracking-widest">MODULE</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-800 text-slate-700 uppercase">{device.device_id || "UNASSIGNED"}</div>
                          <div className="text-[10px] font-600 text-slate-400">IMEI: {device.imei_number || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-800 text-slate-700">{device.sequnce_number || "N/A"}</div>
                          <div className="text-[10px] font-600 text-slate-400 uppercase tracking-widest">SN: {device.serial_number || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-900 uppercase tracking-widest border ${
                          (device.status?.toLowerCase() === 'active' || device.status?.toLowerCase() === 'available') 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {device.status || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5">
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
                  itemName="Devices"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementIndexPage;