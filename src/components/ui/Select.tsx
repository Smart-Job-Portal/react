import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  variant?: "default" | "filled";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      variant = "default",
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer";

    const variants = {
      default: "border-gray-300 bg-white focus-visible:ring-blue-500",
      filled: "border-transparent bg-gray-100 focus-visible:ring-blue-500 focus:bg-white focus:border-gray-300",
    };

    const errorStyles = error ? "border-red-500 focus-visible:ring-red-500" : "";

    const selectStyles = cn(
      baseStyles,
      variants[variant],
      errorStyles,
      "pr-10", // Make room for dropdown arrow
      className,
    );

    const containerWidth = fullWidth ? "w-full" : "";

    return (
      <div className={cn("space-y-2", containerWidth)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select className={selectStyles} ref={ref} disabled={disabled} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
