import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { getWishlist } from "@/app/lib/matrimony.api";
import { WhiteHeader } from "../components/WhiteHeader";
import type { WishlistItem } from "@/app/types/matrimony.types";

export default function WishlistScreen() {
  const router = useRouter();

  const { data: wishlist, isLoading, isError, refetch } = useQuery({
    queryKey: ["matrimony-wishlist"],
    queryFn: getWishlist,
  });

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const age = item.profile.dob
      ? new Date().getFullYear() - new Date(item.profile.dob).getFullYear()
      : null;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(matrimony)/profile" as any,
            params: { profileId: item.profile_id },
          })
        }
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      >
        <View className="flex-row">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-4">
            <Ionicons name="person" size={32} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {item.profile.user.name || "Anonymous"}
                </Text>
                <Text className="text-sm text-gray-600">
                  {age ? `${age} years` : "Age not specified"} • {item.profile.gender}
                </Text>
                {item.profile.city && (
                  <Text className="text-sm text-gray-500 mt-1">
                    <Ionicons name="location" size={12} /> {item.profile.city}
                  </Text>
                )}
              </View>
              <Ionicons name="heart" size={24} color="#EF4444" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Wishlist" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Wishlist" />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500 text-center mb-4">
            Failed to load wishlist
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <WhiteHeader title="Wishlist" />
      <FlatList
        data={wishlist || []}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              Your wishlist is empty
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(matrimony)/browse" as any,
                })
              }
              className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
            >
              <Text className="text-white font-semibold">Browse Profiles</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

