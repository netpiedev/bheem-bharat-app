import { getWishlist, removeFromWishlist } from "@/app/lib/matrimony.api";
import type { WishlistItem } from "@/app/types/matrimony.types";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { WhiteHeader } from "../components/WhiteHeader";

export default function WishlistScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["matrimony-wishlist"],
    queryFn: getWishlist,
    retry: 2,
    retryDelay: 1000,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
    },
  });

  const getImageUrl = (imageKey: string) => {
    if (imageKey.startsWith("https://")) return imageKey;
    return `${process.env.EXPO_PUBLIC_S3_URL}/${imageKey}`;
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const dobToUse = item.profile.user?.dob || item.profile.dob;
    const age = dobToUse
      ? new Date().getFullYear() - new Date(dobToUse).getFullYear()
      : null;

    const primaryImage =
      item.profile.images?.length > 0
        ? getImageUrl(item.profile.images[0])
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
          {/* IMAGE */}
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              className="w-16 h-16 rounded-xl mr-4"
              style={{ width: 64, height: 64 }}
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-blue-50 items-center justify-center mr-4">
              <Ionicons name="person" size={30} color="#2563EB" />
            </View>
          )}

          {/* INFO */}
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">
              {item.profile.user.name || "Anonymous"}
            </Text>

            <Text className="text-sm text-gray-600 mt-0.5">
              {age ? `${age} yrs` : "Age N/A"} • {item.profile.gender}
            </Text>

            {item.profile.city && (
              <Text className="text-xs text-gray-500 mt-1">
                <Ionicons name="location-outline" size={12} />{" "}
                {item.profile.city}
              </Text>
            )}
          </View>

          {/* REMOVE HEART */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation(); // ⛔ prevent navigation
              removeMutation.mutate(item.profile_id);
            }}
            className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
          >
            <Ionicons name="heart" size={22} color="#EF4444" />
          </Pressable>
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
    console.error("Wishlist error:", error);
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Wishlist" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 mb-2 text-center">
            Failed to load wishlist
          </Text>
          {error && (
            <Text className="text-gray-500 text-sm mb-4 text-center">
              {(error as any)?.message || "Unknown error"}
            </Text>
          )}
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
            <View className="w-24 h-24 rounded-full bg-red-50 items-center justify-center mb-6">
              <Ionicons name="heart-outline" size={48} color="#EF4444" />
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-2">
              No profiles in your wishlist
            </Text>

            <Text className="text-gray-500 text-center mb-6 leading-6">
              Save profiles you like and easily find them here later.
            </Text>

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

            <Text className="text-gray-400 text-xs mt-4 text-center">
              Tip: Tap ❤️ on any profile to add it here
            </Text>
          </View>
        }
      />
    </View>
  );
}
