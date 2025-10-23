import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import type { Driver } from "../../Types/Index";

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Driver>();

  const onSubmit: SubmitHandler<Driver> = (data) => {
    const driving_license = data.driving_license[0];
    const aadhaar_card = data.aadhaar_card[0];
    const pan_card = data.pan_card[0];

    // In a real application, you would upload these files to a server here.
    // For now, we'll just log their names.
    const finalData = {
      ...data,
      driving_license: driving_license ? driving_license.name : "",
      aadhaar_card: aadhaar_card ? aadhaar_card.name : "",
      pan_card: pan_card ? pan_card.name : "",
    };

    console.log("New Driver Data:", finalData);
    alert(`Driver ${data.email} created successfully!`);
    navigate("/drivers");
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add Driver" buttonLink="/drivers" />
      <div className="p-8 max-w-5xl mx-auto rounded-lg shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fields from previous example... */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                {...register("first_name", { required: "Name is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.first_name && (
                <p className="error-style">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                {...register("last_name", { required: "Name is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.last_name && (
                <p className="error-style">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Email
              </label>
              <input
                type="text"
                {...register("email", { required: "Name is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.email && (
                <p className="error-style">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Phone
              </label>
              <input
                type="text"
                {...register("phone", { required: "Name is required." })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.phone && (
                <p className="error-style">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="beacon_code"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Beacon Code
              </label>
              <input
                type="text"
                {...register("beacon_code", {
                  required: "Beacon Code is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.beacon_code && (
                <p className="error-style">{errors.beacon_code.message}</p>
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
                htmlFor="driving_license"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Driving License
              </label>
              <input
                type="file"
                id="driving_license"
                {...register("driving_license", {
                  required: "Title is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.driving_license && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.driving_license.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="aadhaar_card"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Aadhaar Card
              </label>
              <input
                type="file"
                id="aadhaar_card"
                {...register("aadhaar_card", {
                  required: "Title is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.aadhaar_card && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.aadhaar_card.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pan_card"
                className="block text-purple-950 uppercase font-bold mb-2"
              >
                Pan Card
              </label>
              <input
                type="file"
                id="pan_card"
                {...register("pan_card", {
                  required: "Title is required.",
                })}
                className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              {errors.pan_card && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pan_card.message}
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

export default DriverCreatePage;
