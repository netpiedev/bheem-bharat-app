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

export interface GetMessagesResponse {
  status: string;
  count: number;
  data: Message[];
}

export interface CreateMessageResponse {
  status: string;
  data: Message;
}
