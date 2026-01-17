import type {
  GetProfileResponse,
  GetProfilesResponse,
  GetWishlistResponse,
  MatrimonyProfileWithUser,
  WishlistItem,
} from "@/app/types/matrimony.types";
import axiosInstance from "./axiosInstance";

/**
 * Get all profiles with filters and pagination
 */
export const getProfiles = async (params?: {
  gender?: string;
  state?: string;
  city?: string;
  page?: number;
  limit?: number;
}): Promise<GetProfilesResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.gender) queryParams.append("gender", params.gender);
  if (params?.state) queryParams.append("state", params.state);
  if (params?.city) queryParams.append("city", params.city);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/matrimony/profiles${queryString ? `?${queryString}` : ""}`;

  const { data } = await axiosInstance.get<GetProfilesResponse>(url);
  return data;
};

/**
 * Get profile by ID
 */
export const getProfileById = async (
  profileId: string
): Promise<MatrimonyProfileWithUser> => {
  const { data } = await axiosInstance.get<GetProfileResponse>(
    `/matrimony/profiles/${profileId}`
  );
  console.log("indivisual profile data is ", JSON.stringify(data));

  return data.data;
};

/**
 * Get current user's own profile
 */
export const getMyProfile =
  async (): Promise<MatrimonyProfileWithUser | null> => {
    try {
      const { data } = await axiosInstance.get<GetProfileResponse>(
        "/matrimony/profiles/me"
      );
      return data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

/**
 * Create a new matrimony profile
 */
export interface CreateProfileRequest {
  gender: "MALE" | "FEMALE" | "OTHER";
  dob?: string | null; // YYYY-MM-DD format - optional, comes from user table
  height?: number | null;
  religion?: string | null;
  caste?: string | null;
  region?: string | null;
  profession?: string | null;
  education?: string | null;
  income?: string | null;
  about_me_text?: string | null;
  state_from_user?: boolean;
  city?: string | null;
  state?: string | null;
  village?: string | null;
  mother_occupation?: string | null;
  father_occupation?: string | null;
  siblings_count?: number | null;
  expected_details?: Record<string, unknown> | null;
}

export interface CreateProfileResponse {
  status: string;
  message: string;
  data: MatrimonyProfileWithUser;
}

export const createProfile = async (
  payload: CreateProfileRequest
): Promise<MatrimonyProfileWithUser> => {
  const { data } = await axiosInstance.post<CreateProfileResponse>(
    "/matrimony/profiles",
    payload
  );
  return data.data;
};

/**
 * Add profile to wishlist
 */
export const addToWishlist = async (profileId: string): Promise<void> => {
  await axiosInstance.post(`/matrimony/wishlist/${profileId}`);
};

/**
 * Remove profile from wishlist
 */
export const removeFromWishlist = async (profileId: string): Promise<void> => {
  await axiosInstance.delete(`/matrimony/wishlist/${profileId}`);
};

/**
 * Get user's wishlist
 */
export const getWishlist = async (): Promise<WishlistItem[]> => {
  const { data } = await axiosInstance.get<GetWishlistResponse>(
    "/matrimony/wishlist"
  );
  return data.data;
};

/**
 * Upload images for a matrimony profile
 */
export interface UploadImagesResponse {
  status: string;
  data: string[];
}

export const uploadProfileImages = async (
  profileId: string,
  imageUris: string[]
): Promise<string[]> => {
  const formData = new FormData();

  // Add each image to FormData
  imageUris.forEach((uri, index) => {
    const filename = uri.split("/").pop() || `image-${index}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("images", {
      uri,
      name: filename,
      type,
    } as any);
  });

  const { data } = await axiosInstance.patch<UploadImagesResponse>(
    `/matrimony/profiles/${profileId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.data;
};

/**
 * Update matrimony profile
 */
export interface UpdateProfileRequest {
  gender?: "MALE" | "FEMALE" | "OTHER";
  dob?: string; // YYYY-MM-DD format
  height?: number | null;
  religion?: string | null;
  caste?: string | null;
  region?: string | null;
  profession?: string | null;
  education?: string | null;
  income?: string | null;
  about_me_text?: string | null;
  city?: string | null;
  mother_occupation?: string | null;
  father_occupation?: string | null;
  state?: string | null;
  village?: string | null;
  siblings_count?: number | null;
  expected_details?: Record<string, unknown> | null;
}

export interface UpdateProfileResponse {
  status: string;
  message: string;
  data: MatrimonyProfileWithUser;
}

export const updateProfile = async (
  payload: UpdateProfileRequest
): Promise<MatrimonyProfileWithUser> => {
  const { data } = await axiosInstance.patch<UpdateProfileResponse>(
    "/matrimony/profiles/me",
    payload
  );
  return data.data;
};

// ================== CHAT TYPES ==================

export interface UserMini {
  id: string;
  name: string | null;
  photo: string | null;
}

export interface ConversationListItem {
  conversation_id: string;
  user: UserMini;
  last_message: string | null;
  last_message_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ================== API RESPONSES ==================

export interface GetMessagesResponse {
  status: "success";
  count: number;
  data: Message[];
}

export interface CreateMessageResponse {
  status: "success";
  data: Message;
}
