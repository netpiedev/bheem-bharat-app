import { getWishlist } from "@/app/lib/matrimony.api";
import type { WishlistItem } from "@/app/types/matrimony.types";
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
import { WhiteHeader } from "../components/WhiteHeader";

export default function WishlistScreen() {
  const router = useRouter();

  const {
    data: wishlist,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
        className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
      >
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mr-4">
            <Ionicons name="person" size={28} color="#2563EB" />
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {item.profile.user.name || "Anonymous"}
            </Text>

            <Text className="text-sm text-gray-600">
              {age ? `${age} yrs` : "Age N/A"} • {item.profile.gender}
            </Text>

            {item.profile.city && (
              <Text className="text-sm text-gray-500 mt-1">
                <Ionicons name="location-outline" size={12} />{" "}
                {item.profile.city}
              </Text>
            )}
          </View>

          {/* Heart */}
          <Ionicons name="heart" size={22} color="#EF4444" />
        </View>
      </Pressable>
    );
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Wishlist" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (isError) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Wishlist" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 mb-4">Failed to load wishlist</Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title="Wishlist" />

      <FlatList
        data={wishlist || []}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          flexGrow: wishlist?.length ? 0 : 1,
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8">
            {/* Icon */}
            <View className="w-24 h-24 rounded-full bg-red-50 items-center justify-center mb-6">
              <Ionicons name="heart-outline" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <Text className="text-xl font-bold text-gray-900 mb-2">
              No profiles in your wishlist
            </Text>

            {/* Subtitle */}
            <Text className="text-gray-500 text-center mb-6 leading-6">
              Save profiles you like and easily find them here later.
            </Text>

            {/* CTA */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(matrimony)/browse" as any,
                })
              }
              className="bg-blue-600 px-10 py-4 rounded-2xl"
            >
              <Text className="text-white font-semibold text-base">
                Browse Profiles
              </Text>
            </Pressable>

            {/* Hint */}
            <Text className="text-gray-400 text-xs mt-4 text-center">
              Tip: Tap ❤️ on any profile to add it here
            </Text>
          </View>
        }
      />
    </View>
  );
}
