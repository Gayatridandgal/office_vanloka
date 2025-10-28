import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { assignedBeacons, travelersData } from "../../Data/Index";
import type { Traveler } from "../../Types/Index";
import SaveButton from "../../Components/Form/SaveButton";
import InputField from "../../Components/Form/InputField";

const TravelerEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get the traveler ID from the URL

  // Find the specific traveler to edit
  const travelerToEdit = travelersData.find((t) => t.id === id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Traveler>();

  // This hook populates the form with the traveler's data when the component loads
  useEffect(() => {
    if (travelerToEdit) {
      reset(travelerToEdit);
    }
  }, [travelerToEdit, reset]);

  const onSubmit: SubmitHandler<Traveler> = (data) => {
    // In a real app, you would send a PATCH request with just the beacon_id
    console.log("Updated Traveler Data (Beacon ID changed):", data);
    alert(`Beacon for ${data.first_name} has been updated successfully!`);
    navigate(`/travelers`); // Navigate back to the show page
  };

  if (!travelerToEdit) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Traveler Not Found</h2>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Edit Traveler" buttonLink={`/travelers`} />
      <div className="p-10 mx-auto max-w-5xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Traveler Information (Read-Only) --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Traveler Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                disabled={true}
              />
              <InputField
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                disabled={true}
              />
              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                register={register}
                errors={errors}
                disabled={true}
              />

              <InputField
                label="Gender"
                name="gender"
                type="text"
                register={register}
                errors={errors}
                disabled={true}
              />
            </div>
          </section>

          {/* --- Section 2: Beacon Assignment (Editable) --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Beacon Assignment
            </h2>
            <div>
              <label
                htmlFor="beacon"
                className="block text-purple-950 uppercase text-sm font-bold mb-2"
              >
                Assign Beacon<span className="text-red-600">*</span>
              </label>
              <select
                id="beacon"
                {...register("beacon", {
                  required: "A beacon device must be assigned.",
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Select a Beacon --</option>
                {assignedBeacons.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.imei_number})
                  </option>
                ))}
              </select>
              {errors.beacon && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.beacon.message}
                </p>
              )}
            </div>
          </section>

          {/* --- Form Submission Button --- */}
          <SaveButton label="Save" />
        </form>
      </div>
    </div>
  );
};

export default TravelerEditPage;
