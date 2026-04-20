import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  buttonText?: string;
  buttonLink?: string;
}

const PageHeader: React.FC<HeaderProps> = ({
  title,
  buttonText = "",
  buttonLink = "#",
}) => {

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="font-bold text-md text-purple-950 uppercase">{title}</h1>
      {buttonLink && buttonText && (
        <Link
          to={buttonLink}
          className={` bg-blue-700 text-white text-sm shadow-sm font-bold py-1 px-2 hover:bg-blue-800 rounded-lg  transition-colors uppercase`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default PageHeader;
