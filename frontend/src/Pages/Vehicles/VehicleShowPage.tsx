import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCarSide, FaEdit, FaMapMarkerAlt, FaTachometerAlt } from "react-icons/fa";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import EmptyState from "../../Components/UI/EmptyState";
import { Loader } from "../../Components/UI/Loader";
import { DataBlock, InfoCard } from "../../Components/UI/DetailItem";
import tenantApi from "../../Services/ApiService";
import type { Vehicle } from "./Vehicle.types";
import { formatDateTime } from "../../Utils/Toolkit";

const VehicleShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await tenantApi.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`);
        if (response.data.success) {
          setVehicle(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch vehicle");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void fetchVehicle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4 p-4 text-center">
        <EmptyState title="Vehicle Not Found" description={error || "Vehicle data unavailable"} />
        <button onClick={() => navigate("/vehicles")} className="text-indigo-600 font-bold hover:underline uppercase text-xs">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <PageHeaderBack title="Back" buttonLink="/vehicles" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vehicle Record</p>
            <h1 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">
              {vehicle.vehicle_name}
            </h1>
            <p className="text-sm text-slate-500 font-semibold uppercase mt-1">{vehicle.vehicle_number}</p>
          </div>

          <button
            onClick={() => navigate(`/vehicles/edit/${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase"
          >
            <FaEdit /> Edit Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoCard title="Vehicle Details" icon={<FaCarSide />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataBlock label="Name" value={vehicle.vehicle_name} />
              <DataBlock label="Number" value={vehicle.vehicle_number} />
              <DataBlock label="Make" value={vehicle.make} />
              <DataBlock label="Model" value={vehicle.model} />
              <DataBlock label="Capacity" value={vehicle.capacity?.toString()} />
              <DataBlock label="Status" value={vehicle.status} />
            </div>
          </InfoCard>

          <InfoCard title="Telemetry" icon={<FaTachometerAlt />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataBlock label="GPS Device" value={vehicle.gps_device_id} />
              <DataBlock label="Battery" value={vehicle.battery?.toString()} />
              <DataBlock label="Latitude" value={vehicle.lat?.toString()} />
              <DataBlock label="Longitude" value={vehicle.lng?.toString()} />
              <DataBlock label="Speed" value={vehicle.speed?.toString()} />
              <DataBlock label="Last Update" value={formatDateTime(vehicle.lastGpsUpdate ?? null)} />
            </div>
          </InfoCard>

          <InfoCard title="Location" icon={<FaMapMarkerAlt />}>
            <div className="space-y-4">
              <DataBlock label="Latitude" value={vehicle.lat?.toString()} />
              <DataBlock label="Longitude" value={vehicle.lng?.toString()} />
              <DataBlock label="Last GPS Update" value={formatDateTime(vehicle.lastGpsUpdate ?? null)} />
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default VehicleShowPage;
