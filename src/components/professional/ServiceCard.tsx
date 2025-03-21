import React from "react";
import { withMemo } from "@/components/ui/MemoizedComponent";
import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

/**
 * A component that displays a service card with edit and delete actions.
 * This component is memoized to prevent unnecessary re-renders.
 */
const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">{service.name}</h3>
        <div className="text-lg font-semibold">
          ${service.price?.toFixed(2)}
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-1">
        {service.description || "No description provided"}
      </p>
      <div className="flex justify-between items-center mt-3">
        <div className="text-sm text-gray-500">
          Duration: {service.duration} minutes
        </div>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(service)}
            className="text-blue-500 hover:text-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Export the memoized version of the component
export default withMemo(ServiceCard);
