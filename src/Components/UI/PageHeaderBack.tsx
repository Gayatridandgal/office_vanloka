import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  buttonText?: string;
  buttonLink: string;
  buttonColor?: string; // optional Tailwind color class
}

const PageHeaderBack: React.FC<HeaderProps> = ({
  title,
  buttonText = "",
  buttonLink = "#",
}) => {
  return (
    <div className="flex items-center mb-4 gap-2 ">
      {buttonLink && (
        <Link
          to={buttonLink}
          className={`flex items-center font-bold rounded-lg text-md transition-colors uppercase`}
        >
          <FaArrowLeft size={25} /> {buttonText}
        </Link>
      )}
      <h1 className="text-lg font-bold text-purple-950 uppercase">{title}</h1>
    </div>
  );
};

export default PageHeaderBack;
