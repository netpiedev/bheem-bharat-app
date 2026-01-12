import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { getProfiles, getMyProfile } from "@/app/lib/matrimony.api";
import { WhiteHeader } from "../components/WhiteHeader";
import type { MatrimonyProfileWithUser } from "@/app/types/matrimony.types";

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
            pathname: "/(matrimony)/profile" as any,
            params: { profileId: item.id },
          })
        }
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      >
        <View className="flex-row">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-4">
            <Ionicons name="person" size={32} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.user.name || "Anonymous"}
            </Text>
            <Text className="text-sm text-gray-600">
              {age ? `${age} years` : "Age not specified"} • {item.gender}
            </Text>
            {item.city && (
              <Text className="text-sm text-gray-500 mt-1">
                <Ionicons name="location" size={12} /> {item.city}
              </Text>
            )}
            {item.profession && (
              <Text className="text-sm text-gray-500 mt-1">
                <Ionicons name="briefcase" size={12} /> {item.profession}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  // Show loading if profile check is loading, or if not ready to show list yet
  if (isLoading && !data) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Browse Profiles" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50">
        <WhiteHeader title="Browse Profiles" />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500 text-center mb-4">
            Failed to load profiles
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
      <WhiteHeader title="Browse Profiles" />
      
      {/* Filters */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-xs text-gray-500 mb-1">Gender</Text>
            <View className="flex-row">
              {["", "MALE", "FEMALE"].map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGenderFilter(g)}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    genderFilter === g ? "bg-blue-600" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={
                      genderFilter === g ? "text-white" : "text-gray-700"
                    }
                  >
                    {g || "All"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <View>
          <Text className="text-xs text-gray-500 mb-1">City</Text>
          <TextInput
            placeholder="Search by city..."
            value={cityFilter}
            onChangeText={setCityFilter}
            className="bg-gray-100 px-4 py-2 rounded-lg"
          />
        </View>
      </View>

      {/* Profiles List */}
      <FlatList
        data={data?.data || []}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              No profiles found
            </Text>
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
