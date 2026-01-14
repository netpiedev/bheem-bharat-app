// app/api/organizations.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  Organization,
  OrganizationListItem,
} from "@/app/types/organizations.types";

/* Get all organizations */
export const fetchOrganizations = async ({
  pageParam = 1,
  state,
}: {
  pageParam?: number;
  state?: string;
}): Promise<ApiListResponse<OrganizationListItem>> => {
  const res = await axiosInstance.get<ApiListResponse<OrganizationListItem>>(
    "/resources/organizations",
    {
      params: {
        page: pageParam,
        limit: 10,
        state,
      },
    }
  );
  return res.data;
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
