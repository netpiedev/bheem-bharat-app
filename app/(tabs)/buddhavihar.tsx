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

import { fetchBuddhaViharStates } from "@/app/lib/buddhavihar.api";
import { BuddhaViharState } from "@/app/types/buddhavihar.types";
import { BuddhaHeader } from "../components/BuddhaHeader";

export default function BuddhaViharStates() {
  const router = useRouter();

  const {
    data: states,
    isLoading,
    error,
  } = useQuery<BuddhaViharState[]>({
    queryKey: ["buddhavihar-states"],
    queryFn: fetchBuddhaViharStates,
  });

  /* ---------- Loading ---------- */
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

  /* ---------- Error ---------- */
  if (error || !states) {
    return (
      <View className="flex-1 bg-white">
        <BuddhaHeader title="BuddhaVihar Directory" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center">
            Failed to load Buddha Vihar states.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BuddhaHeader title="BuddhaVihar Directory" />

      <Text className="px-4 mt-4 mb-2 font-semibold">Browse by State</Text>

      <FlatList
        data={states}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(buddhavihar)/cities",
                params: {
                  stateId: item.id,
                  stateName: item.name,
                },
              })
            }
            className="flex-1 bg-[#EAF3FF] border border-[#CFE2FF] rounded-2xl p-4 items-center"
          >
            <Ionicons name="location" size={20} color="#0B5ED7" />

            <Text className="mt-2 font-semibold">{item.name}</Text>

            <Text className="text-gray-500 text-sm">
              {item.totalBuddhaVihars} BuddhaVihars
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
