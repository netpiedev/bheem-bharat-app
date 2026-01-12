import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="booksByCategoryPage"
        options={{ title: "Books by Category" }}
      />
      <Stack.Screen
        name="detailedBookPage"
        options={{ title: "Book Details" }}
      />
      <Stack.Screen name="PdfReaderPage" options={{ title: "PDF Reader" }} />
    </Stack>
  );
}
