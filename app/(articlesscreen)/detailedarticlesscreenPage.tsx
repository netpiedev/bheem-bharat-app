import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { fetchArticleById } from "@/app/lib/articles.api";
import { WhiteHeader } from "../components/WhiteHeader";

export default function DetailedArticlesScreenPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  /* 🔹 Fetch article */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id,
  });

  /* 🔹 Share Function */
  const handleShare = async () => {
    try {
      if (!data) return;
      await Share.share({
        message: `${data.title}\n\nRead more here: ${data.official_url || ""}`,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  /* 🔹 Calculate Read Time (approx 200 words per minute) */
  const getReadTime = (content: string) => {
    const words = content.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  /* 🔹 Skeleton Loading State */
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Article" />
        <View className="p-5">
          <View className="h-6 w-20 bg-gray-200 rounded mb-4" />
          <View className="h-8 w-3/4 bg-gray-200 rounded mb-2" />
          <View className="h-8 w-1/2 bg-gray-200 rounded mb-6" />
          <View className="h-4 w-full bg-gray-200 rounded mb-2" />
          <View className="h-4 w-full bg-gray-200 rounded mb-2" />
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 font-medium">Article unavailable.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ---------- HEADER ---------- */}
      <WhiteHeader title="Reading Mode" />

      {/* ---------- CONTENT ---------- */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* CATEGORY BADGE */}
        <View className="items-start mt-6">
          <View className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <Text className="text-[#0B5ED7] text-xs font-bold tracking-wide uppercase">
              {data.category}
            </Text>
          </View>
        </View>

        {/* TITLE */}
        <Text className="text-2xl font-extrabold text-gray-900 mt-4 leading-tight">
          {data.title}
        </Text>

        {/* METADATA ROW */}
        <View className="flex-row items-center mt-4 mb-6">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1 mr-4">
            {new Date(data.published_date).toDateString()}
          </Text>

          <View className="w-1 h-1 bg-gray-300 rounded-full mr-4" />

          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">
            {getReadTime(data.content)}
          </Text>
        </View>

        {/* DIVIDER */}
        <View className="h-[1px] bg-gray-100 w-full mb-6" />

        {/* BODY CONTENT */}
        <Text className="text-[17px] text-gray-800 leading-8 font-normal">
          {data.content}
        </Text>

        {/* DIVIDER */}
        <View className="h-[1px] bg-gray-100 w-full mt-8 mb-8" />

        {/* ACTION BUTTONS */}
        <View className="flex-row gap-3 mb-10">
          {/* Share Button */}
          <Pressable
            onPress={handleShare}
            className="flex-1 bg-white border border-gray-300 py-3.5 rounded-xl flex-row items-center justify-center active:bg-gray-50"
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color="#374151"
              style={{ marginRight: 8 }}
            />
            <Text className="text-gray-700 font-semibold">Share</Text>
          </Pressable>

          {/* Visit Source Button */}
          {data.official_url && (
            <Pressable
              onPress={() => Linking.openURL(data.official_url)}
              className="flex-1 bg-[#0B5ED7] py-3.5 rounded-xl flex-row items-center justify-center active:bg-blue-700"
            >
              <Text className="text-white font-semibold mr-2">
                Official Source
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
