import axiosInstance from "./axiosInstance";
import type {
  ConversationListItem,
  CreateMessageResponse,
  GetMessagesResponse,
  Message,
} from "@/app/types/matrimony.types";

/**
 * Get all conversations
 */
export const getConversations = async (): Promise<ConversationListItem[]> => {
  const { data } = await axiosInstance.get<ConversationListItem[]>(
    "/chat/conversations"
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
    `/chat/conversations/${conversationId}/messages`
  );
  return data.data;
};

/**
 * Send a message (via HTTP, received via socket)
 */
export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<Message> => {
  const { data } = await axiosInstance.post<CreateMessageResponse>(
    `/chat/conversations/${conversationId}/messages`,
    { message }
  );
  return data.data;
};

