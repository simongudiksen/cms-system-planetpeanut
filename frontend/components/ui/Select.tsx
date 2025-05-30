import React from "react";
import { cn } from "@/utils/cn";
import { SelectOption } from "@/types";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  placeholder?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      placeholder = "Select an option...",
      options,
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div className={cn(fullWidth && "w-full", "space-y-1")}>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "input",
              "appearance-none cursor-pointer",
              hasError && "input-error",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && <p className="text-sm text-error-600 mt-1">{error}</p>}

        {helpText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
