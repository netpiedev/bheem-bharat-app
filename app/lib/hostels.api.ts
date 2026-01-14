// app/api/hostels.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  Hostel,
  HostelListItem,
} from "@/app/types/hostels.types";

/* Get all hostels */
export const fetchHostels = async ({
  pageParam = 1,
  state,
  city,
}: {
  pageParam?: number;
  state?: string | null;
  city?: string | null;
}): Promise<ApiListResponse<HostelListItem>> => {
  const res = await axiosInstance.get<ApiListResponse<HostelListItem>>(
    "/resources/hostels",
    {
      params: {
        page: pageParam,
        limit: 10,
        state: state || undefined,
        city: city || undefined
      },
    }
  );
  return res.data;
};

/* Get hostel by id */
export const fetchHostelById = async (id: string): Promise<Hostel> => {
  const res = await axiosInstance.get<ApiSingleResponse<Hostel>>(
    `/resources/hostels/${id}`
  );
  return res.data.data;
};
