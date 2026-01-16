import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLanguage } from "@/app/lib/LanguageContext";
import {
  addToWishlist,
  getProfiles,
  getWishlist,
  removeFromWishlist,
} from "@/app/lib/matrimony.api";
import type { MatrimonyProfileWithUser } from "@/app/types/matrimony.types";
import { WhiteHeader } from "../components/WhiteHeader";

/* ------------------ AVATARS ------------------ */
const FEMALE_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/042/332/066/non_2x/person-photo-placeholder-woman-default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-social-media-free-vector.jpg";

const MALE_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg";

const getProfileImage = (profile: MatrimonyProfileWithUser) => {
  if (profile.images?.length) return profile.images[0];
  if (profile.user?.photo) return profile.user.photo;
  return profile.gender === "FEMALE" ? FEMALE_AVATAR : MALE_AVATAR;
};

const getAge = (p: MatrimonyProfileWithUser) => {
  const dob = p.user?.dob || p.dob;
  if (!dob) return null;
  return new Date().getFullYear() - new Date(dob).getFullYear();
};

export default function BrowseProfilesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [page, setPage] = useState(1);
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  /* ---------------- RESET PAGE WHEN GENDER CHANGES ---------------- */
  useEffect(() => {
    setPage(1);
  }, [gender]);

  /* ---------------- DEBOUNCE CITY (500ms) ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(city.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [city]);

  /* ---------------- PROFILES ---------------- */
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["matrimony-profiles", page, gender, debouncedCity],
    queryFn: () =>
      getProfiles({
        page,
        limit: 20,
        gender: gender || undefined,
        city: debouncedCity || undefined,
      }),
    keepPreviousData: true,
    initialData: { data: [], total: 0 },
  });

  /* ---------------- WISHLIST ---------------- */
  useQuery({
    queryKey: ["matrimony-wishlist"],
    queryFn: async () => {
      const list = await getWishlist();
      setWishlistIds(new Set(list.map((i) => i.profile_id)));
      return list;
    },
  });

  const addMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: (_, profileId) => {
      setWishlistIds((prev) => new Set(prev).add(profileId));
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (_, profileId) => {
      setWishlistIds((prev) => {
        const s = new Set(prev);
        s.delete(profileId);
        return s;
      });
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
    },
  });

  /* ---------------- CARD ---------------- */
  const renderItem = ({ item }: { item: MatrimonyProfileWithUser }) => {
    const age = getAge(item);
    const isWishlisted = wishlistIds.has(item.id);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(matrimony)/profile",
            params: { profileId: item.id },
          })
        }
        className="flex-1 m-2 bg-white rounded-2xl overflow-hidden shadow-sm"
      >
        {/* IMAGE */}
        <Image
          source={getProfileImage(item)}
          style={{ width: "100%", height: 180 }}
          contentFit="cover"
        />

        {/* CONTENT */}
        <View className="p-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-gray-900">
              {item.user.name || t("matrimony_anonymous")}
              {age ? `, ${age}` : ""}
            </Text>
            <Ionicons name="star" size={16} color="#FACC15" />
          </View>

          {item.profession && (
            <Text className="text-xs text-gray-500 mt-1">
              {item.profession}
            </Text>
          )}

          {item.city && (
            <Text className="text-xs text-gray-400 mt-1">
              <Ionicons name="location-outline" size={12} /> {item.city}
            </Text>
          )}

          {/* ACTIONS */}
          <View className="mt-3 flex-row items-center justify-between">
            {/* VIEW */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(matrimony)/profile",
                  params: { profileId: item.id },
                })
              }
              className="px-3 py-1.5 bg-blue-50 rounded-lg"
            >
              <Text className="text-blue-600 font-semibold text-sm">
                {t("matrimony_view")}
              </Text>
            </Pressable>

            {/* WISHLIST (ALWAYS RED WHEN ADDED) */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                isWishlisted
                  ? removeMutation.mutate(item.id)
                  : addMutation.mutate(item.id);
              }}
              className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
            >
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={20}
                color={isWishlisted ? "#EF4444" : "#EF4444"}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  /* ---------------- LOADING / ERROR ---------------- */
  if (isLoading && !data) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title={t("matrimony_all_profiles")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title={t("matrimony_all_profiles")} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 mb-3">{t("matrimony_load_error")}</Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">
              {t("matrimony_retry")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <WhiteHeader title={t("matrimony_all_profiles")} />

      {/* FILTER BAR */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
          {["", "MALE", "FEMALE"].map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g as any)}
              className={`flex-1 py-2 rounded-lg ${
                gender === g ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  gender === g ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {g === ""
                  ? t("matrimony_all")
                  : g === "MALE"
                  ? t("matrimony_groom")
                  : t("matrimony_bride")}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            placeholder={t("matrimony_search_by_city")}
            value={city}
            onChangeText={setCity}
            className="ml-3 flex-1"
          />
        </View>
      </View>

      {/* GRID LIST */}
      <FlatList
        data={data?.data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={() => {
          if (data && data.data.length < data.total) {
            setPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
}
