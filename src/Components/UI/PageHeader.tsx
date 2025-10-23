import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  buttonText?: string;
  buttonLink?: string;
  buttonColor?: string; // optional Tailwind color class
}

const PageHeader: React.FC<HeaderProps> = ({
  title,
  buttonText = "Create",
  buttonLink = "#",
  buttonColor = "green",
}) => {
  const bgColor = `bg-${buttonColor}-300`;
  const hoverColor = `hover:bg-${buttonColor}-400`;
  const textColor = `text-${buttonColor}-950`;

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-bold text-purple-950 uppercase">{title}</h1>
      {buttonLink && (
        <Link
          to={buttonLink}
          className={`${bgColor} ${textColor} shadow-sm font-bold py-2 px-4 rounded-lg ${hoverColor} transition-colors uppercase`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default PageHeader;
