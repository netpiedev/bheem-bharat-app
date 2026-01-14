import type {
  ConversationListItem,
  CreateMessageResponse,
  GetMessagesResponse,
  Message,
} from "@/app/types/chat.types";
import axiosInstance from "./axiosInstance";

export const getConversations = async (): Promise<ConversationListItem[]> => {
  const { data } = await axiosInstance.get("/api/chat/conversations");
  return data;
};

export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const { data } = await axiosInstance.get<GetMessagesResponse>(
    `/api/chat/conversations/${conversationId}/messages`
  );
  return data.data;
};

export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<Message> => {
  const { data } = await axiosInstance.post<CreateMessageResponse>(
    `/api/chat/conversations/${conversationId}/messages`,
    { message }
  );
  return data.data;
};
