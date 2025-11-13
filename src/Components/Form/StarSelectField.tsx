import React from "react";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

type Option = {
  value: string | number;
  label: string;
};

type StarSelectFieldProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  options: Option[];
  required?: boolean | string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

const StarSelectField: React.FC<StarSelectFieldProps> = ({
  name,
  label,
  register,
  errors,
  options,
  required = false,
  className = "",
  placeholder = "Select an option",
  disabled = false,
}) => {
  const validationRules = {
    required: required
      ? typeof required === "string"
        ? required
        : `${label} is required.`
      : false,
  };

  const errorMessage = errors[name]?.message;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm text-purple-950 uppercase font-bold mb-2"
      >
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      <select
        id={name}
        {...register(name, validationRules)}
        disabled={disabled}
        className={`w-full px-4 py-3 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} >
            <span className="uppercase text-sm">{opt.label}</span>
          </option>
        ))}
      </select>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{String(errorMessage)}</p>
      )}
    </div>
  );
};

export default StarSelectField;
