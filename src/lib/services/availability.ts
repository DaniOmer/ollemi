import { ApiResponse, fetchPrivateApi } from "./api";
import { BusinessHours } from "@/types";

export async function getBusinessHours(
  companyId: string
): Promise<ApiResponse<BusinessHours[]>> {
  return fetchPrivateApi<BusinessHours[]>(
    `/companies/${companyId}/availability`
  );
}

export async function updateBusinessHours(
  companyId: string,
  businessHours: BusinessHours[]
): Promise<ApiResponse<BusinessHours[]>> {
  return fetchPrivateApi<BusinessHours[]>(
    `/companies/${companyId}/availability`,
    {
      method: "PUT",
      data: {
        companyId,
        businessHours,
      },
    }
  );
}
