import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { travelersData, organisationData } from "../../Data/Index";
import type { Booking, Organisation } from "../../Types/Index";
import SaveButton from "../../Components/Form/SaveButton";

const BookingCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location state
  const prefilledData = location.state; // This will contain { travelerId, orgId }

  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Booking>();

  const selectedOrgId = watch("organisation_id");

  // This effect runs ONCE to pre-fill data from the navigation state
  useEffect(() => {
    if (prefilledData) {
      setValue("traveler_id", prefilledData.travelerId);
      setValue("organisation_id", prefilledData.orgId);
    }
  }, [prefilledData, setValue]);

  // This effect still runs whenever the org ID changes (either manually or via pre-fill)
  useEffect(() => {
    if (selectedOrgId) {
      const org = organisationData.find((o) => o.id === selectedOrgId);
      if (org) {
        setSelectedOrg(org);
        setValue("drop_location", org.address || "");
        setValue("pickup_location", "");
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1);
        setValue("start_date", startDate.toISOString().split("T")[0]);
        setValue("end_date", endDate.toISOString().split("T")[0]);
        setValue("pickup_time", "08:00");
      }
    } else {
      setSelectedOrg(null);
    }
  }, [selectedOrgId, setValue]);

  const onSubmit: SubmitHandler<Booking> = (data) => {
    console.log("New Booking Data:", data);
    alert("Booking created successfully!");
    navigate("/bookings");
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack
        title="Create New Booking"
        buttonLink={
          prefilledData
            ? `/travelers/show/${prefilledData.travelerId}`
            : "/bookings"
        }
      />
      <div className="p-10 mx-auto rounded-lg shadow-lg bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Primary Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-purple-950 uppercase font-bold mb-2">
                  Select Traveler<span className="text-red-600">*</span>
                </label>
                <select
                  {...register("traveler_id", {
                    required: "Traveler is required.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  disabled={!!prefilledData?.travelerId} // Disable if pre-filled
                >
                  <option value="">-- Select a Traveler --</option>
                  {travelersData.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-purple-950 text-sm uppercase font-bold mb-2">
                  Select Organisation<span className="text-red-600">*</span>
                </label>
                <select
                  {...register("organisation_id", {
                    required: "Organisation is required.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  disabled={!!prefilledData?.orgId} // Disable if pre-filled
                >
                  <option value="">-- Select an Organisation --</option>
                  {organisationData.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {selectedOrg && (
            <section>
              <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
                Route & Schedule
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-950 text-sm uppercase font-bold mb-2">
                    Pickup Location
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    {...register("pickup_location", {
                      required: "Pickup location is required.",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    {selectedOrg.checkpoints?.map((cp) => (
                      <option key={cp.name} value={cp.name}>
                        {cp.name}
                      </option>
                    ))}
                  </select>
                  {errors.pickup_location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pickup_location.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-purple-950 text-sm uppercase font-bold mb-2">
                    Drop Location
                  </label>
                  <input
                    {...register("drop_location")}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-purple-950 text-sm uppercase font-bold mb-2">
                    Pickup Time<span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register("pickup_time", {
                      required: "Pickup time is required.",
                    })}
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.pickup_time && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pickup_time.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-purple-950 text-sm uppercase font-bold mb-2">
                    Service End Date
                  </label>
                  <input
                    {...register("end_date")}
                    type="date"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </section>
          )}

          <SaveButton label="save" />
        </form>
      </div>
    </div>
  );
};

export default BookingCreatePage;
