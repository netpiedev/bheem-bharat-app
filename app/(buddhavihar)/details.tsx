import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import { fetchBuddhaViharDetails } from "@/app/lib/buddhavihar.api";
import { BuddhaViharDetails } from "@/app/types/buddhavihar.types";
import { WhiteHeader } from "../components/WhiteHeader";

export default function BuddhaViharDetailsScreen() {
  const { viharId, cityName, stateName } = useLocalSearchParams<{
    viharId?: string;
    cityName?: string;
    stateName?: string;
  }>();

  const {
    data: vihar,
    isLoading,
    error,
  } = useQuery<BuddhaViharDetails>({
    queryKey: ["buddhavihar-details", viharId],
    queryFn: () => fetchBuddhaViharDetails(viharId as string),
    enabled: !!viharId,
  });

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="BuddhaVihar Details" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0B5ED7" />
        </View>
      </View>
    );
  }

  /* ---------- Error ---------- */
  if (error || !vihar) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="BuddhaVihar Details" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center">
            Failed to load Buddha Vihar details.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFC]">
      <WhiteHeader title="BuddhaVihar Details" />

      {/* ---------- Hero Banner ---------- */}
      <LinearGradient
        colors={["#0B5ED7", "#0A58CA"]}
        className="h-44 items-center justify-center"
      >
        <Ionicons name="business" size={72} color="rgba(255,255,255,0.35)" />
      </LinearGradient>

      <View className="px-4 -mt-10 gap-4">
        {/* ---------- Main Card ---------- */}
        <View className="bg-white border border-[#D6E4FF] rounded-2xl p-5 shadow-sm">
          <Text className="text-xl font-bold text-gray-900">{vihar.name}</Text>

          {/* Address */}
          <View className="flex-row items-start mt-3">
            <View className="w-9 h-9 rounded-full bg-[#EAF3FF] items-center justify-center mr-3">
              <Ionicons name="location" size={16} color="#0B5ED7" />
            </View>

            <View className="flex-1">
              {vihar.address ? (
                <Text className="text-gray-700">{vihar.address}</Text>
              ) : null}

              <Text className="text-gray-500 text-sm mt-1">
                {cityName ?? vihar.city.name}, {stateName ?? vihar.state.name}
                {vihar.pincode ? ` - ${vihar.pincode}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Contact Details ---------- */}
        {(vihar.phone || vihar.email) && (
          <View className="bg-white border border-[#D6E4FF] rounded-2xl p-5 shadow-sm">
            <Text className="font-semibold mb-4 text-gray-800">
              Contact Details
            </Text>

            {vihar.phone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${vihar.phone}`)}
                className="flex-row items-center mb-4"
              >
                <View className="w-10 h-10 rounded-full bg-[#EAF3FF] items-center justify-center mr-3">
                  <Ionicons name="call" size={18} color="#0B5ED7" />
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Phone</Text>
                  <Text className="text-gray-800 font-medium">
                    {vihar.phone}
                  </Text>
                </View>
              </Pressable>
            )}

            {vihar.email && (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${vihar.email}`)}
                className="flex-row items-center"
              >
                <View className="w-10 h-10 rounded-full bg-[#EAF3FF] items-center justify-center mr-3">
                  <Ionicons name="mail" size={18} color="#0B5ED7" />
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Email</Text>
                  <Text className="text-gray-800 font-medium">
                    {vihar.email}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* ---------- About ---------- */}
        {vihar.description && (
          <View className="bg-white border border-[#D6E4FF] rounded-2xl p-5 shadow-sm">
            <Text className="font-semibold mb-2 text-gray-800">About</Text>
            <Text className="text-gray-600 leading-6">{vihar.description}</Text>
          </View>
        )}

        {/* ---------- Actions ---------- */}
        <View className="flex-row gap-4 mt-2">
          {vihar.phone && (
            <Pressable
              onPress={() => Linking.openURL(`tel:${vihar.phone}`)}
              className="flex-1 bg-[#0B5ED7] rounded-xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="call" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">Call Now</Text>
            </Pressable>
          )}

          {vihar.email && (
            <Pressable
              onPress={() => Linking.openURL(`mailto:${vihar.email}`)}
              className="flex-1 border border-[#0B5ED7] rounded-xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="mail" size={20} color="#0B5ED7" />
              <Text className="text-[#0B5ED7] ml-2 font-medium">Email</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
