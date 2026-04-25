import { useEffect, useMemo, useState, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";

// Icons (Lucide)
import { 
  Bus, 
  Search, 
  Plus, 
  FileText, 
  MapPin, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  Activity, 
  Settings, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";

// Components
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import { Loader } from "../../Components/UI/Loader";
import tenantApi from "../../Services/ApiService";
import { useAlert } from "../../Context/AlertContext";
import type { Vehicle } from "./Vehicle.types";
import type { PaginatedResponse } from "../../Types/Index";
import { formatDateTime } from "../../Utils/Toolkit";

const VehicleIndexPage = () => {
  const { showAlert } = useAlert();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 15;
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Fetch Data (Logic preserved)
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await tenantApi.get<PaginatedResponse<Vehicle>>("/vehicles", {
        params: { page: currentPage, per_page: perPage },
      });

      if (response.data.success && response.data.data) {
        setVehicles(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      showAlert("Failed to fetch vehicles.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVehicles();
  }, [currentPage]);

  // 2. Filter Logic (Logic preserved)
  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    if (statusFilter) {
      result = result.filter((vehicle) => (vehicle.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      const value = searchQuery.toLowerCase();
      result = result.filter((vehicle) =>
        (vehicle.vehicle_name || "").toLowerCase().includes(value) ||
        (vehicle.vehicle_number || "").toLowerCase().includes(value) ||
        (vehicle.model || "").toLowerCase().includes(value) ||
        (vehicle.make || "").toLowerCase().includes(value)
      );
    }

    return result;
  }, [vehicles, searchQuery, statusFilter]);

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Delete vehicle ${vehicle.vehicle_number}?`)) return;

    try {
      const response = await tenantApi.delete(`/vehicles/${vehicle.id}`);
      if (response.data.success) {
        setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
        showAlert("Vehicle deleted successfully.", "success");
      }
    } catch (error) {
      showAlert("Failed to delete vehicle.", "error");
    }
  };

  // Derive Stats (Visual enhancement)
  const stats = [
    { label: "Total Vehicles", value: vehicles.length, sub: "fleet size", icon: <Bus size={20} />, iconBg: "bg-indigo-50", iconCol: "text-indigo-600" },
    { label: "Active", value: vehicles.filter(v => (v.status || "").toLowerCase() === 'active').length, icon: <CheckCircle2 size={20} />, iconBg: "bg-emerald-50", iconCol: "text-emerald-600" },
    { label: "In Maintenance", value: vehicles.filter(v => (v.status || "").toLowerCase() === 'maintenance').length, icon: <Settings size={20} />, iconBg: "bg-amber-50", iconCol: "text-amber-600" },
    { label: "Inactive", value: vehicles.filter(v => (v.status || "").toLowerCase() === 'inactive').length, icon: <XCircle size={20} />, iconBg: "bg-rose-50", iconCol: "text-rose-600" }
  ];

  const exportToPDF = (logoDataUrl: string | null = null) => {
    const doc = new jsPDF();
    
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 10, 30, 30);
      doc.setFontSize(20);
      doc.text("Vehicle Management Report", 50, 25);
    } else {
      doc.setFontSize(20);
      doc.text("Vehicle Management Report", 14, 22);
    }
    
    // Check if autoTable function exists
    if (typeof autoTable === 'function') {
      autoTable(doc, {
        startY: logoDataUrl ? 45 : 30,
        head: [['S.No', 'Vehicle Name', 'Number', 'Make & Model', 'Status', 'Battery']],
        body: filteredVehicles.map((v, i) => [
          (i + 1).toString(),
          v.vehicle_name || 'N/A',
          v.vehicle_number || 'N/A',
          `${v.make || ''} ${v.model || ''}`,
          v.status || 'N/A',
          v.battery ? `${v.battery}%` : 'N/A'
        ]),
      });
    }

    doc.save("vehicle_management_report.pdf");
    showAlert("PDF exported successfully.", "success");
    setShowExportModal(false);
    setSelectedLogo(null);
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        exportToPDF(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => setSelectedLogo(event.target?.result as string);
        reader.readAsDataURL(file);
    } else {
        showAlert("Please drop a valid image file.", "warning");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      if (jsonData.length === 0) {
        showAlert("No data found in the file.", "error");
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const row of jsonData) {
        const payload = {
          vehicle_name: row.VehicleName || row.vehicle_name || row['Vehicle Name'] || '',
          vehicle_number: row.VehicleNumber || row.vehicle_number || row['Vehicle Number'] || '',
          model: row.Model || row.model || '',
          make: row.Make || row.make || '',
          capacity: row.Capacity || row.capacity || null,
          status: (row.Status || row.status || 'active').toLowerCase(),
          battery: row.Battery || row.battery || 100
        };

        if (!payload.vehicle_number) {
          failCount++;
          continue;
        }

        try {
          await tenantApi.post("/vehicles", payload);
          successCount++;
        } catch (err) {
          console.error("Failed to import row:", row, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        showAlert(`Successfully imported ${successCount} vehicles. ${failCount > 0 ? `Failed: ${failCount}` : ''}`, "success");
        void fetchVehicles();
      } else {
        showAlert("Failed to import any vehicle from file. Please check format.", "error");
      }

    } catch (error) {
      console.error("Error parsing file:", error);
      showAlert("Invalid file format.", "error");
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Segment */}
      <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-primary mb-1">
              <Bus size={22} className="stroke-[2.5]" />
              <h1 className="text-xl font-900 tracking-wider uppercase">Vehicle Management</h1>
           </div>
           <div className="flex items-center gap-2 text-[11px] font-800 text-muted uppercase tracking-widest pl-1">
             <span>Admin</span>
             <span className="text-slate-300">/</span>
             <span className="text-primary-dark">Vehicle Operations</span>
           </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {/* Hidden inputs for imports/logo */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={logoInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <button onClick={handleImportClick} className="flex-1 sm:flex-none justify-center btn btn-success flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg focus:ring-0">
             <FileText size={16} />
             <span className="hidden md:inline font-800 text-[11px] uppercase tracking-wider">Import Excel</span>
          </button>
          <button onClick={handleExportClick} className="flex-1 sm:flex-none justify-center btn btn-outline border-slate-200 text-slate-600 flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg focus:ring-0">
             <FileText size={16} />
             <span className="hidden md:inline font-800 text-[11px] uppercase tracking-wider">Export PDF</span>
          </button>
          <Link to="create" className="flex-1 sm:flex-none justify-center w-full sm:w-auto btn btn-primary flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg">
             <Plus size={16} />
             <span className="md:inline font-800 text-[11px] uppercase tracking-wider">Add New</span>
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card flex items-center gap-4 border border-slate-50/50">
              <div className={`p-3.5 rounded-2xl ${stat.iconBg} ${stat.iconCol} shadow-sm`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-800 text-muted uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-900 text-slate-800 tabular-nums tracking-tighter">{stat.value}</span>
                  <span className="text-[10px] font-700 text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Search & Filter Bar */}
        <div className="white-card p-4 flex flex-col lg:flex-row gap-4 items-center border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search vehicle, plate, model or manufacturer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-xl text-sm font-600 focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-300"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative min-w-[160px] flex-1 lg:flex-initial">
              <select 
                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-[11px] font-900 uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option>All Types</option>
                <option>Car</option>
                <option>Van</option>
                <option>Bus</option>
                <option>Truck</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>

            <div className="relative min-w-[160px] flex-1 lg:flex-initial">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border-none rounded-xl text-[11px] font-900 uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>
            
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter(""); }}
              className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors shrink-0"
              title="Clear Filters"
            >
              <AlertCircle size={20} />
            </button>
          </div>
        </div>

        {/* Table Module */}
        <div className="white-card overflow-hidden border border-slate-100 shadow-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader />
              <p className="text-[10px] font-900 text-slate-300 uppercase tracking-[0.2em]">Synchronizing Fleet Data...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="py-24 flex flex-col items-center">
              <EmptyState title="No Vehicles Found" description="Try adjusting your filters or search query." />
              <button 
                onClick={() => { setSearchQuery(""); setStatusFilter(""); }}
                className="mt-4 text-primary font-900 text-[11px] uppercase tracking-widest hover:underline"
              >
                Reset Dashboard
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50/50">
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">S.No</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Vehicle</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Number</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest">Telemetry</th>
                    <th className="px-6 py-5 text-[10px] font-900 text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {filteredVehicles.map((vehicle, index) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-800 text-slate-300 tabular-nums">
                          {((currentPage - 1) * perPage + index + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-sm">
                            <Truck size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-800 text-slate-800 uppercase tracking-tight">{vehicle.vehicle_name}</div>
                            <div className="text-[10px] font-700 text-slate-400 uppercase tracking-widest">Fleet Unit</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[13px] font-700 text-slate-600 tracking-tight uppercase">
                        {vehicle.vehicle_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-800 text-slate-700 uppercase tracking-tight">
                            {vehicle.make} {vehicle.model}
                          </span>
                          <span className="text-[10px] font-700 text-slate-400 uppercase tracking-widest">
                            Capacity: {vehicle.capacity || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-900 uppercase tracking-widest border ${
                          (vehicle.status || "").toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          (vehicle.status || "").toLowerCase() === 'maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {vehicle.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[10px] font-800 text-slate-500 uppercase tracking-widest">
                             <Activity size={10} className="text-slate-300" /> Batt: {vehicle.battery || "--"}%
                          </div>
                          <div className="text-[9px] font-600 text-slate-400 tracking-tighter">
                            {formatDateTime(vehicle.lastGpsUpdate ?? null)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/vehicles/track/${vehicle.vehicle_number}`}
                            className="p-2 bg-white hover:bg-amber-50 text-amber-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5"
                            title="Track Live"
                          >
                            <MapPin size={16} />
                          </Link>
                          <Link
                            to={`/vehicles/show/${vehicle.id}`}
                            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5"
                            title="View Data"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/vehicles/edit/${vehicle.id}`}
                            className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5"
                            title="Update Profile"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicle)}
                            className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5"
                            title="Remove Archive"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 border-t border-slate-50/50 bg-slate-50/20">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={vehicles.length}
                  onPageChange={setCurrentPage}
                  itemName="Vehicles"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-900 text-slate-800 uppercase tracking-wider">Export Settings</h3>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest mt-0.5">Customize your fleet report</p>
              </div>
              <button 
                onClick={() => { setShowExportModal(false); setSelectedLogo(null); }}
                className="p-2 hover:bg-white hover:text-rose-500 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-900 text-slate-500 uppercase tracking-widest mb-3 block">Company Logo <span className="text-slate-300 font-700">(Optional)</span></label>
                
                {selectedLogo ? (
                  <div className="relative group">
                    <img src={selectedLogo} className="w-full h-40 object-contain rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 p-4" alt="Logo Preview" />
                    <button 
                      onClick={() => setSelectedLogo(null)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur shadow-sm text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-rose-100"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[9px] font-900 uppercase tracking-widest rounded-full shadow-lg">
                      Logo Uploaded
                    </div>
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => logoInputRef.current?.click()}
                    className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      isDragging ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-white text-slate-400 shadow-sm'}`}>
                       <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-800 text-slate-700 uppercase tracking-wider">Drag & Drop Logo</p>
                      <p className="text-[9px] font-600 text-slate-400 mt-1 uppercase tracking-tight">or click to browse files</p>
                    </div>
                  </div>
                )}
                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm italic font-900 text-xs">PDF</div>
                    <div>
                       <p className="text-[10px] font-800 text-slate-800 uppercase tracking-wide">Vehicle_Report.pdf</p>
                       <p className="text-[9px] font-600 text-slate-400 uppercase tracking-tight">Includes {filteredVehicles.length} vehicles</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex gap-3">
              <button 
                onClick={() => { setShowExportModal(false); setSelectedLogo(null); }}
                className="btn btn-outline flex-1 py-3 text-[11px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => exportToPDF(selectedLogo)}
                className="btn btn-primary flex-1 py-3 px-4 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 text-[11px]"
              >
                <FileText size={16} />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleIndexPage;
