import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import type { Driver } from "../../Types/Index";
import StarInputField from "../../Components/Form/StarInputField"; // Assuming this path
import FileInputField from "../../Components/Form/FileInputField"; // Assuming this path
import { assignedBeacons } from "../../Data/Index";
import SaveButton from "../../Components/Form/SaveButton";

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Driver>();

  const onSubmit: SubmitHandler<Driver> = (data) => {
    // This logic correctly handles file inputs
    const finalData = {
      ...data,
      driving_license: data.driving_license[0]?.name || "",
      aadhaar_card: data.aadhaar_card[0]?.name || "",
      pan_card: data.pan_card[0]?.name || "",
    };

    console.log("New Driver Data:", finalData);
    alert(`Driver ${data.first_name} ${data.last_name} created successfully!`);
    navigate("/drivers");
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add New Driver" buttonLink="/drivers" />
      <div className="p-10 mx-auto max-w-5xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Driver Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Driver Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                required="First name is required."
              />
              <StarInputField
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                required="Last name is required."
              />
              <StarInputField
                label="Email"
                name="email"
                type="email"
                register={register}
                errors={errors}
                required="Email is required."
              />
              <StarInputField
                label="Phone"
                name="phone"
                type="tel"
                register={register}
                errors={errors}
                required="Phone number is required."
              />

              {/* Beacon Device Selector */}
              <div>
                <label
                  htmlFor="beacon_code"
                  className="block text-purple-950 text-sm uppercase font-bold mb-2"
                >
                  Assign Beacon<span className="text-red-600">*</span>
                </label>
                <select
                  id="beacon_code"
                  {...register("beacon_code", {
                    required: "A beacon must be assigned.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" selected>
                    Select Beacon
                  </option>
                  {assignedBeacons.map((beacon) => (
                    <option key={beacon.id} value={beacon.imei_number}>
                      {beacon.name} ({beacon.imei_number})
                    </option>
                  ))}
                </select>
                {errors.beacon_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.beacon_code.message}
                  </p>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm text-purple-950 uppercase font-bold mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </section>

          {/* --- Section 2: Documents --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileInputField
                label="Driving License"
                name="driving_license"
                register={register}
                errors={errors}
                required
              />
              <FileInputField
                label="Aadhaar Card"
                name="aadhaar_card"
                register={register}
                errors={errors}
                required
              />
              <FileInputField
                label="PAN Card"
                name="pan_card"
                register={register}
                errors={errors}
                required
              />
            </div>
          </section>

          {/* --- Form Submission Button --- */}
          <SaveButton label="save" />
        </form>
      </div>
    </div>
  );
};

export default DriverCreatePage;
