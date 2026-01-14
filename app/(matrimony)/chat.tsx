import { getMessages, sendMessage } from "@/app/lib/chat.api";
import { getUserIdFromToken } from "@/app/lib/jwt";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WhiteHeader } from "../components/WhiteHeader";
import { useSocket } from "../lib/socket";

export default function ChatScreen() {
  const { conversationId, otherUserId, otherUserName } = useLocalSearchParams<{
    conversationId?: string;
    otherUserId?: string;
    otherUserName?: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const {
    socket,
    isConnected,
    messages: socketMessages,
    joinConversation,
    leaveConversation,
    startConversation,
    addMessage,
  } = useSocket();

  /* ===================== USER ===================== */
  useEffect(() => {
    let mounted = true;
    const getUserId = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token && mounted) {
        setCurrentUserId(getUserIdFromToken(token));
      }
    };
    getUserId();
    return () => {
      mounted = false;
    };
  }, []);

  /* ===================== CONVERSATION ===================== */
  useEffect(() => {
    if (
      otherUserId &&
      !conversationId &&
      isConnected &&
      currentUserId &&
      socket
    ) {
      startConversation(otherUserId);
      const handler = (data: { conversationId: string }) => {
        router.setParams({ conversationId: data.conversationId });
      };
      socket.once("conversation_started", handler);
      return () => {
        socket.off("conversation_started", handler);
      };
    }
  }, [otherUserId, conversationId, isConnected, currentUserId, socket]);

  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected]);

  /* ===================== MESSAGES ===================== */
  const { data: apiMessages, isLoading } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  });

  const allMessages = (() => {
    if (!conversationId) return [];
    const map = new Map<string, any>();
    [
      ...(apiMessages || []),
      ...(socketMessages?.[conversationId] || []),
    ].forEach((m) => m?.id && map.set(m.id, m));
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  })();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [allMessages.length]);

  /* ===================== SEND ===================== */
  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(conversationId!, text),
    onSuccess: (msg) => {
      addMessage(conversationId!, msg);
      setMessageText("");
      Keyboard.dismiss();
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });

  const handleSend = useCallback(() => {
    if (!messageText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(messageText);
  }, [messageText]);

  /* ===================== UI ===================== */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 10}
      >
        <WhiteHeader title={otherUserName || "Chat"} />

        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ padding: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              {allMessages.map((m) => {
                const isOwn = m.sender_id === currentUserId;
                return (
                  <View
                    key={m.id}
                    style={{
                      alignSelf: isOwn ? "flex-end" : "flex-start",
                      marginBottom: 8,
                      maxWidth: "75%",
                      backgroundColor: isOwn ? "#3B82F6" : "#fff",
                      padding: 12,
                      borderRadius: 18,
                    }}
                  >
                    <Text style={{ color: isOwn ? "white" : "#111" }}>
                      {m.message}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* INPUT */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            padding: 12,
            backgroundColor: "white",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <TextInput
              ref={inputRef}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Message..."
              placeholderTextColor="#000000"
              multiline
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 8,
              }}
            />

            <Pressable
              onPress={handleSend}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: messageText ? "#3B82F6" : "#9CA3AF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-up" size={22} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
