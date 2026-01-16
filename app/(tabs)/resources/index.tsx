import { useLanguage } from "@/app/lib/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResourcesIndex() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  return (
    <View key={lang} className="flex-1 bg-[#F9FAFB]">
      {/* Blue Header */}
      <LinearGradient
        colors={["#0B5ED7", "#0A58CA"]}
        className="pb-6 rounded-b-3xl"
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-4">
            <Text className="text-white text-xl font-semibold mb-4">
              {t("resources_title")}
            </Text>

            {/* Search */}
            <View className="bg-white rounded-xl flex-row items-center px-4 py-3 shadow-sm">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder={t("resources_search_placeholder")}
                placeholderTextColor="#9CA3AF"
                className="ml-3 flex-1 text-gray-800"
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Organizations */}
        <Pressable
          onPress={() => router.push("/resources/organizations")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="business" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_organizations")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_organizations_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>

        {/* Scholarships */}
        <Pressable
          onPress={() => router.push("/resources/scholarships")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="school" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_scholarships")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_scholarships_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>

        {/* Hostels */}
        <Pressable
          onPress={() => router.push("/resources/hostels")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="home" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_hostels")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_hostels_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>

        {/* Books */}
        <Pressable
          onPress={() => router.push("/resources/books")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="library" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_books")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_books_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>

        {/* Media */}
        <Pressable
          onPress={() => router.push("/resources/media")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="videocam" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_media")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_media_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>

        {/* Articles */}
        <Pressable
          onPress={() => router.push("/resources/articles")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="document-text" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_articles")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_articles_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>

        {/* Legal */}
        <Pressable
          onPress={() => router.push("/resources/legal")}
          className="mb-4 rounded-3xl border border-[#BFDBFE] bg-[#EFF6FF] p-6 flex-row items-center shadow-sm"
        >
          <View className="w-16 h-16 rounded-2xl bg-[#DBEAFE] items-center justify-center mr-4">
            <Ionicons name="scale" size={32} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1E3A8A]">
              {t("resources_legal")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t("resources_legal_desc")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </Pressable>
      </ScrollView>
    </View>
  );
}
