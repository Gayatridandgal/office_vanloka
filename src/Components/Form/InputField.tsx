import React from "react";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

// Define the props for the component
type InputFieldProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  required?: boolean | string;
  type?: "text" | "email" | "number" | "password" | "tel";
  className?: string;
  placeholder?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  register,
  errors,
  required = false,
  type = "text",
  className = "",
  ...props // To capture other props like placeholder
}) => {
  // Define validation rules based on the 'required' prop
  const validationRules = {
    required: required
      ? typeof required === "string"
        ? required
        : `${label} is required.`
      : false,
  };

  // Safely access the specific error message for this field
  const errorMessage = errors[name]?.message;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-purple-950 uppercase font-bold mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name, validationRules)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
        {...props} // Spread other props like placeholder
      />
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{String(errorMessage)}</p>
      )}
    </div>
  );
};

export default InputField;
