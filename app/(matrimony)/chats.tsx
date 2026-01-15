import { getConversations } from "@/app/lib/chat.api";
import type { ConversationListItem } from "@/app/types/chat.types";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { WhiteHeader } from "../components/WhiteHeader";
import { useSocket } from "../lib/socket";

export default function ChatsScreen() {
  const router = useRouter();
  const { isConnected } = useSocket();

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ConversationListItem[]>({
    queryKey: ["matrimony-conversations"],
    queryFn: getConversations,
  });

  useEffect(() => {
    if (isConnected) refetch();
  }, [isConnected]);

  const formatTime = (date?: string | null) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    return `${d}d`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Chats" />
        <ActivityIndicator className="mt-10" size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 mb-3">Failed to load chats</Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title="Chats" />

      <FlatList
        data={data}
        keyExtractor={(item) => item.conversation_id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(matrimony)/chat",
                params: {
                  conversationId: item.conversation_id,
                  otherUserName: item.user?.name ?? "User",
                },
              })
            }
            className="px-4 py-3 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={22} color="#2563EB" />
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-gray-900">
                    {item.user?.name ?? "Anonymous"}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatTime(item.last_message_at)}
                  </Text>
                </View>

                <Text className="text-sm text-gray-500" numberOfLines={1}>
                  {item.last_message ?? "No messages yet"}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center mt-24">
            <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
            <Text className="text-gray-500 mt-4">No chats yet</Text>
          </View>
        }
      />
    </View>
  );
}
