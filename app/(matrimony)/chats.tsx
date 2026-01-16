import { getConversations } from "@/app/lib/chat.api";
import type { ConversationListItem } from "@/app/types/chat.types";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
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

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getGradientColors = (name?: string | null): readonly [string, string] => {
    const gradients = [
      ["#6366F1", "#8B5CF6"],
      ["#EC4899", "#F43F5E"],
      ["#14B8A6", "#06B6D4"],
      ["#F59E0B", "#EF4444"],
      ["#10B981", "#059669"],
      ["#8B5CF6", "#EC4899"],
      ["#06B6D4", "#3B82F6"],
    ] as const;
    const index = (name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Chats" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading conversations...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Chats" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-red-50 rounded-full p-4 mb-4">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>
          <Text className="text-gray-900 font-semibold text-lg mb-2">
            Failed to Load Chats
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Unable to fetch your conversations. Please try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-blue-600 px-8 py-3.5 rounded-xl shadow-sm active:scale-95"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-semibold text-base">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <WhiteHeader title="Chats" />

      {/* Connection Status */}
      {!isConnected && (
        <View className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
            <Text className="text-amber-800 text-xs font-medium">
              Connecting...
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.conversation_id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => {
          const gradientColors = getGradientColors(item.user?.name);
          const hasUnread = false; // Add your unread logic here

          return (
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
              className="mx-3 mb-2 bg-white rounded-2xl active:scale-98"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="px-4 py-4 flex-row items-center">
                {/* Avatar with Gradient */}
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text className="text-white font-bold text-lg">
                    {getInitials(item.user?.name)}
                  </Text>
                </LinearGradient>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text
                      className="font-semibold text-gray-900 text-base"
                      numberOfLines={1}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      {item.user?.name ?? "Anonymous"}
                    </Text>
                    <Text className="text-xs text-gray-400 font-medium">
                      {formatTime(item.last_message_at)}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text
                      className={`flex-1 text-sm ${
                        hasUnread
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                      numberOfLines={1}
                    >
                      {item.last_message ?? "Start a conversation"}
                    </Text>
                    {hasUnread && (
                      <View className="ml-2 bg-blue-600 rounded-full w-5 h-5 items-center justify-center">
                        <Text className="text-white text-xs font-bold">3</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Chevron */}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#CBD5E1"
                  style={{ marginLeft: 8 }}
                />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-32 px-8">
            <LinearGradient
              colors={["#DBEAFE", "#E0E7FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="chatbubbles-outline" size={56} color="#3B82F6" />
            </LinearGradient>
            <Text className="text-gray-900 font-semibold text-xl mb-2">
              No Conversations Yet
            </Text>
            <Text className="text-gray-500 text-center text-sm leading-5">
              Start connecting with people and your conversations will appear
              here
            </Text>
          </View>
        }
      />
    </View>
  );
}
