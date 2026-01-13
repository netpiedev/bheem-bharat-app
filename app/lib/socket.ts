import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";
import type { Message } from "@/app/types/matrimony.types";

let socketInstance: Socket | null = null;

/**
 * Get Socket.IO base URL
 */
const getSocketURL = (): string => {
  let baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  
  // Remove /api suffix if present
  baseURL = baseURL.replace(/\/api$/, "");
  
  // Auto-fix localhost for Android Emulator
  if (baseURL.includes("localhost") && Platform.OS === "android") {
    baseURL = baseURL.replace("localhost", "10.0.2.2");
  }
  
  return baseURL;
};

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = async (): Promise<Socket | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.log("🔴 [socket] No token found, cannot connect");
      return null;
    }

    if (socketInstance?.connected) {
      console.log("🟢 [socket] Already connected");
      return socketInstance;
    }

    const url = getSocketURL();
    console.log("🔵 [socket] Connecting to:", url);

    socketInstance = io(url, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 [socket] Connected:", socketInstance?.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🟡 [socket] Disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 [socket] Connection error:", error.message);
    });

    return socketInstance;
  } catch (error) {
    console.error("🔴 [socket] Initialization error:", error);
    return null;
  }
};

/**
 * Get Socket.IO instance
 */
export const getSocket = (): Socket | null => {
  return socketInstance;
};

/**
 * Disconnect Socket.IO
 */
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log("🔴 [socket] Disconnected");
  }
};

/**
 * Hook for using Socket.IO in components
 */
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      const socketInstance = await initializeSocket();
      if (!socketInstance || !mounted) return;

      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);

      socketInstance.on("connect", () => {
        if (mounted) setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        if (mounted) setIsConnected(false);
      });

      // Listen for new messages
      socketInstance.on("new_message", (message: Message) => {
        if (mounted) {
          setMessages((prev) => {
            const conversationId = message.conversation_id;
            const existing = prev[conversationId] || [];
            // Check if message already exists
            if (existing.some((m) => m.id === message.id)) {
              return prev;
            }
            return {
              ...prev,
              [conversationId]: [...existing, message],
            };
          });
        }
      });

      // Listen for errors
      socketInstance.on("error", (error: { message: string }) => {
        console.error("🔴 [socket] Error:", error.message);
      });
    };

    setupSocket();

    return () => {
      mounted = false;
    };
  }, []);

  const joinConversation = (conversationId: string, retryCount = 0) => {
    if (!socket || !isConnected) {
      console.warn("🔴 [socket] Cannot join conversation: socket not connected");
      return;
    }

    const maxRetries = 3;
    
    const handleJoined = () => {
      socket.off("joined_conversation", handleJoined);
      socket.off("error", handleError);
      console.log("🟢 [socket] Successfully joined conversation:", conversationId);
    };

    const handleError = (error: { message: string }) => {
      socket.off("joined_conversation", handleJoined);
      socket.off("error", handleError);
      
      if (error.message.includes("Access denied") && retryCount < maxRetries) {
        const delay = 200 * (retryCount + 1); // Exponential backoff: 200ms, 400ms, 600ms
        console.log(`🟡 [socket] Access denied, retrying join in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          joinConversation(conversationId, retryCount + 1);
        }, delay);
      } else {
        console.error("🔴 [socket] Failed to join conversation:", error.message);
      }
    };

    socket.once("joined_conversation", handleJoined);
    socket.once("error", handleError);
    socket.emit("join_conversation", { conversationId: conversationId });
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("leave_conversation", { conversationId });
    }
  };

  const sendMessage = (conversationId: string, message: string) => {
    if (socket && isConnected) {
      socket.emit("send_message", { conversationId, message });
    }
  };

  const startConversation = (otherUserId: string) => {
    if (socket && isConnected) {
      socket.emit("start_conversation", { otherUserId });
    }
  };

  const addMessage = (conversationId: string, message: Message) => {
    setMessages((prev) => {
      const existing = prev[conversationId] || [];
      if (existing.some((m) => m.id === message.id)) {
        return prev;
      }
      return {
        ...prev,
        [conversationId]: [...existing, message],
      };
    });
  };

  return {
    socket,
    isConnected,
    messages,
    joinConversation,
    leaveConversation,
    sendMessage,
    startConversation,
    addMessage,
  };
};

