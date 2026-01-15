import { getProfiles } from "@/app/lib/matrimony.api";
import type { MatrimonyProfileWithUser } from "@/app/types/matrimony.types";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { WhiteHeader } from "../components/WhiteHeader";

/* ------------------ AVATARS ------------------ */
const FEMALE_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/042/332/066/non_2x/person-photo-placeholder-woman-default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-social-media-free-vector.jpg";

const MALE_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg";

const getProfileImage = (profile: MatrimonyProfileWithUser) => {
  if (profile.user?.photo) return profile.user.photo;
  return profile.gender === "FEMALE" ? FEMALE_AVATAR : MALE_AVATAR;
};

export default function BrowseProfilesScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const limit = 20;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["matrimony-profiles", page, genderFilter, cityFilter],
    queryFn: () =>
      getProfiles({
        page,
        limit,
        gender: genderFilter || undefined,
        city: cityFilter || undefined,
      }),
  });

  const renderProfile = ({ item }: { item: MatrimonyProfileWithUser }) => {
    const age = item.dob
      ? new Date().getFullYear() - new Date(item.dob).getFullYear()
      : null;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(matrimony)/profile",
            params: { profileId: item.id },
          })
        }
        className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
      >
        <View className="flex-row">
          {/* Avatar */}
          <Image
            source={{ uri: getProfileImage(item) }}
            className="w-20 h-20 rounded-xl mr-4"
          />

          {/* Info */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <Text className="text-lg font-bold text-gray-900">
                {item.user.name || "Anonymous"}
                {age ? `, ${age}` : ""}
              </Text>
              <Ionicons name="star" size={18} color="#FACC15" />
            </View>

            <Text className="text-sm text-gray-600 mt-1">{item.gender}</Text>

            {item.city && (
              <Text className="text-sm text-gray-500 mt-1">
                <Ionicons name="location-outline" size={14} /> {item.city}
              </Text>
            )}

            {item.profession && (
              <Text className="text-sm text-gray-500 mt-1">
                <Ionicons name="briefcase-outline" size={14} />{" "}
                {item.profession}
              </Text>
            )}

            {/* Actions */}
            <View className="flex-row mt-3">
              <View className="flex-1 bg-blue-600 py-2 rounded-lg mr-2">
                <Text className="text-white text-center font-semibold">
                  View Profile
                </Text>
              </View>

              <View className="w-10 h-10 border border-gray-200 rounded-lg items-center justify-center">
                <Ionicons name="heart-outline" size={20} color="#2563EB" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  /* ------------------ LOADING ------------------ */
  if (isLoading && !data) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="All Profiles" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  /* ------------------ ERROR ------------------ */
  if (isError) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="All Profiles" />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500 mb-4">Failed to load profiles</Text>
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
      <WhiteHeader title="All Profiles" />

      {/* FILTER BAR */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        {/* Gender Toggle */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
          {["", "MALE", "FEMALE"].map((g) => (
            <Pressable
              key={g}
              onPress={() => setGenderFilter(g)}
              className={`flex-1 py-2 rounded-lg ${
                genderFilter === g ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  genderFilter === g ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {g === "" ? "All" : g === "MALE" ? "Groom" : "Bride"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* City Search */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            placeholder="Search by city..."
            value={cityFilter}
            onChangeText={setCityFilter}
            className="ml-3 flex-1 placeholder:text-gray-400"
          />
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={data?.data || []}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4">No profiles found</Text>
          </View>
        }
        onEndReached={() => {
          if (data && data.data.length < data.total) {
            setPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
