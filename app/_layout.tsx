import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LanguageProvider } from "./lib/LanguageContext";
import { queryClient } from "./lib/queryClient";
import setupQueryPersistence from "./lib/queryPersist";

import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    setupQueryPersistence(); // optional persistence

    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: true,
    });
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
