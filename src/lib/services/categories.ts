import { ApiResponse } from "./api";

import { fetchApi } from "./api";
import { Category } from "@/types";

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return fetchApi<Category[]>(`/categories`);
}

export async function getCategoryById(
  id: string
): Promise<ApiResponse<Category>> {
  return fetchApi<Category>(`/categories/${id}`);
}
