import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "./lib/LanguageContext";
import { queryClient } from "./lib/queryClient";
import setupQueryPersistence from "./lib/queryPersist";

import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    setupQueryPersistence(); // optional persistence
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
