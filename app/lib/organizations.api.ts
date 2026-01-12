// app/api/organizations.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  Organization,
  OrganizationListItem,
} from "@/app/types/organizations.types";

/* Get all organizations */
export const fetchOrganizations = async (
  state?: string
): Promise<OrganizationListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<OrganizationListItem>>(
    "/resources/organizations",
    {
      params: { state },
    }
  );
  return res.data.data;
};

/* Get organization by id */
export const fetchOrganizationById = async (
  id: string
): Promise<Organization> => {
  const res = await axiosInstance.get<ApiSingleResponse<Organization>>(
    `/resources/organizations/${id}`
  );
  return res.data.data;
};
