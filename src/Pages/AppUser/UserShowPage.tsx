import { useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { travelersData, usersData } from "../../Data/Index";
import DetailItem from "../../Components/UI/DetailItem";
import type { Traveler } from "../../Types/Index"; // Import the Traveler type for props

// --- TravelerCard Component with proper typing ---
const TravelerCard = ({ traveler }: { traveler: Traveler }) => (
  <div className="border rounded-lg p-4 flex items-center gap-4 bg-gray-50">
    <img
      src={traveler.photo as string} // Cast photo to string as we know it's a URL here
      alt={`${traveler.first_name}`}
      className="h-16 w-16 rounded-full object-cover"
    />
    <div>
      <p className="font-bold">
        {traveler.first_name} {traveler.last_name}
      </p>
      <p className="text-sm text-gray-600">{traveler.relationship}</p>
      <p className="text-sm text-gray-600">DOB: {traveler.dob}</p>
      <p className="text-sm text-gray-600">Gender: {traveler.gender}</p>
    </div>
  </div>
);

const UserShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const user = usersData.find((u) => u.id === id);

  // This logic correctly filters travelers from the master list
  const userTravelers = travelersData.filter(
    (traveler) => traveler.user_id === user?.id
  );

  if (!user) {
    return (
      <div className="p-10 text-center">
        <h2>User not found.</h2>
      </div>
    );
  }

  // Improved address display to prevent trailing commas
  const fullAddress = [user.address_line1, user.address_line2]
    .filter(Boolean) // This removes any empty or null values
    .join(", ");

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="User Details" buttonLink="/users" />
      <div className="p-10 mx-auto rounded-lg bg-white shadow-sm">
        <div className="space-y-8">
          <section className="flex items-center gap-6">
            <img
              src={user.photo as string}
              alt={`${user.first_name}`}
              className="h-24 w-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </section>

          <section>
            {/* CORRECTED HEADER STYLE */}
            <h3 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md">
              Personal & Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <DetailItem label="Phone" value={user.phone} />
              <DetailItem label="Date of Birth" value={user.dob} />
            </div>
          </section>

          <section>
            {/* CORRECTED HEADER STYLE */}
            <h3 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <DetailItem label="Address" value={fullAddress} />
              <DetailItem label="City" value={user.city} />
              <DetailItem label="State" value={user.state} />
              <DetailItem label="PIN Code" value={user.pin} />
            </div>
          </section>

          {/* --- CORRECTED LOGIC FOR TRAVELERS --- */}
          <section>
            {/* CORRECTED HEADER STYLE and using the correct variable for the count */}
            <h3 className="text-sm uppercase bg-purple-50 p-2 font-bold text-black rounded-md">
              Associated Travelers ({userTravelers.length})
            </h3>
            {userTravelers.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {/* CORRECTED: Mapping over the correct 'userTravelers' variable */}
                {userTravelers.map((traveler) => (
                  <TravelerCard key={traveler.id} traveler={traveler} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-500">
                No travelers associated with this user.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserShowPage;
