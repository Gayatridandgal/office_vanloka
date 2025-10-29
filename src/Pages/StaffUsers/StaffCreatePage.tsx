import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import type { Staff } from "../../Types/Index";
import { rolesData } from "../../Data/Index";
import SaveButton from "../../Components/Form/SaveButton";
import FileInputField from "../../Components/Form/FileInputField";

const StaffCreatePage = () => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Staff>({
    defaultValues: {
      status: "Active",
      role: [],
    },
  });

  const onSubmit: SubmitHandler<Staff> = (data) => {
    const finalData = {
      ...data,
      photo: (data.photo?.[0] as File)?.name ?? "default-avatar.png", // Handle file object safely
    };
    console.log("New Staff Data:", finalData);
    alert(`Staff member ${data.first_name} created successfully!`);
    navigate("/staff");
  };

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add Staff" buttonLink="/staff" />
      <div className="p-10 mx-auto max-w-5xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Staff Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="Email"
                name="email"
                type="email"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="Phone"
                name="phone"
                type="tel"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="Designation"
                name="designation"
                register={register}
                errors={errors}
                required
              />
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm text-purple-950 uppercase font-bold mb-2"
                >
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {/* Added the photo upload field here */}
              <div className="md:col-span-2">
                <FileInputField
                  label="Staff Photo"
                  name="photo"
                  register={register}
                  errors={errors}
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              Assign Roles<span className="text-red-600">*</span>
            </h2>
            <Controller
              name="role"
              control={control}
              rules={{ required: "At least one role must be selected." }}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rolesData.map((role) => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={field.value?.some((r) => r.id === role.id)}
                        onChange={(e) => {
                          const selectedRoles = field.value || [];
                          const newSelection = e.target.checked
                            ? [...selectedRoles, role]
                            : selectedRoles.filter((r) => r.id !== role.id);
                          field.onChange(newSelection);
                        }}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="ml-3 text-sm uppercase text-gray-700"
                      >
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.role && (
              <p className="text-red-500 text-sm mt-2">{errors.role.message}</p>
            )}
          </section>

          <SaveButton label="Save " />
        </form>
      </div>
    </div>
  );
};

export default StaffCreatePage;
