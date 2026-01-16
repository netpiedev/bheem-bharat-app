import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { fetchBuddhaViharStates } from "@/app/lib/buddhavihar.api";
import { BuddhaViharState } from "@/app/types/buddhavihar.types";
import { BuddhaHeader } from "../components/BuddhaHeader";

// Mapping helper to link API names to your specific URLs
const STATE_IMAGES: Record<string, string> = {
  "Uttar Pradesh":
    "https://bheembharat.com/wp-content/uploads/2025/11/Tajmahal-UP-1.png",
  "Madhya Pradesh": "https://bheembharat.com/wp-content/uploads/2025/11/MP.png",
  Punjab: "https://bheembharat.com/wp-content/uploads/2025/11/Punjab.png",
  Maharashtra:
    "https://bheembharat.com/wp-content/uploads/2025/11/Maharashtra.png",
  Bihar: "https://bheembharat.com/wp-content/uploads/2025/11/Bihar.png",
  Gujarat: "https://bheembharat.com/wp-content/uploads/2025/11/Gujrat.png",
  "Andhra Pradesh":
    "https://bheembharat.com/wp-content/uploads/2025/11/Andhra-Pradesh.png",
  Delhi: "https://bheembharat.com/wp-content/uploads/2025/11/UT-Delhi.png",
  Karnataka: "https://bheembharat.com/wp-content/uploads/2025/11/Karnataka.png",
  Chhattisgarh:
    "https://bheembharat.com/wp-content/uploads/2025/11/Chhatisgarh.png",
  Assam: "https://bheembharat.com/wp-content/uploads/2025/10/Assam.png",
  Haryana: "https://bheembharat.com/wp-content/uploads/2025/12/Haryana.png",
  Kerala: "https://bheembharat.com/wp-content/uploads/2025/12/Kerala.png",
  Odisha: "https://bheembharat.com/wp-content/uploads/2025/12/Odisha.png",
  Rajasthan: "https://bheembharat.com/wp-content/uploads/2025/12/Rajasthan.png",
  "Tamil Nadu":
    "https://bheembharat.com/wp-content/uploads/2026/01/Tamilnadu.png",
  Telangana: "https://bheembharat.com/wp-content/uploads/2026/01/Telangana.png",
  "West Bengal":
    "https://bheembharat.com/wp-content/uploads/2026/01/West-Bengal.png",
  // Fallback for names that might not match exactly
  default: "https://bheembharat.com/wp-content/uploads/2025/11/Maharashtra.png",
};

export default function BuddhaViharStates() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: states,
    isLoading,
    error,
    refetch,
  } = useQuery<BuddhaViharState[]>({
    queryKey: ["buddhavihar-states"],
    queryFn: fetchBuddhaViharStates,
  });

  // 1. Sort the states by totalBuddhaVihars (Descending)
  const sortedStates = useMemo(() => {
    if (!states) return [];

    // Create a copy [...states] because .sort() mutates the original array
    return [...states].sort(
      (a, b) => b.totalBuddhaVihars - a.totalBuddhaVihars
    );
  }, [states]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <BuddhaHeader title="BuddhaVihar Directory" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0B5ED7" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BuddhaHeader title="BuddhaVihar Directory" />

      <View className="flex-row items-center justify-between px-5 mt-6 mb-2">
        <Text className="text-xl font-bold text-gray-800">Browse by State</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-bold">
            {sortedStates.length} States
          </Text>
        </View>
      </View>

      <FlatList
        data={sortedStates} // 2. Pass the sorted list here
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 14 }}
        contentContainerStyle={{ paddingBottom: 32, gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0B5ED7"
          />
        }
        renderItem={({ item }) => {
          const imageUrl = STATE_IMAGES[item.name] || STATE_IMAGES.default;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(buddhavihar)/cities",
                  params: { stateId: item.id, stateName: item.name },
                })
              }
              className="flex-1 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm"
              style={{ elevation: 2 }}
            >
              {/* State Image */}
              <View className="h-28 w-full bg-gray-100">
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Overlay for contrast */}
                <View className="absolute inset-0 bg-black/10" />
              </View>

              {/* Text Info */}
              <View className="p-3">
                <Text
                  className="font-bold text-gray-900 text-base"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <View className="flex-row items-center mt-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                  <Text className="text-gray-500 text-xs font-medium">
                    {item.totalBuddhaVihars} Vihars
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
