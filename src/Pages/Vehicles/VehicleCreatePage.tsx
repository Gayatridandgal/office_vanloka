import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import FileInputField from "../../Components/Form/FileInputField";
import StarInputField from "../../Components/Form/StarInputField";
import { assignedGps } from "../../Data/Index";
import SaveButton from "../../Components/Form/SaveButton";

type FormInputs = {
  name: string;
  model: string;
  registration_number: string;
  gps_code: string;
  status: "Active" | "Inactive" | "Maintenance";
  insurance_certificate: FileList; // The type for a file input is FileList
  puc_certificate: FileList;
};

const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const insuranceFile = data.insurance_certificate[0];
    const pucFile = data.puc_certificate[0];

    // In a real application, you would upload these files to a server here.
    // For now, we'll just log their names.
    const finalData = {
      ...data,
      insurance_certificate: insuranceFile ? insuranceFile.name : "",
      puc_certificate: pucFile ? pucFile.name : "",
    };

    console.log("New Vehicle Data:", finalData);
    alert(`Vehicle ${data.name} created successfully!`);
    navigate("/vehicles");
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add New Vehicle" buttonLink="/vehicles" />
      <div className="p-10 mx-auto max-w-5xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Section 1: Vehicle Information --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Vehicle Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Vehicle Name"
                name="name"
                register={register}
                errors={errors}
                required="Name is required."
              />
              <StarInputField
                label="Model"
                name="model"
                register={register}
                errors={errors}
                required="Model is required."
              />
              <StarInputField
                label="Registration No."
                name="registration_number"
                register={register}
                errors={errors}
                required="Registration number is required."
              />

              {/* GPS Device Selector */}
              <div>
                <label
                  htmlFor="gps_code"
                  className="block text-purple-950 uppercase text-sm font-bold mb-2"
                >
                  Assign GPS Device<span className="text-red-600">*</span>
                </label>
                <select
                  id="gps_code"
                  {...register("gps_code", {
                    required: "A GPS device must be assigned.",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" selected>
                    Select GPS
                  </option>
                  {assignedGps.map((device) => (
                    <option key={device.id} value={device.imei_number}>
                      {device.name} ({device.imei_number})
                    </option>
                  ))}
                </select>
                {errors.gps_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gps_code.message}
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
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </section>

          {/* --- Section 2: Documents & Certificates --- */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Documents & Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInputField
                label="Insurance Certificate"
                name="insurance_certificate"
                register={register}
                errors={errors}
                required="Insurance certificate is required."
              />
              <FileInputField
                label="PUC Certificate"
                name="puc_certificate"
                register={register}
                errors={errors}
                required="PUC certificate is required."
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

export default VehicleCreatePage;
