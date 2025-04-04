import { fetchApi, fetchPrivateApi, ApiResponse } from "./api";
import {
  Company,
  Service,
  Professional,
  Photo,
  Address,
  SearchParams,
} from "@/types";

// Public endpoints
export async function getCompanies(): Promise<ApiResponse<Company[]>> {
  return fetchApi<Company[]>("/companies");
}

export async function getCompany(id: string): Promise<ApiResponse<Company>> {
  return fetchApi<Company>(`/companies/${id}`);
}

export async function getCompaniesByCategory(
  categoryId: string
): Promise<ApiResponse<Professional[]>> {
  return fetchApi<Professional[]>(`/categories/${categoryId}/companies`);
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

export async function uploadPhoto(
  companyId: string,
  photoUrl: string
): Promise<ApiResponse<Photo>> {
  return fetchPrivateApi<Photo>(`/companies/${companyId}/photos`, {
    method: "POST",
    data: { photoUrl },
  });
}

export async function deletePhoto(
  companyId: string,
  photoId: string
): Promise<ApiResponse<null>> {
  return fetchPrivateApi<null>(`/companies/${companyId}/photos/${photoId}`, {
    method: "DELETE",
  });
}

// Address endpoints
export async function getCompanyAddress(
  companyId: string
): Promise<ApiResponse<Address>> {
  return fetchApi<Address>(`/companies/${companyId}/addresses`);
}

export async function createCompanyAddress(
  companyId: string,
  addressData: Omit<Address, "id" | "company_id" | "created_at" | "updated_at">
): Promise<ApiResponse<Address>> {
  return fetchPrivateApi<Address>(`/companies/${companyId}/addresses`, {
    method: "POST",
    data: {
      ...addressData,
      company_id: companyId,
    },
  });
}

export async function updateCompanyAddress(
  companyId: string,
  addressId: string,
  addressData: Partial<Address>
): Promise<ApiResponse<Address>> {
  return fetchPrivateApi<Address>(
    `/companies/${companyId}/addresses/${addressId}`,
    {
      method: "PUT",
      data: addressData,
    }
  );
}

export async function deleteCompanyAddress(
  companyId: string,
  addressId: string
): Promise<ApiResponse<null>> {
  return fetchPrivateApi<null>(
    `/companies/${companyId}/addresses/${addressId}`,
    {
      method: "DELETE",
    }
  );
}

// Search endpoints
export async function searchCompanies(
  searchParams: SearchParams
): Promise<ApiResponse<Company[]>> {
  const params = new URLSearchParams();

  if (searchParams.service) {
    params.append("service", searchParams.service);
  }

  if (searchParams.location) {
    params.append("location", searchParams.location);
  }

  if (searchParams.date) {
    params.append("date", searchParams.date);
  }

  return fetchApi<Company[]>(`/search?${params.toString()}`);
}
