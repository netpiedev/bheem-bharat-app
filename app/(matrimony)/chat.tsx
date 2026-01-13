import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getMessages, sendMessage } from "@/app/lib/chat.api";
import { getUserIdFromToken } from "@/app/lib/jwt";
import { WhiteHeader } from "../components/WhiteHeader";
import { useSocket } from "../lib/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChatScreen() {
  const { conversationId, otherUserId, otherUserName } = useLocalSearchParams<{
    conversationId?: string;
    otherUserId?: string;
    otherUserName?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const {
    socket,
    isConnected,
    messages: socketMessages,
    joinConversation,
    leaveConversation,
    // sendMessage: sendSocketMessage, // unused
    startConversation,
    addMessage,
  } = useSocket();

  // Get current user ID
  useEffect(() => {
    let mounted = true;
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const userId = getUserIdFromToken(token);
          if (mounted) setCurrentUserId(userId);
        }
      } catch (e) {
        // ignore or show error if needed
      }
    };
    getUserId();
    return () => {
      mounted = false;
    };
  }, []);

  // If we have otherUserId but no conversationId, start a conversation
  useEffect(() => {
    if (otherUserId && !conversationId && isConnected && currentUserId && startConversation && socket && router) {
      // startConversation could trigger socket event in handler, but we need handlers in deps to appease lint
      startConversation(otherUserId);
      const handler = (data: { conversationId: string }) => {
        router.setParams({ conversationId: data.conversationId });
      };
      socket.once("conversation_started", handler);
      return () => {
        socket.off("conversation_started", handler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    otherUserId,
    conversationId,
    isConnected,
    currentUserId,
    startConversation,
    socket,
    router,
  ]);

  // Join conversation room when conversationId is available
  useEffect(() => {
    if (conversationId && isConnected && joinConversation && leaveConversation) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Fetch messages from API
  const { data: apiMessages, isLoading } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 15000, // Slightly reduce refetches for performance
  });

  // Combine API messages with socket messages (deduplicate)
  const allMessages = (() => {
    if (!conversationId) return [];
    const api = apiMessages || [];
    const socketMsgs = socketMessages?.[conversationId] || [];
    // Make a map for deduplication (prefer socket message if id matches)
    const messageMap = new Map<string, any>();
    for (const msg of api) {
      if (msg && msg.id) {
        messageMap.set(msg.id, msg);
      }
    }
    for (const msg of socketMsgs) {
      if (msg && msg.id) {
        messageMap.set(msg.id, msg);
      }
    }
    // Sort by created_at
    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  })();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (allMessages.length > 0) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [allMessages.length]);

  const sendMutation = useMutation({
    mutationFn: (message: string) => {
      if (!conversationId) throw new Error("No conversationId");
      return sendMessage(conversationId, message);
    },
    onSuccess: (newMessage) => {
      if (conversationId && newMessage) {
        addMessage(conversationId, newMessage);
      }
      setMessageText("");
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      // Optionally show error to user
    },
  });

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !conversationId || sendMutation.isPending) return;
    sendMutation.mutate(messageText);
  }, [messageText, conversationId, sendMutation]);

  if (isLoading && !conversationId) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title={otherUserName || "Chat"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <WhiteHeader title={otherUserName || "Chat"} />

      {!isConnected && (
        <View className="bg-yellow-100 px-4 py-2 border-b border-yellow-200">
          <Text className="text-yellow-800 text-xs text-center">
            Connection lost. Messages may be delayed.
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }}
        keyboardShouldPersistTaps="handled"
      >
        {allMessages.length > 0 ? (
          allMessages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <View
                key={message.id}
                className={`mb-3 ${isOwn ? "items-end" : "items-start"}`}
              >
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isOwn ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {message.message}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              No messages yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Start the conversation!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="border-t border-gray-200 bg-white p-4">
        <View className="flex-row items-center">
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3"
            multiline
            maxLength={5000}
            blurOnSubmit={false}
            onSubmitEditing={() => {
              // Don't send on hard return in multiline, unless platform triggers this only on enter (iOS).
              if (Platform.OS === "ios") handleSend();
            }}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              messageText.trim() ? "bg-blue-600" : "bg-gray-300"
            }`}
            accessibilityLabel="Send Message"
            accessibilityRole="button"
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={messageText.trim() ? "white" : "#9CA3AF"}
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

