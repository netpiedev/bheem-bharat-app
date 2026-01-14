import axiosInstance from "./axiosInstance";

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  notification_token?: string;
  dob?: string; // Format: YYYY-MM-DD
  gender?: string;
  city?: string;
  state?: string;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    reported: number;
    city: string | null;
    state: string | null;
    dob: Date | null;
    gender: string | null;
    notification_token: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

/**
 * Update the authenticated user's profile information.
 * Endpoint: PUT /api/users/profile
 */
export const updateUserProfile = async (
  payload: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> => {
  const { data } = await axiosInstance.put<UpdateUserProfileResponse>(
    "/users/profile",
    payload
  );
  return data;
};

/**
 * Get user profile (unchanged, included for completeness).
 */
export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    is_on_boarded: boolean;
    status: string;
    reported: number;
    city: string | null;
    state: string | null;
    dob: Date | null;
    gender: string | null;
    notification_token: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

export const getUserProfile = async (): Promise<GetUserProfileResponse> => {
  const { data } = await axiosInstance.get<GetUserProfileResponse>(
    "/users/profile"
  );
  return data;
};

/**
 * Google Authentication Response (unchanged, included for completeness).
 */
export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    reported: number;
    city: string | null;
    state: string | null;
    is_on_boarded: boolean;
    dob: Date | null;
    gender: string | null;
    notification_token: string | null;
    created_at: Date;
    updated_at: Date;
  };
  token: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  accessToken?: string;
}

/**
 * Authenticate with Google OAuth (unchanged).
 */
export const authenticateWithGoogle = async (
  payload: GoogleAuthRequest
): Promise<GoogleAuthResponse> => {
  console.log("🔵 [auth.api] authenticateWithGoogle called");
  const { data } = await axiosInstance.post<GoogleAuthResponse>(
    "/auth/google",
    payload
  );
  console.log("🟢 [auth.api] authenticateWithGoogle success");
  return data;
};

export const deleteUserProfile = async (): Promise<DeleteUserProfileResponse> => {
  const { data } = await axiosInstance.delete<DeleteUserProfileResponse>(
    "/users/profile"
  );
  console.log("🟢 [auth.api] deleteUserProfile success");
  return data;
};

export interface DeleteUserProfileResponse {
  success: boolean;
  message: string;
}