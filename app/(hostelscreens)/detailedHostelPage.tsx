import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { fetchHostelById } from "@/app/lib/hostels.api";

export default function DetailedHostelPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: hostel,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hostel", id],
    queryFn: () => fetchHostelById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8F9FA] items-center justify-center">
        <ActivityIndicator size="large" color="#1D72D2" />
      </View>
    );
  }

  if (error || !hostel) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-gray-500">Failed to load hostel details.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Card (Name & Type) */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            {hostel.name}
          </Text>

          <View className="bg-orange-50 self-start px-3 py-1 rounded-md mb-4">
            <Text className="text-orange-600 font-medium text-xs">
              {hostel.hostel_type}
            </Text>
          </View>

          {/* Image Grid */}
          {hostel.images.length > 0 && (
            <View className="flex-row overflow-hidden rounded-xl">
              {hostel.images.map((img, index) => (
                <View
                  key={index}
                  style={{ width: `${100 / hostel.images.length}%` }}
                  className="h-40"
                >
                  <Image
                    source={{ uri: img }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 2. Location & Contact Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-4">
            Location & Contact
          </Text>

          <View className="flex-row mb-4">
            <Ionicons name="location-outline" size={20} color="#9CA3AF" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-400 text-xs font-semibold uppercase">
                Address
              </Text>
              <Text className="text-gray-700 text-[15px] leading-5">
                {hostel.address}, {hostel.state} {hostel.pincode}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-400 text-xs font-medium uppercase">
                Contact
              </Text>
              <Text className="text-gray-700 text-[15px]">
                {hostel.contact_phone}
              </Text>
              {hostel.contact_person && (
                <Text className="text-gray-400 text-xs">
                  {hostel.contact_person}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 3. Facilities Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-2">
            Facilities
          </Text>
          <Text className="text-gray-600 text-[15px] leading-6">
            {hostel.facilities}
          </Text>
        </View>

        {/* 4. Eligibility Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-2">
            Eligibility
          </Text>
          <Text className="text-gray-600 text-[15px] leading-6">
            {hostel.eligibility}
          </Text>
        </View>

        {/* 5. Fees & Capacity Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 flex-row">
          <View className="flex-1">
            <Text className="text-gray-400 text-xs font-medium mb-1">
              Monthly Fees
            </Text>
            <Text className="text-gray-800 font-semibold text-base">
              ₹{hostel.monthly_fee.toLocaleString()} per month
            </Text>
          </View>
          <View className="flex-1 border-l border-gray-100 pl-4">
            <Text className="text-gray-400 text-xs font-medium mb-1">
              Capacity
            </Text>
            <Text className="text-gray-800 font-semibold text-base">
              {hostel.capacity} students
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => Linking.openURL(`tel:${hostel.contact_phone}`)}
          className="bg-[#1D72D2] flex-row items-center justify-center py-4 rounded-xl active:opacity-90"
        >
          <Ionicons
            name="call"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-bold text-base">Contact Hostel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
