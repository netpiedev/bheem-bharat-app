import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="detailedMediaScreen"
        options={{ title: "Media Details" }}
      />
    </Stack>
  );
}
