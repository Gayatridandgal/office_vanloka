import React from "react";

// Define the props the component will accept
interface DetailItemProps {
  label: string;
  value: React.ReactNode; // Using React.ReactNode allows passing strings, numbers, or other components
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900">
        {value || <span className="text-gray-400">N/A</span>}
      </p>
    </div>
  );
};

export default DetailItem;
