// app/api/hostels.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  Hostel,
  HostelListItem,
} from "@/app/types/hostels.types";

/* Get all hostels */
export const fetchHostels = async (
  state?: string
): Promise<HostelListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<HostelListItem>>(
    "/resources/hostels",
    {
      params: { state },
    }
  );
  return res.data.data;
};

/* Get hostel by id */
export const fetchHostelById = async (id: string): Promise<Hostel> => {
  const res = await axiosInstance.get<ApiSingleResponse<Hostel>>(
    `/resources/hostels/${id}`
  );
  return res.data.data;
};
