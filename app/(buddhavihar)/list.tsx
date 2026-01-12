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

import { fetchBuddhaViharsByCity } from "@/app/lib/buddhavihar.api";
import { BuddhaViharListItem } from "@/app/types/buddhavihar.types";
import { WhiteHeader } from "../components/WhiteHeader";

export default function BuddhaViharList() {
  const router = useRouter();

  const { cityId, cityName, stateName } = useLocalSearchParams<{
    cityId?: string;
    cityName?: string;
    stateName?: string;
  }>();

  const {
    data: vihars,
    isLoading,
    error,
  } = useQuery<BuddhaViharListItem[]>({
    queryKey: ["buddhavihar-vihars", cityId],
    queryFn: () => fetchBuddhaViharsByCity(cityId as string),
    enabled: !!cityId,
  });

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader
          title="Buddha Vihars"
          subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0B5ED7" />
        </View>
      </View>
    );
  }

  /* ---------- Error ---------- */
  if (error || !vihars) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader
          title="Buddha Vihars"
          subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center">
            Failed to load Buddha Vihars.
          </Text>
        </View>
      </View>
    );
  }

  /* ---------- Empty ---------- */
  if (vihars.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader
          title="Buddha Vihars"
          subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 text-center">
            No Buddha Vihars found in this city.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader
        title="Buddha Vihars"
        subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
      />

      <FlatList
        data={vihars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(buddhavihar)/details",
                params: {
                  viharId: item.id,
                  cityName,
                  stateName,
                },
              })
            }
            className="
              bg-white
              border border-[#D6E4FF]
              rounded-2xl
              p-4
              shadow-sm
            "
          >
            {/* Icon + Title */}
            <View className="flex-row items-center gap-2">
              <Ionicons name="business" size={22} color="#0B5ED7" />
              <Text className="font-semibold text-base flex-1">
                {item.name}
              </Text>
            </View>

            {/* Address */}
            {item.address ? (
              <Text className="text-gray-600 text-sm mt-2">
                📍 {item.address}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
