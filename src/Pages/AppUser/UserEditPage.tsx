import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import StarInputField from "../../Components/Form/StarInputField";
import FileInputField from "../../Components/Form/FileInputField";
import type { AppUser as User } from "../../Types/Index";
import { usersData, travelersData } from "../../Data/Index"; // Import both data sources
import SaveButton from "../../Components/Form/SaveButton";
import { useEffect } from "react";
import { ImCross } from "react-icons/im";
import { BiPlus } from "react-icons/bi";

const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get user ID from URL

  // 1. Find the user and their specific travelers
  const userToEdit = usersData.find((u) => u.id === id);
  const userTravelersToEdit = travelersData.filter((t) => t.user_id === id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset, // Get the reset function
  } = useForm<User>();

  // 2. Populate the form with existing data
  useEffect(() => {
    if (userToEdit) {
      // Combine the main user object with their travelers before resetting
      const fullUserData = {
        ...userToEdit,
        travelers: userTravelersToEdit,
      };
      reset(fullUserData);
    }
  }, [userToEdit, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "travelers",
  });

  const onSubmit: SubmitHandler<User> = (data) => {
    // In a real app, you would handle file uploads and send a PUT/PATCH request
    console.log("Updated User Data:", data);
    alert(`User ${data.first_name} updated successfully!`);
    navigate("/users");
  };

  // Handle case where user is not found
  if (!userToEdit) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">User not found.</h2>
      </div>
    );
  }

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack
        title={`Edit User: ${userToEdit.first_name}`}
        buttonLink="/users"
      />
      <div className="p-10 mx-auto rounded-lg shadow-lg bg-white border border-gray-200">
        {/* The JSX for the form is IDENTICAL to the create page */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              User Information
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
                label="Date of Birth"
                name="dob"
                type="date"
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
              {/* Note: File inputs don't show existing files. Usually, you'd show the current file name and a "change" button. */}
              <FileInputField
                label="User Photo"
                name="photo"
                register={register}
                errors={errors}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarInputField
                label="Address Line 1"
                name="address_line1"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="Address Line 2"
                name="address_line2"
                register={register}
                errors={errors}
              />
              <StarInputField
                label="City"
                name="city"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="State"
                name="state"
                register={register}
                errors={errors}
                required
              />
              <StarInputField
                label="PIN Code"
                name="pin"
                register={register}
                errors={errors}
                required
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md mb-6">
              Associated Travelers
            </h2>
            <div className="grid grid-cols-2 gap-4 ">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 relative">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-white bg-red-400 p-1 rounded-full hover:text-red-700"
                  >
                    <ImCross size={10} />
                  </button>
                  <div className="grid grid-cols-2 gap-6">
                    <StarInputField
                      label="First Name"
                      name={`travelers.${index}.first_name`}
                      register={register}
                      errors={errors}
                      required
                    />
                    <StarInputField
                      label="Last Name"
                      name={`travelers.${index}.last_name`}
                      register={register}
                      errors={errors}
                      required
                    />
                    <StarInputField
                      label="Date of Birth"
                      name={`travelers.${index}.dob`}
                      type="date"
                      register={register}
                      errors={errors}
                      required
                    />
                    <div>
                      <label className="block text-purple-950 uppercase font-bold mb-2">
                        Gender
                      </label>
                      <select
                        {...register(`travelers.${index}.gender`)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-950 uppercase font-bold mb-2">
                        Relationship
                      </label>
                      <select
                        {...register(`travelers.${index}.relationship`)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <FileInputField
                      label="Traveler's Photo"
                      name={`travelers.${index}.photo`}
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                append({
                  id: `${Date.now()}`,
                  user_id: id || "", // Pre-fill the user_id for new travelers
                  first_name: "",
                  last_name: "",
                  dob: "",
                  gender: "Male",
                  relationship: "Other",
                  photo: "",
                })
              }
              className="mt-4 bg-green-300 text-purple-950 font-bold py-2 px-4 rounded-lg hover:bg-green-400"
            >
              <BiPlus size={20} />
            </button>
          </section>

          <SaveButton label="Save" />
        </form>
      </div>
    </div>
  );
};

export default UserEditPage;
