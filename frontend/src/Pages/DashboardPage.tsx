// src/Pages/DashboardPage.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { LoadScript } from "@react-google-maps/api";
import { useAuth } from "../Context/AuthContext";
import tenantApi from "../Services/ApiService";

// Components
import GoogleMapDisplay from "../Components/Map/GoogleMapDisplay";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import { Loader } from "../Components/UI/Loader";

// Icons (FontAwesome / MD)
import {
  FaUserTie,
  FaUsers,
  FaMapMarkedAlt,
  FaSync,
  FaBatteryThreeQuarters,
  FaTachometerAlt,
  FaSignal,
  FaIdCard,
  FaClock,
  FaExclamationTriangle
} from "react-icons/fa";
import { MdGpsFixed, MdLocationOn, MdSignalCellularAlt } from "react-icons/md";
import { LuBus } from "react-icons/lu";
import type { LiveVehicle } from "../Types/Index";
import { formatTime } from "../Utils/Toolkit";

const STORAGE_KEY = "dashboard_cooldown_timestamp";
const COOLDOWN_DURATION = 300; 

const DashboardPage = () => {
  const { tenantId } = useAuth();

  // State
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [selectedVehicleNumber, setSelectedVehicleNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [address, setAddress] = useState<string>("Select a vehicle to view location");
  const [addressLoading, setAddressLoading] = useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const startTimerInterval = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const endTime = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        localStorage.removeItem(STORAGE_KEY);
        setIsButtonDisabled(false);
      }
    }, 1000);
  }, []);

  const initCooldown = useCallback(() => {
    const endTime = Date.now() + (COOLDOWN_DURATION * 1000);
    localStorage.setItem(STORAGE_KEY, endTime.toString());
    setCountdown(COOLDOWN_DURATION);
    setIsButtonDisabled(true);
    startTimerInterval();
  }, [startTimerInterval]);

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    if (!googleMapsApiKey) return;
    setAddressLoading(true);
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`);
      const data = await response.json();
      if (data.results && data.results[0]) setAddress(data.results[0].formatted_address);
      else setAddress("Address not found");
    } catch {
      setAddress("Location info unavailable");
    } finally {
      setAddressLoading(false);
    }
  }, [googleMapsApiKey]);

  useEffect(() => {
    const selectedVehicle = vehicles.find(v => v.vehicle_number === selectedVehicleNumber);
    if (selectedVehicle && selectedVehicle.gps) fetchAddress(selectedVehicle.gps.lat, selectedVehicle.gps.lng);
    else setAddress("Select a vehicle to view location");
  }, [selectedVehicleNumber, vehicles, fetchAddress]);

  const fetchLiveVehicles = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await tenantApi.get(`/vehicles/live/location/${tenantId}`);
      if (response.data.success && response.data.data) {
        setVehicles(response.data.data);
        initCooldown();
      } else {
        setError("Vehicle tracking data not available.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Connection error.");
      initCooldown();
    } finally {
      setLoading(false);
      setHasInitialFetch(true);
    }
  }, [tenantId, initCooldown]);

  useEffect(() => {
    if (!tenantId) return;
    const storedTimestamp = localStorage.getItem(STORAGE_KEY);
    if (storedTimestamp) {
      const endTime = parseInt(storedTimestamp, 10);
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
        setIsButtonDisabled(true);
        startTimerInterval();
      } else fetchLiveVehicles();
    } else fetchLiveVehicles();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tenantId, fetchLiveVehicles, startTimerInterval]);

  const handleVehicleSelect = (v: string) => setSelectedVehicleNumber((prev) => (prev === v ? null : v));

  const selectedVehicle = vehicles.find((v) => v.vehicle_number === selectedVehicleNumber) || null;
  const drivers = selectedVehicle?.beacons.filter(b => b.type.toLowerCase() === 'driver') || [];
  const passengers = selectedVehicle?.beacons.filter(b => b.type.toLowerCase() === 'traveller') || [];

  if (!googleMapsApiKey) return <div>Maps API Key Missing</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-xl font-bold uppercase text-slate-800">Dashboard</h1>
        <button onClick={fetchLiveVehicles} disabled={isButtonDisabled || loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase transition-all">
          <FaSync className={loading ? "animate-spin" : ""} /> {loading ? "Syncing..." : isButtonDisabled ? `Wait ${countdown}s` : "Refresh"}
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
              <GoogleMapDisplay vehicles={vehicles} selectedVehicleNumber={selectedVehicleNumber} onVehicleSelect={handleVehicleSelect} />
            </LoadScript>
          </div>

          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
             {selectedVehicle ? (
               <div className="flex flex-col h-full">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div>
                       <h3 className="font-bold text-slate-800 uppercase">{selectedVehicle.vehicle_name}</h3>
                       <span className="text-[10px] bg-white px-2 py-1 border border-slate-200 rounded font-bold">{selectedVehicle.vehicle_number}</span>
                    </div>
                    <LuBus size={30} className="text-blue-500" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-blue-50 rounded-lg text-center"><p className="text-[9px] font-bold text-blue-400 uppercase">Speed</p><p className="font-bold">{selectedVehicle.gps.speed} km/h</p></div>
                        <div className="p-3 bg-emerald-50 rounded-lg text-center"><p className="text-[9px] font-bold text-emerald-400 uppercase">Battery</p><p className="font-bold">{selectedVehicle.battery}%</p></div>
                     </div>
                     <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Driver Onboard</p>
                        {drivers.map(d => <div key={d.id} className="p-2 border border-slate-100 rounded flex justify-between items-center text-xs font-bold uppercase"><div className="flex items-center gap-2"><FaUserTie /> {d.name}</div><span className="text-[9px] bg-green-100 text-green-700 px-2 rounded-full">Online</span></div>)}
                     </div>
                     <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Passengers ({passengers.length})</p>
                        <div className="divide-y divide-slate-50 border rounded-lg bg-slate-50/50">
                           {passengers.map(p => <div key={p.id} className="p-2 text-[10px] font-bold flex justify-between px-3 uppercase"><span>{p.name}</span><span className="text-slate-400 font-mono italic">{p.id}</span></div>)}
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-300">
                  <MdGpsFixed size={48} className="mb-4" />
                  <p className="text-sm font-bold uppercase">Select a vehicle to view track data</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
