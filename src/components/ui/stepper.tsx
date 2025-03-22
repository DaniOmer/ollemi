import React from "react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface StepperProps {
  steps: StepItem[];
  className?: string;
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-all duration-200",
                  step.completed
                    ? "bg-primary text-white shadow-primary/20"
                    : step.current
                    ? "bg-primary/10 border-2 border-primary text-primary"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                )}
              >
                {step.completed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div
                className={cn(
                  "mt-2 text-xs font-medium text-center",
                  step.completed
                    ? "text-primary font-semibold"
                    : step.current
                    ? "text-primary"
                    : "text-gray-500"
                )}
              >
                {step.label}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="relative flex-1 mx-2">
                <div
                  className={cn(
                    "absolute top-5 h-0.5 w-full -translate-y-1/2 transition-colors duration-200",
                    index < steps.findIndex((s) => s.current)
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
