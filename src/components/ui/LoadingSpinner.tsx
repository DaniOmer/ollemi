import React from "react";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const LoadingSpinner = ({
  size = "md",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-gray-300 border-t-primary animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
