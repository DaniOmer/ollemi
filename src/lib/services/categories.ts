import { ApiResponse } from "./api";

import { fetchApi } from "./api";
import { Category } from "@/types";

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return fetchApi<Category[]>(`/categories`);
}

export async function getCategoryById(
  id: string,
  includeCompanies = false
): Promise<ApiResponse<Category>> {
  const url = includeCompanies
    ? `/categories/${id}?include=companies`
    : `/categories/${id}`;
  return fetchApi<Category>(url);
}
