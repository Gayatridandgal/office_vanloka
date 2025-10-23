// src/Pages/Vehicles/VehicleEditPage.tsx

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { vehiclesData } from "../../Data/Index";
import type { Vehicle } from "../../Types/Index";

const VehicleEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Vehicle>();

  useEffect(() => {
    const vehicle = vehiclesData.find((v) => v.id === id);
    if (vehicle) {
      setCurrentVehicle(vehicle);
      // We reset the form with existing text data.
      // We cannot reset file inputs for security reasons.
      reset({
        name: vehicle.name,
        model: vehicle.model,
        registration_number: vehicle.registration_number,
        gps_code: vehicle.gps_code,
        status: vehicle.status,
      });
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<Vehicle> = (data) => {
    // Check if a new file was uploaded. If not, keep the old one.
    const insuranceFile = data.insurance_certificate[0];
    const pucFile = data.puc_certificate[0];

    const finalData = {
      ...data,
      insurance_certificate: insuranceFile
        ? insuranceFile.name
        : currentVehicle?.insurance_certificate,
      puc_certificate: pucFile ? pucFile.name : currentVehicle?.puc_certificate,
    };

    console.log("Updated Vehicle Data:", finalData);
    alert(`Vehicle ${data.name} updated successfully!`);
    navigate("/vehicles");
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Edit Vehicle" buttonLink="/vehicles" />
      <div className="p-8 max-w-5xl mx-auto rounded-lg shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fields from previous example... */}
            <div>
              <label
                htmlFor="name"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Vehicle Name
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.name && (
                <p className="error-style">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="model"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Model
              </label>
              <input
                type="text"
                {...register("model", { required: "Model is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.model && (
                <p className="error-style">{errors.model.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="registration_number"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Registration No.
              </label>
              <input
                type="text"
                {...register("registration_number", {
                  required: "Registration is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.registration_number && (
                <p className="error-style">
                  {errors.registration_number.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="gps_code"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                GPS Code
              </label>
              <input
                type="text"
                {...register("gps_code", { required: "GPS Code is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.gps_code && (
                <p className="error-style">{errors.gps_code.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* File Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label
                htmlFor="insurance_certificate"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Insurance Certificate
              </label>
              <input
                type="file"
                id="insurance_certificate"
                {...register("insurance_certificate", {
                  required: "Title is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.insurance_certificate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.insurance_certificate.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="puc_certificate"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                PUC Certificate
              </label>
              <input
                type="file"
                id="puc_certificate"
                {...register("puc_certificate", {
                  required: "Title is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.puc_certificate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.puc_certificate.message}
                </p>
              )}
            </div>
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

export default VehicleEditPage;
