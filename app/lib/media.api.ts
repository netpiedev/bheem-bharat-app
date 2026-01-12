// app/api/media.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  Media,
  MediaDetail,
  MediaListItem,
} from "@/app/types/media.types";

/* Get all media */
/*
export const fetchMedia = async (
  fileType: string
): Promise<MediaListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<MediaListItem>>(
    `/resources/media?fileType=${encodeURIComponent(fileType)}`
  );
  return res.data.data;
};
*/

/* Get all media */
export const fetchMedia = async (): Promise<MediaListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<MediaListItem>>(
    "/resources/media"
  );
  return res.data.data;
};

/* Get media by id */
export const fetchMediaById = async (id: string): Promise<MediaDetail> => {
  const res = await axiosInstance.get<ApiSingleResponse<MediaDetail>>(
    `/resources/media/${id}`
  );
  return res.data.data;
};
