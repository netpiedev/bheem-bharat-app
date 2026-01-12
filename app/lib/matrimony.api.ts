import axiosInstance from "./axiosInstance";
import type {
  ConversationListItem,
  CreateMessageResponse,
  GetMessagesResponse,
  GetProfileResponse,
  GetProfilesResponse,
  GetWishlistResponse,
  MatrimonyProfileWithUser,
  Message,
  WishlistItem,
} from "@/app/types/matrimony.types";

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
  return data.data;
};

/**
 * Get current user's own profile
 */
export const getMyProfile = async (): Promise<MatrimonyProfileWithUser | null> => {
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
  dob: string; // YYYY-MM-DD format
  height?: number | null;
  religion?: string | null;
  caste?: string | null;
  region?: string | null;
  profession?: string | null;
  education?: string | null;
  income?: string | null;
  about_me?: string | null;
  state_from_user?: boolean;
  city?: string | null;
  mother_occupation?: string | null;
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
 * Get all conversations
 */
export const getConversations = async (): Promise<ConversationListItem[]> => {
  const { data } = await axiosInstance.get<ConversationListItem[]>(
    "/matrimony/chats"
  );
  return data;
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const { data } = await axiosInstance.get<GetMessagesResponse>(
    `/matrimony/chats/${conversationId}/messages`
  );
  return data.data;
};

/**
 * Send a message
 */
export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<Message> => {
  const { data } = await axiosInstance.post<CreateMessageResponse>(
    `/matrimony/chats/${conversationId}/messages`,
    { message }
  );
  return data.data;
};

