export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface MatrimonyProfile {
  id: string;
  user_id: string;
  gender: Gender;
  dob: string; // ISO date string
  height: number | null;
  religion: string | null;
  caste: string | null;
  region: string | null;
  profession: string | null;
  education: string | null;
  income: string | null;
  about_me: string | null; // Legacy field name, backend uses about_me_text
  about_me_text?: string | null; // Backend field name
  state_from_user?: boolean; // Legacy field, may not exist in newer profiles
  city: string | null;
  mother_occupation: string | null;
  father_occupation: string | null;
  state: string | null;
  village: string | null;
  siblings_count: number | null;
  expected_details: Record<string, unknown> | null;
  is_verified: boolean;
  created_at: string;
  images: string[];
}

export interface MatrimonyProfileWithUser extends MatrimonyProfile {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    photo?: string | null;
  };
}

export interface WishlistItem {
  id: string;
  user_id: string;
  profile_id: string;
  created_at: string;
  profile: MatrimonyProfileWithUser;
}

export interface ConversationListItem {
  conversation_id: string;
  user: {
    id: string;
    name: string | null;
    photo: string | null;
  };
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

export interface GetProfilesResponse {
  status: string;
  count: number;
  total: number;
  data: MatrimonyProfileWithUser[];
}

export interface GetProfileResponse {
  status: string;
  data: MatrimonyProfileWithUser;
}

export interface GetWishlistResponse {
  status: string;
  count: number;
  data: WishlistItem[];
}

export interface GetMessagesResponse {
  status: string;
  count: number;
  data: Message[];
}

export interface CreateMessageResponse {
  status: string;
  data: Message;
}
