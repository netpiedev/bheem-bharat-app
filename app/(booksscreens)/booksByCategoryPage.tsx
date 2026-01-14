import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { fetchBooksByCategory } from "@/app/lib/books.api";

export default function BooksByCategory() {
  const router = useRouter();
  const { id, category } = useLocalSearchParams<{
    id: string;
    category: string;
  }>();

  // --- 1. Infinite Query Setup ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["books-infinite", id],
    queryFn: ({ pageParam = 1 }) =>
      fetchBooksByCategory({
        categoryId: id as string,
        pageParam: pageParam as number,
      }),
    initialPageParam: 1,
    enabled: !!id,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.page === undefined) return undefined;
      const fetchedSoFar = lastPage.page * lastPage.limit;
      return lastPage.count > fetchedSoFar ? lastPage.page + 1 : undefined;
    },
  });

  // Flatten the pages
  const books = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data ?? []) ?? [];
  }, [data]);

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#0B5ED7" />
        <Text className="text-gray-400 mt-2">Loading books...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-red-500 mt-2 text-center">
          Error loading books.
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: category }} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {books.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              router.push({
                pathname: "/(booksscreens)/detailedBookPage",
                params: { id: item.id },
              });
            }}
            className="mb-5 w-full bg-[#F1F7FF] border border-[#D6E4FF] rounded-2xl flex-row items-center overflow-hidden"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            {/* Flush Book Cover Image */}
            <View className="w-[80px] h-[100px] bg-[#D6E8FF]">
              {item.cover_image_object_key ? (
                <Image
                  source={{ uri: item.cover_image_object_key }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons name="book" size={28} color="#0B5ED7" />
                </View>
              )}
            </View>

            {/* Text Content */}
            <View className="flex-1 px-4 py-2">
              <Text
                className="font-bold text-[#1A1C1E] text-base mb-0.5"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>
                {item.author}
              </Text>

              <View className="flex-row items-center">
                <View className="bg-[#FFE5E5] px-2 py-0.5 rounded-md border border-[#FFD1D1]">
                  <Text className="text-[#FF4D4D] font-bold text-[10px]">
                    PDF
                  </Text>
                </View>
                {/* Space for other tags like 'New' or 'Premium' if needed */}
              </View>
            </View>

            {/* Right Arrow */}
            <View className="pr-4">
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#0B5ED7"
                opacity={0.5}
              />
            </View>
          </Pressable>
        ))}

        {/* --- Pagination Footer --- */}
        <View className="mt-2 mb-6">
          {hasNextPage ? (
            <Pressable
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="py-4 rounded-xl items-center justify-center bg-[#D6E8FF]"
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color="#0B5ED7" />
              ) : (
                <Text className="text-[#0B5ED7] font-bold">
                  Load More Books
                </Text>
              )}
            </Pressable>
          ) : books.length > 0 ? (
            <Text className="text-center text-gray-400 text-xs italic py-4">
              All books in this category loaded.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
