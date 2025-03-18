import { fetchApi, fetchPrivateApi, ApiResponse } from "./api";
import { Professional, Service } from "@/types";

// Public endpoints
export async function getProfessionals(): Promise<ApiResponse<Professional[]>> {
  return fetchApi<Professional[]>("/professionals");
}

export async function getProfessional(
  id: string
): Promise<ApiResponse<Professional>> {
  return fetchApi<Professional>(`/professionals/${id}`);
}

export async function getServices(
  proId: string
): Promise<ApiResponse<Service[]>> {
  return fetchApi<Service[]>(`/professionals/${proId}/services`);
}

export async function getService(id: string): Promise<ApiResponse<Service>> {
  return fetchApi<Service>(`/services/${id}`);
}

// Private endpoints (require authentication)
export async function createService(
  serviceData: Omit<Service, "id">
): Promise<ApiResponse<Service>> {
  return fetchPrivateApi<Service>("/services", {
    method: "POST",
    data: serviceData,
  });
}

export async function updateService(
  id: string,
  serviceData: Partial<Service>
): Promise<ApiResponse<Service>> {
  return fetchPrivateApi<Service>(`/services/${id}`, {
    method: "PUT",
    data: serviceData,
  });
}

export async function deleteService(id: string): Promise<ApiResponse<null>> {
  return fetchPrivateApi<null>(`/services/${id}`, {
    method: "DELETE",
  });
}

export async function updateProfessional(
  id: string,
  professionalData: Partial<Professional>
): Promise<ApiResponse<Professional>> {
  return fetchPrivateApi<Professional>(`/professionals/${id}`, {
    method: "PUT",
    data: professionalData,
  });
}
