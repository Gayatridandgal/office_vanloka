import React from "react";
import { MdErrorOutline } from "react-icons/md";

interface EmptyStateProps {
  icon?: React.ReactNode;
  message?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <MdErrorOutline className="w-8 h-8" />,  
  message = "Data not found...",                          
  className,
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-red-500 w-8 h-8">{icon}</div>
      <p className="text-gray-600 text-sm uppercase font-semibold">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
