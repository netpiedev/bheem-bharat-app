import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchMedia } from "@/app/lib/media.api";

export default function MediaScreen() {
  const router = useRouter();

  // --- 1. Infinite Query Setup ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["medialist"],
    queryFn: ({ pageParam = 1 }) =>
      fetchMedia({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Check if we have more items to fetch: total count > (current page * limit)
      const fetchedSoFar = lastPage.page * lastPage.limit;
      return lastPage.count > fetchedSoFar ? lastPage.page + 1 : undefined;
    },
  });

  // Flatten nested pages into a single array
  const mediaList = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

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
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        // Removed top padding; kept side padding for the whole list
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        {mediaList.map((item) => {
          const isImage = item.file_type === "image";
          const isAudio = item.file_type === "audio";
          const isVideo = item.file_type === "video";
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
              // Removed internal padding (p-2 -> p-0) to let image be flush
              className="flex-row items-center bg-white border border-gray-100 rounded-2xl mb-3 overflow-hidden shadow-sm active:opacity-80"
              style={{ elevation: 1 }}
            >
              {/* Left: Media Preview (Flush with edges) */}
              <View className="w-32 h-24 bg-gray-100 relative">
                {previewUri ? (
                  <Image
                    source={{ uri: previewUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-gray-50">
                    <Ionicons
                      name={isAudio ? "musical-note" : "videocam"}
                      size={24}
                      color="#CBD5E1"
                    />
                  </View>
                )}

                {/* Type Overlay Badge */}
                <View className="absolute top-1 left-1">
                  <View className="bg-black/40 backdrop-blur-md p-1 rounded-lg">
                    <Ionicons
                      name={
                        isAudio ? "musical-notes" : isVideo ? "play" : "image"
                      }
                      size={12}
                      color="white"
                    />
                  </View>
                </View>

                {/* Duration Badge for non-images */}
                {!isImage && item.duration && (
                  <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded-md">
                    <Text className="text-white text-[10px] font-bold">
                      {formatDuration(item.duration)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Right: Text Content */}
              <View className="flex-1 px-4 py-2 justify-center">
                <View className="flex-row items-center mb-0.5">
                  <Text
                    className="text-[15px] font-bold text-gray-800 flex-1"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </View>

                <Text
                  className="text-xs text-gray-500 leading-4"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                {/* Minimalist File Tag */}
                <View className="flex-row mt-2">
                  <Text className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">
                    {item.file_type}
                  </Text>
                </View>
              </View>

              {/* Trailing Icon */}
              <View className="pr-3">
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </View>
            </Pressable>
          );
        })}

        {/* --- Pagination Footer --- */}
        <View className="mt-2 mb-8">
          {hasNextPage ? (
            <Pressable
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center"
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text className="text-gray-600 font-semibold text-sm">
                  Load More
                </Text>
              )}
            </Pressable>
          ) : mediaList.length > 0 ? (
            <View className="py-4 items-center">
              <View className="h-[1px] w-full bg-gray-100 absolute top-1/2" />
              <Text className="bg-white px-4 text-gray-400 text-xs font-medium italic">
                End of list
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
