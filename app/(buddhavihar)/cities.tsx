import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { fetchCitiesByState } from "@/app/lib/buddhavihar.api";
import { BuddhaViharCity } from "@/app/types/buddhavihar.types";
import { WhiteHeader } from "../components/WhiteHeader";

export default function CitiesScreen() {
  const router = useRouter();

  const { stateId, stateName } = useLocalSearchParams<{
    stateId?: string;
    stateName?: string;
  }>();

  const {
    data: cities,
    isLoading,
    error,
  } = useQuery<BuddhaViharCity[]>({
    queryKey: ["buddhavihar-cities", stateId],
    queryFn: () => fetchCitiesByState(stateId as string),
    enabled: !!stateId, // 🔑 wait until stateId exists
  });

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Select District" subtitle={stateName} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0B5ED7" />
        </View>
      </View>
    );
  }

  /* ---------- Error ---------- */
  if (error || !cities) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Select District" subtitle={stateName} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center">
            Failed to load districts.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title="Select District" subtitle={stateName} />

      {/* ---------- Cities Grid ---------- */}
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 14 }}
        columnWrapperStyle={{ gap: 14 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(buddhavihar)/list",
                params: {
                  cityId: item.id,
                  cityName: item.name,
                  stateName,
                },
              })
            }
            className="
              flex-1
              bg-[#F7FAFF]
              border border-[#D6E4FF]
              rounded-2xl
              px-4 py-6
              items-center
              justify-center
              shadow-sm
            "
          >
            {/* Icon */}
            <View className="bg-[#E0ECFF] p-3 rounded-full">
              <Ionicons name="business" size={22} color="#0B5ED7" />
            </View>

            {/* City name */}
            <Text className="mt-3 font-semibold text-base text-center">
              {item.name}
            </Text>

            {/* Count */}
            <Text className="mt-1 text-sm text-gray-600">
              {item.totalBuddhaVihars} Buddha Vihars
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
