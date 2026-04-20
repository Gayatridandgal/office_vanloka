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
  buttonText = "Back",
  buttonLink = "#",
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-md font-bold text-purple-950 uppercase">{title}</h1>
        {buttonLink && (
          <Link
            to={buttonLink}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FaArrowLeft size={12} /> {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default PageHeaderBack;
