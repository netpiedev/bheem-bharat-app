import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { fetchMedia } from "@/app/lib/media.api";
import { MediaListItem } from "@/app/types/media.types";

export default function MediaScreen() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["mediaList"],
    queryFn: fetchMedia,
  });

  const mediaList: MediaListItem[] = data || [];

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {mediaList.map((item) => {
          const isImage = item.file_type === "image";

          const previewUri = isImage ? item.object_key : item.thumbnail_key;

          return (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/(mediascreens)/detailedMediaScreen",
                  params: { id: item.id },
                })
              }
              className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-2 mb-4 shadow-sm active:opacity-70"
            >
              <View className="relative w-28 h-24 bg-gray-200 rounded-xl overflow-hidden">
                <Image
                  source={{ uri: previewUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Center Icon */}
                <View className="absolute inset-0 justify-center items-center">
                  <View className="bg-white/90 p-2 rounded-full shadow-sm">
                    <Ionicons
                      name={
                        item.file_type === "audio"
                          ? "musical-notes"
                          : item.file_type === "video"
                          ? "play"
                          : "image"
                      }
                      size={16}
                      color="#3B82F6"
                    />
                  </View>
                </View>

                {/* Duration Badge */}
                {!isImage && item.duration && (
                  <View className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded">
                    <Text className="text-white text-[10px] font-bold">
                      {formatDuration(item.duration)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 ml-4 pr-1">
                <Text
                  className="text-base font-bold text-gray-800"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-400 mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward-circle-outline"
                size={26}
                color="#E5E7EB"
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
