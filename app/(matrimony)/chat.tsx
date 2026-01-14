import { getMessages, sendMessage } from "@/app/lib/chat.api";
import { getUserIdFromToken } from "@/app/lib/jwt";
import type { Message } from "@/app/types/chat.types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { WhiteHeader } from "../components/WhiteHeader";
import { useSocket } from "../lib/socket";

export default function ChatScreen() {
  const { conversationId, otherUserName } = useLocalSearchParams<{
    conversationId?: string;
    otherUserName?: string;
  }>();

  const scrollRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const {
    messages: socketMessages,
    addMessage,
    joinConversation,
    leaveConversation,
  } = useSocket();

  // current user
  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      if (t) setUserId(getUserIdFromToken(t));
    });
  }, []);

  // join socket room
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      return () => leaveConversation(conversationId);
    }
  }, [conversationId]);

  const { data: apiMessages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  });

  const allMessages = (() => {
    const socket = socketMessages?.[conversationId!] ?? [];
    const map = new Map<string, Message>();
    [...apiMessages, ...socket].forEach((m) => map.set(m.id, m));
    return [...map.values()].sort(
      (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
    );
  })();

  const sendMutation = useMutation({
    mutationFn: (msg: string) => sendMessage(conversationId!, msg),
    onSuccess: (msg) => {
      addMessage(conversationId!, msg);
      setText("");
      queryClient.invalidateQueries({
        queryKey: ["matrimony-conversations"],
      });
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title={otherUserName ?? "Chat"} />
        <ActivityIndicator className="mt-10" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WhiteHeader title={otherUserName ?? "Chat"} />

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {allMessages.map((m) => {
          const isMe = m.sender_id === userId;
          return (
            <View key={m.id} className={`mb-3 ${isMe ? "items-end" : ""}`}>
              <View
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  isMe ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Text className={isMe ? "text-white" : "text-gray-900"}>
                  {m.message}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="p-4 border-t border-gray-200 flex-row items-center">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3"
        />
        <Pressable
          onPress={() => sendMutation.mutate(text)}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={22} color="#2563EB" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
