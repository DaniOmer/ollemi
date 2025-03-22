import { fetchApi, ApiResponse } from "./api";

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

// Get all categories
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return fetchApi<Category[]>("/categories");
}

// Get single category by ID
export async function getCategory(id: string): Promise<ApiResponse<Category>> {
  return fetchApi<Category>(`/categories/${id}`);
}
