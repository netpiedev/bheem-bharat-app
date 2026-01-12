import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import i18n from "./i18n";

export default function Index() {
  const [loading, setLoading] = useState<boolean>(true);
  // const [hasOnboarded, setHasOnboarded] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedLang = await AsyncStorage.getItem("LANG");
        // const onboarded = await AsyncStorage.getItem("hasOnboarded");
        const userToken = await AsyncStorage.getItem("token");

        if (storedLang) {
          i18n.locale = storedLang;
        }

        setLang(storedLang);
        // setHasOnboarded(onboarded);
        setToken(userToken);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 1️⃣ Language not selected
  if (!lang) {
    return <Redirect href="/language" />;
  }

  // 2️⃣ Not onboarded
  // if (!hasOnboarded) {
  //   return <Redirect href="/onboarding" />;
  // }

  // 3️⃣ Logged in
  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }

  // 4️⃣ Not logged in
  return <Redirect href="/(auth)/login" />;
}
