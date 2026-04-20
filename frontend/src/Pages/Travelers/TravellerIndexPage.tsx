// src/Pages/Travelers/TravellerIndexPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icons (Legacy)
import {
  FaSearch,
  FaEye,
  FaUserFriends,
  FaIdCard,
  FaBluetoothB,
  FaVenusMars,
  FaEdit
} from "react-icons/fa";
import { MdClear } from "react-icons/md";

// Components
import PageHeader from "../../Components/UI/PageHeader";
import EmptyState from "../../Components/UI/EmptyState";
import { Pagination } from "../../Components/Table/Pagination";
import tenantApi, { centralAsset } from "../../Services/ApiService";
import type { Traveller } from "./Traveler.types";
import type { PaginatedResponse } from "../../Types/Index";
import { Loader } from "../../Components/UI/Loader";

const TravellerIndexPage = () => {
  // Data State
  const [allTravelers, setAllTravelers] = useState<Traveller[]>([]);
  const [displayTravelers, setDisplayTravelers] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(15);

  // 1. Fetch Data
  const fetchTravelers = async () => {
    try {
      setLoading(true);
      const response = await tenantApi.get<PaginatedResponse<Traveller>>(
        "/travellers",
        { params: { page: currentPage, per_page: perPage } }
      );
      if (response.data.success && response.data.data) {
        const travellers = response.data.data.data || [];
        setAllTravelers(travellers);
        setDisplayTravelers(travellers);
        setTotalPages(response.data.data.last_page);
        setTotalItems(response.data.data.total);
      }
    } catch (err) {
      console.error("Error fetching travellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelers();
  }, [currentPage, perPage]);

  // 2. Filter Logic
  useEffect(() => {
    let result = allTravelers;
    if (genderFilter) {
      result = result.filter(t => t.gender?.toLowerCase() === genderFilter.toLowerCase());
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((t) =>
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(lowerQuery) ||
        (t.beacon_id ?? "").toLowerCase().includes(lowerQuery) ||
        (t.traveller_uid ?? "").toLowerCase().includes(lowerQuery)
      );
    }
    setDisplayTravelers(result);
  }, [searchQuery, genderFilter, allTravelers]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setGenderFilter("");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-slate-100 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold uppercase text-slate-800">Traveller Management</h1>
      </div>

      <div className="p-6 space-y-4">
        {/* Simple Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm"
            />
          </div>
          <select 
            value={genderFilter} 
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold"
          >
            <option value="">All Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {(searchQuery || genderFilter) && (
            <button onClick={handleClearFilters} className="text-rose-500 p-2"><MdClear /></button>
          )}
        </div>

        {/* Simple Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? <div className="py-20 text-center"><Loader /></div> : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">UID</th>
                  <th className="px-6 py-4">Tracking</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {displayTravelers.map(row => (
                  <tr key={row.id}>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <img 
                            src={row.profile_photo ? `${centralAsset}${row.profile_photo}` : `https://ui-avatars.com/api/?name=${row.first_name}+${row.last_name}`} 
                            className="w-8 h-8 rounded-full border" 
                          />
                          <span className="font-bold text-slate-700 uppercase">{row.first_name} {row.last_name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.traveller_uid || "—"}</td>
                    <td className="px-6 py-4">
                       {row.beacon_id ? <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">{row.beacon_id}</span> : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center gap-2">
                         <Link to={`/travellers/show/${row.id}`} className="text-slate-400 hover:text-primary"><FaEye /></Link>
                         <Link to={`/travellers/edit/${row.id}`} className="text-slate-400 hover:text-blue-500"><FaEdit /></Link>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} itemName="Travellers" />
      </div>
    </div>
  );
};

export default TravellerIndexPage;