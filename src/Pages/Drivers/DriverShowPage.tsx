import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeaderBack from "../../Components/UI/PageHeaderBack";
import { driverData } from "../../Data/Index";
import type { Driver } from "../../Types/Index";
import { FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";

const DriverShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const foundDriver = driverData.find((v) => v.id === id);
    if (foundDriver) {
      setDriver(foundDriver);
    }
  }, [id]);

  if (!driver) {
    return (
      <div className="px-4 bg-white min-h-screen">
        <PageHeaderBack title="Driver Not Found" buttonLink="drivers" />
        <p className="p-8 text-center">
          The requested driver could not be found.
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
              href={`/drivers/${fileName}`} // In a real app, this path would be dynamic
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-purple-800 hover:text-purple-600"
            >
              <FaExternalLinkAlt />
            </a>
          </div>
          <img src={`/drivers/${fileName}`} alt="" className="h-40 w-56 mt-5" />
        </div>
      ) : (
        <p className="mt-2 text-gray-500 italic">Not Uploaded</p>
      )}
    </div>
  );

  return (
    <div className="px-4 bg-white min-h-screen">
      <PageHeaderBack title="Driver Details" buttonLink="/drivers" />
      <div className="p-8 mx-auto rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                Driver
              </h3>
              <p className="text-lg text-purple-950">
                {driver.first_name} {driver.last_name}
              </p>
              <p className="mt-5 text-lg text-purple-950">{driver.phone}</p>
              <p className="text-lg text-purple-950">{driver.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                Beacon Code
              </h3>
              <p className="text-lg text-purple-950">{driver.beacon_code}</p>
            </div>
          </div>
          {/* Documents Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-950 border-b pb-2 mb-4">
              Documents
            </h3>
            <FileDisplay
              fileName={driver.driving_license}
              label="Insurance Certificate"
            />
            <FileDisplay
              fileName={driver.aadhaar_card}
              label="PUC Certificate"
            />
            <FileDisplay fileName={driver.pan_card} label="PUC Certificate" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverShowPage;
