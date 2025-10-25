import React from "react";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

type FileInputFieldProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  required?: boolean | string;
};

const FileInputField: React.FC<FileInputFieldProps> = ({
  name,
  label,
  register,
  errors,
  required = false,
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
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={name}
        type="file"
        {...register(name, validationRules)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{String(errorMessage)}</p>
      )}
    </div>
  );
};

export default FileInputField;
