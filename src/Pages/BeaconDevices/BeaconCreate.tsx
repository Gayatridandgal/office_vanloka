// src/Pages/GpsDevices/CreatePage.tsx

import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import type { Beacon } from "../../Types/Index";

const BeaconCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Beacon>();

  // This function is called when the form is successfully validated
  const onSubmit: SubmitHandler<Beacon> = (data: Beacon) => {
    console.log("Form Data:", data);
    // In a real app, you would make an API call here.
    alert(`Device "${data.title}" created successfully!`);
    navigate("/beacon_devices"); // Redirect after submission
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add Beacon Device" buttonLink="/gps_devices" />

      <div className="p-8 max-w-2xl mx-auto rounded-lg shadow-sm">
        {/* Pass the onSubmit handler to react-hook-form's handleSubmit */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title Field */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-purple-950 uppercase font-bold mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              {...register("title", { required: "Title is required." })}
              className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Main Tracker"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Device ID Field */}
          <div className="mb-6">
            <label
              htmlFor="id"
              className="block text-purple-950 uppercase font-bold mb-2"
            >
              Device ID
            </label>
            <input
              type="text"
              id="beacon_id"
              {...register("beacon_id", { required: "Device ID is required." })}
              className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="BEACON-A001"
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-purple-200 text-purple-900 font-bold py-2 px-6 rounded-lg hover:bg-purple-300 uppercase transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default BeaconCreatePage;
