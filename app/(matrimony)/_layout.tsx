import { Stack } from "expo-router";

export default function MatrimonyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="browse" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}

