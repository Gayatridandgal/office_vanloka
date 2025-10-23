import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { vehiclesData } from "../../Data/Index";
import type { Vehicle } from "../../Types/Index";
import { FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";

const VehicleShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const foundVehicle = vehiclesData.find((v) => v.id === id);
    if (foundVehicle) {
      setVehicle(foundVehicle);
    }
  }, [id]);

  if (!vehicle) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Vehicle Not Found" buttonLink="vehicles" />
        <p className="p-8 text-center">
          The requested vehicle could not be found.
        </p>
      </div>
    );
  }

  // A helper component for displaying file links
  const FileDisplay = ({
    fileName,
    label,
  }: {
    fileName: string;
    label: string;
  }) => (
    <div>
      <h4 className="text-sm font-bold text-gray-500 uppercase">{label}</h4>
      {fileName ? (
        <div>
          <div className="mt-2 flex items-center p-3 border border-purple-200 rounded-lg">
            <FaFilePdf className="text-red-500 text-2xl" />
            <span className="ml-3 text-gray-700 font-medium">{fileName}</span>
            <a
              href={`/vehicles/${fileName}`} // In a real app, this path would be dynamic
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-purple-800 hover:text-purple-600"
            >
              <FaExternalLinkAlt />
            </a>
          </div>
          <img
            src={`/vehicles/${fileName}`}
            alt=""
            className="h-40 w-56 mt-5"
          />
        </div>
      ) : (
        <p className="mt-2 text-gray-500 italic">Not Uploaded</p>
      )}
    </div>
  );

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Vehicle Details" buttonLink="/vehicles" />
      <div className="p-8 mx-auto rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                Vehicle Name
              </h3>
              <p className="text-lg text-purple-950">{vehicle.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                Model
              </h3>
              <p className="text-lg text-purple-950">{vehicle.model}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                Registration Number
              </h3>
              <p className="text-lg text-purple-950">
                {vehicle.registration_number}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                GPS Code
              </h3>
              <p className="text-lg text-purple-950">{vehicle.gps_code}</p>
            </div>
          </div>
          {/* Documents Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-950 border-b pb-2 mb-4">
              Documents
            </h3>
            <FileDisplay
              fileName={vehicle.insurance_certificate}
              label="Insurance Certificate"
            />
            <FileDisplay
              fileName={vehicle.puc_certificate}
              label="PUC Certificate"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleShowPage;
