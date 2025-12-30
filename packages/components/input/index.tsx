import React, { forwardRef } from "react";

type BaseProps = {
  label?: string;
  type?: "text" | "number" | "email" | "password" | "textarea";
  className?: string;
};

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-gray-300 mb-1">
            {label}
          </label>
        )}
        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`w-full border border-gray-700 outline-none bg-transparent p-2 rounded-md text-white ${className}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={`w-full border border-gray-700 outline-none bg-transparent p-2 rounded-md text-white ${className}`}
            {...(props as InputProps)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
