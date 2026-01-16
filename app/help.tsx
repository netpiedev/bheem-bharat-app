import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

export default function HelpScreen() {
  const supportEmail = "bharatbheem580@gmail.com";

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}`);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: true, title: "Help & Support" }} />

      {/* Header Area */}
      <View className="bg-white p-6 border-b border-gray-100">
        <Text className="text-3xl font-bold text-gray-900">
          How can we help?
        </Text>
        <Text className="text-gray-500 mt-2 text-base">
          Our team is here to support you. Reach out through any of the channels
          below.
        </Text>
      </View>

      <View className="p-6">
        {/* Contact Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="mail-outline" size={26} color="#0B5ED7" />
          </View>

          <Text className="text-xl font-semibold text-gray-900">
            Email Support
          </Text>
          <Text className="text-gray-500 mt-2 mb-6 leading-5">
            For technical issues, account inquiries, or feedback, send us an
            email and we'll get back to you within 24 hours.
          </Text>

          <Pressable
            onPress={handleEmailPress}
            className="bg-[#0B5ED7] py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-base">Send Email</Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View className="px-2">
          <Text className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
            Office Hours
          </Text>
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={18} color="#9CA3AF" />
            <Text className="ml-3 text-gray-600">
              Monday - Friday: 9 AM - 6 PM
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#9CA3AF" />
            <Text className="ml-3 text-gray-600">Based in India</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
