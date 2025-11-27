// src/components/staff/StaffCreatePage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import FileInputField from "../../Components/Form/FileInputField";
import { useAlert } from "../../Context/AlertContext";
import type { Staff } from "./Staff.types";
import tenantApi from "../../Services/ApiService";
import InputField from "../../Components/Form/InputField";

interface Role {
  id: number;
  name: string;
}

const StaffCreatePage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Staff>({
    defaultValues: {
      status: "Active",
      roles: [],
      gender: "Male",
    },
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await tenantApi.get("/roles");
        setAllRoles(response.data.data || []);
      } catch (err) {
        showAlert("Failed to load roles.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const onSubmit: SubmitHandler<Staff> = async (data) => {
    if (data.roles.length === 0) {
      showAlert("Please select at least one role.", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData - this is for sending files
      const formData = new FormData();

      // Add text fields
      formData.append("employee_id", data.employee_id);
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("designation", data.designation);
      formData.append("gender", data.gender);
      formData.append("address", data.address);
      formData.append("joining_date", data.joining_date);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("status", data.status);

      // Add roles array
      data.roles.forEach((role) => {
        formData.append("roles[]", role);
      });

      // Add SINGLE photo (only if user selected one)
      if (data.photo && data.photo.length > 0) {
        formData.append("photo", data.photo[0]); // Only first file
      }

      console.log("📤 Sending single photo with form data");

      const response = await tenantApi.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert(
        response.data.message || "Staff member created successfully!",
        "success"
      );
      navigate("/staff");
    } catch (err: any) {
      console.error("❌ Error:", err.response?.data);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors)
          .flat()
          .join(", ");
        showAlert(`Validation failed: ${errorMessages}`, "error");
      } else {
        showAlert(
          err.response?.data?.message || "Failed to create staff member.",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading roles...</div>;
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Add Staff" buttonLink="/staff" />
      <div className="p-10 mx-auto max-w-6xl rounded-lg shadow-lg bg-white border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Staff Details Section */}
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Staff Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Emp ID"
                name="employee_id"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="First Name"
                name="first_name"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Last Name"
                name="last_name"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Phone"
                name="phone"
                type="tel"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Designation"
                name="designation"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Address"
                name="address"
                register={register}
                errors={errors}
                required
              />
              <InputField
                label="Joining Date"
                name="joining_date"
                type="date"
                register={register}
                errors={errors}
                required
              />

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm text-purple-950 uppercase font-bold mb-2"
                >
                  Gender <span className="text-red-600">*</span>
                </label>
                <select
                  id="gender"
                  {...register("gender", { required: "Gender is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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

              {/* SINGLE Photo Upload */}
              <div className="md:col-span-2">
                <FileInputField
                  label="Staff Photo (Optional - Single File Only)"
                  name="photo"
                  register={register}
                  errors={errors}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG format only. Max 2MB
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-4">
              Assign Roles<span className="text-red-600">*</span>
            </h2>
            <Controller
              name="roles"
              control={control}
              rules={{ required: "At least one role must be selected." }}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allRoles.map((role) => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={field.value?.includes(role.name)}
                        onChange={(e) => {
                          const selectedRoles = field.value || [];
                          const newSelection = e.target.checked
                            ? [...selectedRoles, role.name]
                            : selectedRoles.filter((r) => r !== role.name);
                          field.onChange(newSelection);
                        }}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="ml-3 text-sm text-gray-700 uppercase"
                      >
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.roles && (
              <p className="text-red-500 text-sm mt-2">{errors.roles.message}</p>
            )}
          </section>

          <SaveButton label={submitting ? "Saving..." : "Save"} />
        </form>
      </div>
    </div>
  );
};

export default StaffCreatePage;
