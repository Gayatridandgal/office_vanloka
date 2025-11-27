// src/components/staff/StaffEditPage.tsx
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import SaveButton from "../../Components/Form/SaveButton";
import FileInputField from "../../Components/Form/FileInputField";
import { useAlert } from "../../Context/AlertContext";
import tenantApi, { asset } from "../../Services/ApiService";
import { Loader } from "../../Components/UI/Loader";
import { useAuth } from "../../Context/AuthContext";
import InputField from "../../Components/Form/InputField";

interface Role {
  id: number;
  name: string;
}

interface StaffFormData {
  photo?: FileList;
  employee_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  gender: string;
  address: string;
  joining_date: string;
  email: string;
  phone: string;
  roles: string[];
  status: "Active" | "Inactive";
}

const StaffEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const { refreshMe } = useAuth();


  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: {
      status: "Active",
      roles: [],
      gender: "Male",
    },
  });

  // Fetch roles and employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch roles
        const rolesResponse = await tenantApi.get("/roles");
        setAllRoles(rolesResponse.data.data || []);

        // Fetch employee data
        const employeeResponse = await tenantApi.get(`/employees/${id}`);
        const employee = employeeResponse.data;

        // Set current photo
        setCurrentPhoto(employee.photo);
        setFullName(`${employee.first_name} ${employee.last_name}`);

        // Populate form with employee data
        reset({
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          designation: employee.designation,
          gender: employee.gender,
          address: employee.address,
          joining_date: employee.joining_date.split("T")[0],
          email: employee.email,
          phone: employee.phone,
          status: employee.status,
          roles: employee.roles || [],
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        showAlert(
          err.response?.data?.message || "Failed to load employee data.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset, showAlert]);

  const onSubmit: SubmitHandler<StaffFormData> = async (data) => {
    if (data.roles.length === 0) {
      showAlert("Please select at least one role.", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file upload
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

      // Add roles
      data.roles.forEach((role) => {
        formData.append("roles[]", role);
      });

      // Add ONLY the new photo if user selected one
      if (data.photo && data.photo.length > 0) {
        formData.append("photo", data.photo[0]);
      }

      // Add method spoofing for Laravel PUT
      formData.append("_method", "PUT");

      console.log("📤 Updating staff with FormData");

      const response = await tenantApi.post(`/employees/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Update response:", response.data);

      showAlert(
        response.data.message || "Staff member updated successfully!",
        "success"
      );
      await refreshMe();
      navigate("/staff");
    } catch (err: any) {
      console.error("❌ Error updating staff:", err);
      console.error("Response data:", err.response?.data);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors)
          .flat()
          .join(", ");
        showAlert(`Validation failed: ${errorMessages}`, "error");
      } else {
        showAlert(
          err.response?.data?.message || "Failed to update staff member.",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Edit Staff" buttonLink="/staff" />
      <div className="p-10 mx-auto max-w-6xl rounded-lg shadow-lg bg-white border border-gray-200">
        {/* Current Photo Preview */}
        {currentPhoto && (
          <div className="mb-6 flex items-center">
            <img
              src={`${asset}${currentPhoto}`}

              className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
            />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">{fullName}</p>
              <p className="text-xs text-gray-500">
                Upload a new photo to replace it
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gender.message}
                  </p>
                )}
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

              <div className="md:col-span-2">
                <FileInputField
                  label="Update Photo"
                  name="photo"
                  register={register}
                  errors={errors}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep the current photo. JPG, PNG format only. Max 2MB
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

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/staff")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <SaveButton
              label={submitting ? "saving..." : "save"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEditPage;
