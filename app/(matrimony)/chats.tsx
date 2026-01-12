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
import { getConversations } from "@/app/lib/matrimony.api";
import { WhiteHeader } from "../components/WhiteHeader";
import type { ConversationListItem } from "@/app/types/matrimony.types";
import { useSocket } from "../lib/socket";

export default function ChatsScreen() {
  const router = useRouter();
  const { isConnected } = useSocket();

  const { data: conversations, isLoading, isError, refetch } = useQuery({
    queryKey: ["matrimony-conversations"],
    queryFn: getConversations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    // Refetch when socket connects
    if (isConnected) {
      refetch();
    }
  }, [isConnected, refetch]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }: { item: ConversationListItem }) => {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(matrimony)/chat" as any,
            params: {
              conversationId: item.conversation_id,
              otherUserName: item.user.name || "User",
            },
          })
        }
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      >
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-4">
            <Ionicons name="person" size={28} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-lg font-semibold text-gray-900">
                {item.user.name || "Anonymous"}
              </Text>
              {item.last_message_at && (
                <Text className="text-xs text-gray-500">
                  {formatTime(item.last_message_at)}
                </Text>
              )}
            </View>
            <Text
              className="text-sm text-gray-600"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.last_message || "No messages yet"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#9CA3AF"
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Chats" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Chats" />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500 text-center mb-4">
            Failed to load conversations
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <WhiteHeader title="Chats" />
      <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-sm text-gray-600">
          {conversations?.length || 0} conversations
        </Text>
        {!isConnected && (
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-xs text-red-500">Disconnected</Text>
          </View>
        )}
      </View>
      <FlatList
        data={conversations || []}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversation_id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              No conversations yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Start a conversation from a profile
            </Text>
          </View>
        }
      />
    </View>
  );
}

