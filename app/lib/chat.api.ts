import type {
  ConversationListItem,
  CreateMessageResponse,
  GetMessagesResponse,
  Message,
} from "@/app/types/chat.types";
import axiosInstance from "./axiosInstance";

export const getConversations = async (): Promise<ConversationListItem[]> => {
  const { data } = await axiosInstance.get("/chat/conversations");
  return data;
};

export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const { data } = await axiosInstance.get<GetMessagesResponse>(
    `/chat/conversations/${conversationId}/messages`
  );
  return data.data;
};

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

export const getOrCreateConversation = async (
  otherUserId: string
): Promise<string> => {
  const { data } = await axiosInstance.post<{ status: string; data: { conversation_id: string } }>(
    "/chat/conversations/get-or-create",
    { otherUserId }
  );
  return data.data.conversation_id;
};
