import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 1. Import your API function
import { fetchLawById } from "@/app/lib/laws.api";

// 2. Import your Header
import { WhiteHeader } from "../components/WhiteHeader";

export default function LeagleDetaildScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // --- Fetch Law Details ---
  const {
    data: law,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["law", id],
    queryFn: () => fetchLawById(id as string),
    enabled: !!id,
  });

  // --- Loading State ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0B5ED7" />
        <Text className="text-gray-500 mt-4">Loading Details...</Text>
      </View>
    );
  }

  // --- Error State ---
  if (error || !law) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-red-500 text-lg mb-2">Error loading details</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Open Official Link ---
  const openLink = () => {
    if (law.official_url) {
      Linking.openURL(law.official_url);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* --- Header --- */}
      <WhiteHeader title="Law Details" />

      {/* --- Main Content (Scrollable) --- */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
      >
        {/* Category & Year Badge */}
        <View className="flex-row mb-4 space-x-2">
          <View className="bg-[#E0F2FE] px-3 py-1 rounded-full border border-[#BAE6FD]">
            <Text className="text-[#0284C7] text-xs font-bold uppercase">
              {law.category}
            </Text>
          </View>
          <View className="bg-[#F3F4F6] px-3 py-1 rounded-full border border-gray-200">
            <Text className="text-gray-600 text-xs font-bold">
              Year: {law.act_year}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-2xl font-extrabold text-gray-900 mb-4 leading-8">
          {law.title}
        </Text>

        {/* Full Description */}
        <Text className="text-gray-600 text-base leading-7 mb-6">
          {law.full_description}
        </Text>

        {/* Divider */}
        <View className="h-[1px] bg-gray-200 w-full mb-6" />

        {/* Important Points Section */}
        {law.important_points && law.important_points.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Key Highlights
            </Text>
            {law.important_points.map((point, index) => (
              <View key={index} className="flex-row mb-3 items-start">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2, marginRight: 10 }}
                />
                <Text className="text-gray-700 flex-1 text-base leading-6">
                  {point}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* --- Fixed Bottom Button --- */}
      {/* Placed outside ScrollView so it sticks to the bottom */}
      {law.official_url && (
        <View className="p-4 bg-white border-t border-gray-100 pb-8">
          <TouchableOpacity
            onPress={openLink}
            className="flex-row items-center justify-center bg-[#0B5ED7] py-4 rounded-xl active:bg-[#0a58ca]"
          >
            <Text className="text-white font-bold text-base mr-2">
              Read Official Document
            </Text>
            <Ionicons name="open-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
