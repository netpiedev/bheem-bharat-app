import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchHostelById } from "@/app/lib/hostels.api";

const { width, height } = Dimensions.get("window");

export default function DetailedHostelPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: hostel,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hostel", id],
    queryFn: () => fetchHostelById(id as string),
    enabled: !!id,
  });

  const getBadgeColors = (type: string) => {
    switch (type?.toLowerCase()) {
      case "boys":
        return {
          bg: "bg-blue-500",
          text: "text-white",
          icon: "male" as keyof typeof Ionicons.glyphMap,
        };
      case "girls":
        return {
          bg: "bg-pink-500",
          text: "text-white",
          icon: "female" as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          bg: "bg-purple-500",
          text: "text-white",
          icon: "people" as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const openImageGallery = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedImage(hostel?.images[index] || null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!hostel?.images.length) return;

    let newIndex = currentImageIndex;
    if (direction === "next") {
      newIndex = (currentImageIndex + 1) % hostel.images.length;
    } else {
      newIndex =
        (currentImageIndex - 1 + hostel.images.length) % hostel.images.length;
    }

    setCurrentImageIndex(newIndex);
    setSelectedImage(hostel.images[newIndex]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-3 font-medium">
          Loading hostel details...
        </Text>
      </View>
    );
  }

  if (error || !hostel) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 text-lg font-semibold mt-4">
          Failed to load hostel details
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const badge = getBadgeColors(hostel.hostel_type);
  const hasImages = hostel.images && hostel.images.length > 0;

  return (
    <>
      <View className="flex-1 bg-gray-50">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Hero Image Section */}
          <View className="relative">
            {hasImages ? (
              <Pressable onPress={() => openImageGallery(0)}>
                <Image
                  source={{ uri: hostel.images[0] }}
                  style={{ width, height: width * 0.75 }}
                  resizeMode="cover"
                />
                {/* Gradient Overlay */}
                <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Image Counter */}
                {hostel.images.length > 1 && (
                  <View className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full flex-row items-center">
                    <Ionicons name="images" size={16} color="white" />
                    <Text className="text-white font-bold text-sm ml-1">
                      {hostel.images.length} Photos
                    </Text>
                  </View>
                )}

                {/* Expand Hint */}
                <View className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-full flex-row items-center">
                  <Ionicons name="expand" size={14} color="white" />
                  <Text className="text-white text-xs font-semibold ml-1">
                    Tap to view
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View
                style={{ width, height: width * 0.75 }}
                className="bg-gradient-to-br from-blue-100 to-blue-50 items-center justify-center"
              >
                <Ionicons name="home" size={80} color="#93C5FD" />
              </View>
            )}

            {/* Type Badge Overlay */}
            <View className="absolute top-4 left-4">
              <View
                className={`${badge.bg} px-4 py-2 rounded-full flex-row items-center shadow-xl`}
              >
                <Ionicons name={badge.icon} size={18} color="white" />
                <Text
                  className={`${badge.text} text-sm font-bold uppercase ml-2`}
                >
                  {hostel.hostel_type}
                </Text>
              </View>
            </View>
          </View>

          {/* Image Thumbnails */}
          {hasImages && hostel.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 py-4 bg-white border-b border-gray-100"
              contentContainerStyle={{ gap: 12 }}
            >
              {hostel.images.map((img, index) => (
                <Pressable
                  key={index}
                  onPress={() => openImageGallery(index)}
                  className="relative rounded-xl overflow-hidden"
                  style={{ width: 100, height: 80 }}
                >
                  <Image
                    source={{ uri: img }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/20" />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Content Section */}
          <View className="px-4 pt-6">
            {/* Title & Quick Stats */}
            <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {hostel.name}
              </Text>

              {/* Quick Stats Grid */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-blue-50 p-4 rounded-2xl">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="people" size={20} color="#3B82F6" />
                    <Text className="text-gray-600 text-xs font-semibold ml-2 uppercase">
                      Capacity
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    {hostel.capacity}
                  </Text>
                  <Text className="text-gray-500 text-xs">Students</Text>
                </View>

                <View className="flex-1 bg-green-50 p-4 rounded-2xl">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cash" size={20} color="#10B981" />
                    <Text className="text-gray-600 text-xs font-semibold ml-2 uppercase">
                      Monthly Fee
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    ₹{hostel.monthly_fee.toLocaleString()}
                  </Text>
                  <Text className="text-gray-500 text-xs">Per Month</Text>
                </View>
              </View>
            </View>

            {/* Location Card */}
            <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 p-2 rounded-xl">
                  <Ionicons name="location" size={24} color="#3B82F6" />
                </View>
                <Text className="text-lg font-bold text-gray-900 ml-3">
                  Location
                </Text>
              </View>

              <Text className="text-gray-700 text-base leading-6 mb-3">
                {hostel.address}
              </Text>

              <View className="flex-row gap-2 mb-4">
                <View className="bg-gray-100 px-3 py-2 rounded-lg">
                  <Text className="text-gray-700 font-semibold text-sm">
                    {hostel.city}
                  </Text>
                </View>
                <View className="bg-gray-100 px-3 py-2 rounded-lg">
                  <Text className="text-gray-700 font-semibold text-sm">
                    {hostel.state}
                  </Text>
                </View>
                {hostel.pincode && (
                  <View className="bg-gray-100 px-3 py-2 rounded-lg">
                    <Text className="text-gray-700 font-semibold text-sm">
                      {hostel.pincode}
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={() => {
                  const address = `${hostel.address}, ${hostel.city}, ${hostel.state}`;
                  const url = `https://maps.google.com/?q=${encodeURIComponent(
                    address
                  )}`;
                  Linking.openURL(url);
                }}
                className="bg-blue-50 border border-blue-200 py-3 px-4 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="navigate" size={18} color="#3B82F6" />
                <Text className="text-blue-600 font-bold ml-2">
                  Open in Maps
                </Text>
              </Pressable>
            </View>

            {/* Contact Card */}
            <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-xl">
                  <Ionicons name="call" size={24} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-gray-900 ml-3">
                  Contact Information
                </Text>
              </View>

              <View className="bg-gray-50 p-4 rounded-2xl mb-3">
                <Text className="text-gray-500 text-xs font-semibold uppercase mb-1">
                  Phone Number
                </Text>
                <Text className="text-gray-900 font-bold text-lg">
                  {hostel.contact_phone}
                </Text>
              </View>

              {hostel.contact_person && (
                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-500 text-xs font-semibold uppercase mb-1">
                    Contact Person
                  </Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {hostel.contact_person}
                  </Text>
                </View>
              )}
            </View>

            {/* Facilities Card */}
            <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 p-2 rounded-xl">
                  <Ionicons name="star" size={24} color="#8B5CF6" />
                </View>
                <Text className="text-lg font-bold text-gray-900 ml-3">
                  Facilities & Amenities
                </Text>
              </View>
              <Text className="text-gray-700 text-base leading-7">
                {hostel.facilities}
              </Text>
            </View>

            {/* Eligibility Card */}
            <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="bg-orange-100 p-2 rounded-xl">
                  <Ionicons name="checkmark-circle" size={24} color="#F97316" />
                </View>
                <Text className="text-lg font-bold text-gray-900 ml-3">
                  Eligibility Criteria
                </Text>
              </View>
              <Text className="text-gray-700 text-base leading-7">
                {hostel.eligibility}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-2xl">
          <SafeAreaView edges={["bottom"]}>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => Linking.openURL(`tel:${hostel.contact_phone}`)}
                className="flex-1 bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center active:bg-blue-700 shadow-lg"
                style={{ elevation: 4 }}
              >
                <Ionicons name="call" size={22} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Call Now
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const message = `Hi, I'm interested in ${hostel.name}. Can you provide more information?`;
                  Linking.openURL(
                    `sms:${hostel.contact_phone}?body=${encodeURIComponent(
                      message
                    )}`
                  );
                }}
                className="bg-gray-800 py-4 px-5 rounded-2xl flex-row items-center justify-center active:bg-gray-900 shadow-lg"
                style={{ elevation: 4 }}
              >
                <Ionicons name="chatbubbles" size={22} color="white" />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* Fullscreen Image Gallery Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <StatusBar hidden />
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            {/* Close Button */}
            <Pressable
              onPress={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 p-3 rounded-full"
              style={{ elevation: 5 }}
            >
              <Ionicons name="close" size={28} color="white" />
            </Pressable>

            {/* Image Counter */}
            <View className="absolute top-4 left-4 z-10 bg-black/60 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">
                {currentImageIndex + 1} / {hostel.images.length}
              </Text>
            </View>

            {/* Fullscreen Image */}
            <View className="flex-1 justify-center items-center">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width, height }}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Navigation Arrows */}
            {hostel.images.length > 1 && (
              <View className="absolute inset-0 flex-row justify-between items-center px-4 pointer-events-none">
                <Pressable
                  onPress={() => navigateImage("prev")}
                  className="bg-white/20 backdrop-blur-xl p-4 rounded-full pointer-events-auto"
                  style={{ elevation: 5 }}
                >
                  <Ionicons name="chevron-back" size={28} color="white" />
                </Pressable>

                <Pressable
                  onPress={() => navigateImage("next")}
                  className="bg-white/20 backdrop-blur-xl p-4 rounded-full pointer-events-auto"
                  style={{ elevation: 5 }}
                >
                  <Ionicons name="chevron-forward" size={28} color="white" />
                </Pressable>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}
