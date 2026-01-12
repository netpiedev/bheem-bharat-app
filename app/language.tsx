import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Pressable, Text, View, SafeAreaView } from "react-native";
import i18n from "./i18n";

type Lang = "en" | "hi" | "mr";

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Lang | null>(null);

  // Load current language on mount to show "selected" state
  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("LANG");
      if (savedLang) setSelected(savedLang as Lang);
    })();
  }, []);

  const selectLanguage = async (lang: Lang) => {
    setSelected(lang);
    await AsyncStorage.setItem("LANG", lang);
    i18n.locale = lang;

    // Small delay so user sees the selection highlight before navigating
    setTimeout(() => {
      router.replace("/");
    }, 200);
  };

  const LanguageButton = ({
    label,
    subLabel,
    code,
    emoji,
  }: {
    label: string;
    subLabel: string;
    code: Lang;
    emoji: string;
  }) => (
    <Pressable
      onPress={() => selectLanguage(code)}
      className={`flex-row items-center p-5 rounded-2xl border mb-4 transition-all ${
        selected === code
          ? "border-blue-500 bg-blue-50"
          : "border-gray-100 bg-gray-50"
      }`}
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      }}
    >
      <Text className="text-3xl mr-4">{emoji}</Text>
      <View className="flex-1">
        <Text
          className={`text-lg font-bold ${
            selected === code ? "text-blue-600" : "text-gray-800"
          }`}
        >
          {label}
        </Text>
        <Text className="text-gray-500 text-sm">{subLabel}</Text>
      </View>
      {selected === code && (
        <View className="bg-blue-500 h-6 w-6 rounded-full items-center justify-center">
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-center">
        {/* Header Section */}
        <View className="items-center mb-10">
          <View className="bg-blue-100 p-4 rounded-full mb-4">
            <Text className="text-4xl">🌐</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Language
          </Text>
          <Text className="text-gray-500 text-center text-base">
            Please select your preferred language to continue
          </Text>
        </View>

        {/* Buttons Section */}
        <View>
          <LanguageButton
            label="English"
            subLabel="Default language"
            code="en"
            emoji="🇺🇸"
          />
          <LanguageButton label="हिंदी" subLabel="Hindi" code="hi" emoji="🇮🇳" />
          <LanguageButton
            label="मराठी"
            subLabel="Marathi"
            code="mr"
            emoji="🇮🇳"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
