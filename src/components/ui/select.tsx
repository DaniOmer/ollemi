import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  className,
  label,
  labelClassName = "block text-sm font-medium mb-2",
  wrapperClassName = "",
  ...props
}) => {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={props.id || props.name} className={labelClassName}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={props.id || props.name}
          className={`w-full h-[50px] px-4 py-3 pl-4 pr-10 rounded-lg border border-input bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
};

export default Select;
