import { fetchApi, fetchPrivateApi, ApiResponse } from "./api";
import { Company, Service } from "@/types";

// Public endpoints
export async function getCompanies(): Promise<ApiResponse<Company[]>> {
  return fetchApi<Company[]>("/companies");
}

export async function getCompany(id: string): Promise<ApiResponse<Company>> {
  return fetchApi<Company>(`/companies/${id}`);
}

export async function getServices(
  companyId: string
): Promise<ApiResponse<Service[]>> {
  return fetchApi<Service[]>(`/companies/${companyId}/services`);
}

export async function getService(
  id: string,
  companyId: string
): Promise<ApiResponse<Service>> {
  return fetchApi<Service>(`/companies/${companyId}/services/${id}`);
}

// Private endpoints (require authentication)
export async function createService(
  serviceData: Omit<Service, "id">,
  companyId: string
): Promise<ApiResponse<Service>> {
  return fetchPrivateApi<Service>(`/companies/${companyId}/services`, {
    method: "POST",
    data: serviceData,
  });
}

export async function updateService(
  id: string,
  serviceData: Partial<Service>,
  companyId: string
): Promise<ApiResponse<Service>> {
  return fetchPrivateApi<Service>(`/companies/${companyId}/services/${id}`, {
    method: "PUT",
    data: serviceData,
  });
}

export async function deleteService(
  id: string,
  companyId: string
): Promise<ApiResponse<null>> {
  return fetchPrivateApi<null>(`/companies/${companyId}/services/${id}`, {
    method: "DELETE",
  });
}

export async function updateCompany(
  id: string,
  companyData: Partial<Company>
): Promise<ApiResponse<Company>> {
  return fetchPrivateApi<Company>(`/companies/${id}`, {
    method: "PUT",
    data: companyData,
  });
}
