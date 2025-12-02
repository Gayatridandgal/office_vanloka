// src/Pages/DashBoardPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { LoadScript } from "@react-google-maps/api";
import { useAuth } from "../Context/AuthContext";
import tenantApi from "../Services/ApiService";

// Components
import GoogleMapDisplay from "../Components/Map/GoogleMapDisplay";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";

// Icons
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
import { MdGpsFixed, MdSignalCellularAlt } from "react-icons/md";
import { LuBus } from "react-icons/lu";
import { Loader } from "../Components/UI/Loader";
import type { LiveVehicle } from "../Types/Index";


const STORAGE_KEY = "dashboard_cooldown_timestamp";
const COOLDOWN_DURATION = 300; // 5 Minutes

const DashBoardPage = () => {
  const { tenantId } = useAuth();

  // State
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [selectedVehicleNumber, setSelectedVehicleNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  // Timer State
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // --- 1. Timer Logic ---

  const startTimerInterval = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          localStorage.removeItem(STORAGE_KEY);
          setIsButtonDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initCooldown = () => {
    const endTime = Date.now() + (COOLDOWN_DURATION * 1000);
    localStorage.setItem(STORAGE_KEY, endTime.toString());
    setCountdown(COOLDOWN_DURATION);
    setIsButtonDisabled(true);
    startTimerInterval();
  };

  // --- 2. Data Fetching ---

  const fetchLiveVehicles = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await tenantApi.get(`/vehicles/live/location/${tenantId}`);
      if (response.data.success) {
        setVehicles(response.data.data);
        initCooldown(); // Start timer on success
      } else {
        setError("Failed to load vehicle data.");
      }
    } catch (err: any) {
      console.error("Failed to fetch vehicles:", err);
      setError(err.response?.data?.message || "Connection error. Please try again.");
      initCooldown(); // Start timer even on error to prevent spam
    } finally {
      setLoading(false);
      setHasInitialFetch(true);
    }
  }, [tenantId]);

  // --- 3. Initial Lifecycle ---

  useEffect(() => {
    if (!tenantId) return;

    const initializePage = () => {
      const storedTimestamp = localStorage.getItem(STORAGE_KEY);

      if (storedTimestamp) {
        // Timer Exists
        const endTime = parseInt(storedTimestamp, 10);
        const now = Date.now();
        const remainingSeconds = Math.ceil((endTime - now) / 1000);

        if (remainingSeconds > 0) {
          // Restore Timer
          setCountdown(remainingSeconds);
          setIsButtonDisabled(true);
          startTimerInterval();

          // If timer active but no data (e.g. reload), fetch silently without resetting timer
          if (vehicles.length === 0 && !hasInitialFetch) {
            setLoading(true);
            tenantApi.get(`/vehicles/live/location/${tenantId}`)
              .then(res => {
                if (res.data.success) setVehicles(res.data.data);
              })
              .catch(() => setError("Failed to restore data."))
              .finally(() => {
                setLoading(false);
                setHasInitialFetch(true);
              });
          }
        } else {
          // Timer Expired
          localStorage.removeItem(STORAGE_KEY);
          fetchLiveVehicles();
        }
      } else {
        // First Load
        fetchLiveVehicles();
      }
    };

    initializePage();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  // Prevent Refresh Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isButtonDisabled) {
        e.preventDefault();
        e.returnValue = "Please wait for the timer to finish.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isButtonDisabled]);

  // --- Helpers ---

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleVehicleSelect = (vehicle_number: string) => {
    setSelectedVehicleNumber((prevId) => (prevId === vehicle_number ? null : vehicle_number));
  };

  const selectedVehicle = vehicles.find((v) => v.vehicle_number === selectedVehicleNumber) || null;
  const drivers = selectedVehicle?.beacons.filter(b => b.type.toLowerCase() === 'driver') || [];
  const passengers = selectedVehicle?.beacons.filter(b => b.type.toLowerCase() === 'traveller') || [];

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return "--:--"; }
  };

  if (!googleMapsApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <EmptyState title="Configuration Error" description="Google Maps API Key is missing." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-2">
      <div className="mx-4">
        <PageHeader title="Live Fleet Dashboard" />
      </div>

      <div className="px-4 pb-10">
        <div className="space-y-4">

          {/* 1. Control & Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <LuBus size={30} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Total Vehicles</p>
                    <p className="text-xl font-extrabold text-slate-800">{vehicles.length}</p>
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <MdSignalCellularAlt size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">System Status</p>
                    <p className="text-sm font-bold text-slate-800">
                      {loading ? "Syncing..." : "Online"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refresh Action */}
              <button
                onClick={fetchLiveVehicles}
                disabled={isButtonDisabled || loading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm border min-w-[180px] justify-center
                  ${isButtonDisabled || loading
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
              >
                {loading ? (
                  <span className="animate-spin"><FaSync /></span>
                ) : (
                  <FaSync className={isButtonDisabled ? "" : "group-hover:rotate-180 transition-transform"} />
                )}
                {loading ? "Loading..." : isButtonDisabled ? `Wait ${formatCountdown(countdown)} for next refresh` : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-md flex items-center gap-2">
                <FaExclamationTriangle />
                {error}
              </div>
            )}
          </div>

          {/* 2. Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[78vh]">

            {/* Map Area - ALWAYS RENDERED */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 relative">

              {/* <GoogleMapDisplay
                vehicles={vehicles}
                selectedVehicleNumber={selectedVehicleNumber}
                onVehicleSelect={handleVehicleSelect}
              /> */}
              <LoadScript googleMapsApiKey={googleMapsApiKey}>
                <GoogleMapDisplay
                  vehicles={vehicles}
                  selectedVehicleNumber={selectedVehicleNumber}
                  onVehicleSelect={handleVehicleSelect}
                />
              </LoadScript>


              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-full shadow-md border border-slate-200 flex items-center gap-2">
                    <Loader />
                    <span className="text-xs font-bold text-indigo-900 uppercase">Updating Fleet...</span>
                  </div>
                </div>
              )}

              {/* Empty State (Only if loaded and no vehicles) */}
              {!loading && vehicles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10 pointer-events-none">
                  <EmptyState
                    title="No Vehicles Active"
                    description="Your fleet seems to be offline or empty."
                    icon={<FaMapMarkedAlt className="text-slate-300 text-6xl mb-4" />}
                  />
                </div>
              )}
            </div>

            {/* Details Panel (Takes 1/3 width) */}
            <div className="lg:col-span-1 flex flex-col gap-4">

              {selectedVehicle ? (
                <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200">

                  {/* Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 uppercase">{selectedVehicle.vehicle_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {selectedVehicle.vehicle_number || "-"}
                        </span>

                      </div>
                    </div>
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full shadow-sm">
                      <LuBus size={25} />
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-6 ">

                    {/* 1. Telemetry Pills */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Speed */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FaTachometerAlt className="text-blue-400" />
                          <span className="text-xs font-bold text-slate-600 uppercase">Speed</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md shadow-sm">
                          {selectedVehicle.gps.speed} km/h
                        </span>
                      </div>

                      {/* Battery */}
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FaBatteryThreeQuarters className="text-emerald-500" />
                          <span className="text-xs font-bold text-slate-600 uppercase">Battery</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md shadow-sm">
                          {selectedVehicle.battery}%
                        </span>
                      </div>
                    </div>

                    {/* Last Update Info */}
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <FaClock />
                      Updated: {new Date(selectedVehicle.gps.timestamp).toLocaleString()}
                    </div>

                    {/* 2. Driver Info - Scrollable if many */}
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FaUserTie /> Driver Crew
                      </label>

                      {drivers.length > 0 ? (
                        <div className="space-y-2">
                          {drivers.map(driver => (
                            <div key={driver.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors bg-white shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold">
                                  {driver.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800 uppercase">{driver.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <FaIdCard size={8} /> {driver.id}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">On Board</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                          <p className="text-xs text-slate-400 italic">No driver beacon detected</p>
                        </div>
                      )}
                    </div>

                    {/* 3. Passengers Info - Scrollable Container */}
                    <div className="flex flex-col h-full min-h-0">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                          <FaUsers /> Passengers
                        </label>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Total: {passengers.length}
                        </span>
                      </div>

                      <div className=" border border-slate-200 rounded-lg bg-white ">
                        {passengers.length > 0 ? (
                          <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {passengers.map(pax => (
                              <div key={pax.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                                    {pax.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-700 uppercase">{pax.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded">ID: {pax.id}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded" title="Last Seen">
                                    <FaClock size={8} /> {formatTime(pax.lastSeen)}
                                  </span>
                                  {pax.rssi && (
                                    <div className="flex items-center gap-1" title="Signal Strength">
                                      <FaSignal size={10} className={pax.rssi > -60 ? "text-green-500" : "text-amber-500"} />
                                      <span className="text-[10px] text-slate-400 font-mono">{pax.rssi}dBm</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 bg-slate-50/50">
                            <p className="text-xs text-slate-400 italic">No passengers onboarded</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="h-full bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-200">
                    <MdGpsFixed size={32} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase">Select a Vehicle</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                    Click on a vehicle marker on the map to view live telemetry and manifest.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashBoardPage;