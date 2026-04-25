import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Phone,
  Upload,
  X,
  Image as ImageIcon,
  Edit3,
  Trash2
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const staffImportRef = useRef<HTMLInputElement>(null);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const exportToPDF = (logoDataUrl: string | null = null) => {
    const doc = new jsPDF();
    
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 10, 30, 30);
      doc.setFontSize(20);
      doc.text("Staff Management Report", 50, 25);
    } else {
      doc.setFontSize(20);
      doc.text("Staff Management Report", 14, 22);
    }
    
    autoTable(doc, {
      startY: logoDataUrl ? 45 : 30,
      head: [['Employee ID', 'Name', 'Role', 'Email', 'Phone', 'Status']],
      body: staffList.map((s) => [
        s.employee_id || '-',
        `${s.first_name || ''} ${s.last_name || ''}`,
        s.designation || 'Staff',
        s.email || '-',
        s.phone || '-',
        s.status || 'active'
      ]),
    });

    doc.save("staff_report.pdf");
    showAlert("Staff report exported successfully.", "success");
    setShowExportModal(false);
    setSelectedLogo(null);
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleDelete = async (staff: Employee) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.first_name}?`)) return;
    try {
      await tenantApi.delete(`/employees/${staff.id}`);
      showAlert("Staff member deleted successfully", "success");
      fetchStaff();
    } catch {
      showAlert("Failed to delete staff member", "error");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedLogo(event.target?.result as string);
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
    staffImportRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          showAlert("The file is empty.", "warning");
          return;
        }

        showAlert(`Importing ${data.length} staff records...`, "info");

        let successCount = 0;
        for (const row of data as any[]) {
          const payload = {
            employee_id: row["Employee ID"] || row["ID"] || "",
            first_name: row["First Name"] || row["Name"]?.split(" ")[0] || "",
            last_name: row["Last Name"] || row["Name"]?.split(" ").slice(1).join(" ") || "",
            email: row["Email"] || "",
            phone: row["Phone"] || row["Mobile"] || "",
            designation: row["Role"] || row["Designation"] || "Staff",
            status: row["Status"]?.toLowerCase() || "active",
            joining_date: row["Joining Date"] || new Date().toISOString().split('T')[0],
            roles: [row["Role"] || "Staff"]
          };

          try {
            await tenantApi.post("/employees", payload);
            successCount++;
          } catch (err) {
            console.error("Failed to import row:", row, err);
          }
        }

        showAlert(`Successfully imported ${successCount} staff records.`, "success");
        fetchStaff();
      } catch (err) {
        console.error("Import failed:", err);
        showAlert("Failed to parse Excel file.", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (staffImportRef.current) staffImportRef.current.value = "";
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
      <div className="px-6 pt-6 flex flex-col sm:flex-row justify-between items-start gap-4">
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
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button onClick={handleImportClick} className="flex-1 sm:flex-none justify-center btn btn-success flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg focus:ring-0">
             <FileText size={16} />
             <span className="hidden md:inline font-800 text-[11px] uppercase tracking-wider">Import Excel</span>
          </button>
          <input type="file" ref={staffImportRef} onChange={handleFileImport} accept=".xlsx, .xls, .csv" className="hidden" />
          <button onClick={handleExportClick} className="flex-1 sm:flex-none justify-center btn btn-outline border-slate-200 text-slate-600 flex items-center gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg focus:ring-0">
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
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
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
                          <button onClick={() => handleExportClick()} className="p-1.5 hover:bg-emerald-100/50 text-emerald-600 rounded-md transition-colors" title="Export PDF">
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

      {/* Premium Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-900 text-slate-800 uppercase tracking-wider">Export Staff Report</h3>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest mt-0.5">Customize your document</p>
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
                 <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                    <div className="p-2 bg-white rounded-lg text-purple-500 shadow-sm italic font-900 text-xs">PDF</div>
                    <div>
                       <p className="text-[10px] font-800 text-slate-800 uppercase tracking-wide">Staff_Records.pdf</p>
                       <p className="text-[9px] font-600 text-slate-400 uppercase tracking-tight">Includes {staffList.length} employees</p>
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
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffIndexPage;