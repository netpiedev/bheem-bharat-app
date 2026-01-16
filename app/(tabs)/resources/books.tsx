import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { fetchBookCategories } from "@/app/lib/books.api";
import { BookCategoryListItem } from "@/app/types/books.types";

export default function Books() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["bookCategories"],
    queryFn: fetchBookCategories,
  });

  const bookCategories: BookCategoryListItem[] = data?.data || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#0B5ED7" />
        <Text className="text-gray-400 mt-2">Loading...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-red-500 mt-2 text-center">
          Failed to load categories.
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-[#FAFCFF]">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1976d2"]} // Android color
            tintColor="#1976d2" // iOS color
          />
        }
      >
        {bookCategories.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/(booksscreens)/booksByCategoryPage",
                params: { id: item.id, category: item.name },
              })
            }
            className="mb-4 w-full bg-[#F1F7FF] border border-[#D6E4FF] rounded-[16px] p-5 flex-row items-center"
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            {/* Left Icon Container */}
            <View className="w-14 h-14 rounded-2xl bg-[#D6E8FF] items-center justify-center mr-4">
              <Ionicons name="stats-chart" size={26} color="#0B5ED7" />
            </View>

            {/* Text Content */}
            <View className="flex-1">
              <Text className="font-semibold text-[#1A1C1E] text-[17px] mb-1">
                {item.name}
              </Text>
              <Text className="text-gray-500 text-[14px]">
                {item.books_count > 1
                  ? `${item.books_count} books`
                  : `${item.books_count} book`}
              </Text>
            </View>

            {/* Right Arrow Action */}
            <View className="w-10 h-10 rounded-full bg-[#D6E8FF] items-center justify-center">
              <Ionicons name="chevron-forward" size={20} color="#0B5ED7" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
