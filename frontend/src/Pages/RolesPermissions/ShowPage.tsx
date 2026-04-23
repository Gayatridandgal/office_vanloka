// src/Pages/RolesPermissions/ShowPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  Key, 
  Clock, 
  Edit3, 
  ChevronRight, 
  CheckCircle2, 
  Calendar,
  UserCheck
} from "lucide-react";

// Components
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import { useAlert } from "../../Context/AlertContext";
import tenantApi from "../../Services/ApiService";
import type { Role, Permission } from "./RolesPermissions.types";

const ShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;
      try {
        const response = await tenantApi.get(`/roles/${id}`);
        setRole(response.data.data);
      } catch (err) {
        showAlert("Failed to load role details.", "error");
        console.error(err);
        navigate("/roles_permissions");
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [id, showAlert, navigate]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!role) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <PageHeaderBack title="Role Details" buttonLink="/roles_permissions" />

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
               <Shield size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                  <Shield size={32} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-indigo-100 text-[10px] font-900 uppercase tracking-[0.2em] mb-1">
                    <UserCheck size={12} /> System Defined Role
                  </div>
                  <h1 className="text-3xl font-900 text-white uppercase tracking-tight">{role.name}</h1>
                </div>
              </div>

              <Link 
                to={`/roles_permissions/edit/${role.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-800 text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all"
              >
                <Edit3 size={16} />
                Edit Configuration
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50 bg-white">
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                <Clock size={18} />
              </div>
              <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest mb-1">Created At</p>
              <p className="text-xs font-bold text-slate-700">
                {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                <Calendar size={18} />
              </div>
              <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
              <p className="text-xs font-bold text-slate-700">
                {role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                <Key size={18} />
              </div>
              <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest mb-1">Total Permissions</p>
              <p className="text-xs font-bold text-slate-700">{role.permissions?.length || 0} Modules Assigned</p>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
           <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm border border-indigo-100/50">
                <Key size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-900 text-slate-800 uppercase tracking-wider">Active Permissions</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modules this role can access</p>
              </div>
           </div>

           {role.permissions && role.permissions.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
               {role.permissions.map((perm) => (
                 <div key={perm.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                      <span className="text-xs font-800 text-slate-600 uppercase tracking-tight group-hover:text-indigo-600">
                        {perm.name.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <CheckCircle2 size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100">
                <Shield size={40} className="text-slate-200 mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  No permissions assigned to this role yet.<br/> 
                  <span className="lowercase font-600 text-slate-300">use the edit button to configure access level.</span>
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ShowPage;
