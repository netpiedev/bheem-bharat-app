// // app/api/media.api.ts
// import axiosInstance from "./axiosInstance";

// import type {
//   ApiListResponse,
//   ApiSingleResponse,
//   MediaDetail,
//   MediaListItem
// } from "@/app/types/media.types";

// /* Get all media */
// export const fetchMedia = async ({
//   pageParam = 1
// }: {
//   pageParam?: number
// }): Promise<ApiListResponse<MediaListItem>> => {
//   const res = await axiosInstance.get<ApiListResponse<MediaListItem>>(
//     "/resources/media",
//     {
//       params: {
//         page: pageParam,
//         limit: 10,
//       },
//     }
//   );
//   return res.data;
// };

// /* Get media by id */
// export const fetchMediaById = async (id: string): Promise<MediaDetail> => {
//   const res = await axiosInstance.get<ApiSingleResponse<MediaDetail>>(
//     `/resources/media/${id}`
//   );
//   return res.data.data;
// };

// app/api/media.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  MediaDetail,
  MediaListItem,
} from "@/app/types/media.types";

/* Get all media */
export const fetchMedia = async ({
  pageParam = 1,
  fileType,
}: {
  pageParam?: number;
  fileType?: string;
}): Promise<ApiListResponse<MediaListItem>> => {
  const params: Record<string, any> = {
    page: pageParam,
    limit: 10,
  };

  // Only add file_type param if it's specified
  if (fileType) {
    params.file_type = fileType;
  }

  const res = await axiosInstance.get<ApiListResponse<MediaListItem>>(
    "/resources/media",
    { params }
  );
  return res.data;
};

/* Get media by id */
export const fetchMediaById = async (id: string): Promise<MediaDetail> => {
  const res = await axiosInstance.get<ApiSingleResponse<MediaDetail>>(
    `/resources/media/${id}`
  );
  return res.data.data;
};
