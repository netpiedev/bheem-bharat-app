import { Stack } from "expo-router";

export default function ResourcesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="organizations" options={{ title: "Organizations" }} />
      <Stack.Screen name="scholarships" options={{ title: "Scholarships" }} />
      <Stack.Screen name="hostels" options={{ title: "Hostels" }} />
      <Stack.Screen name="books" options={{ title: "Books" }} />
      <Stack.Screen name="media" options={{ title: "Media" }} />
      <Stack.Screen name="articles" options={{ title: "Articles" }} />
      <Stack.Screen name="legal" options={{ title: "Legal Info" }} />
    </Stack>
  );
}
