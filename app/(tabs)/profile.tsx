import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { deleteUserProfile, getUserProfile } from "@/app/lib/auth.api";
import { useLanguage } from "@/app/lib/LanguageContext";

type Lang = "en" | "hi" | "mr" | "bn";

export default function Profile() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();

  // Fetch user profile from API
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: 1,
  });

  const user = profileData?.user;

  // Format date for display
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      t("profile_logout") || "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await GoogleSignin.signOut();
            await AsyncStorage.multiRemove([
              "token",
              "user",
              "mobileNumber",
              "userState",
            ]);
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be removed. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserProfile();
              await GoogleSignin.signOut();
              await AsyncStorage.multiRemove([
                "token",
                "user",
                "mobileNumber",
                "userState",
              ]);
              router.replace("/(auth)/login");
            } catch (error) {
              Alert.alert(
                "Error",
                "Could not delete account. Please try again later."
              );
            }
          },
        },
      ]
    );
  };

  // Compute menu items on every render to ensure instant updates
  const MENU_ITEMS = [
    {
      id: 1,
      title: t("profile_matrimony"),
      subtitle: t("profile_matrimony_sub"),
      icon: "heart-outline",
      onPress: () => router.push("/(matrimony)/currentUserProfile" as any),
    },
    {
      id: 4,
      title: t("profile_privacy"),
      subtitle: t("profile_privacy_sub"),
      icon: "shield-checkmark-outline",
      onPress: () =>
        WebBrowser.openBrowserAsync("https://legal.bheembharat.com"),
    },
    {
      id: 5,
      title: t("profile_language"),
      subtitle: t(`profile_lang_${lang}`),
      icon: "globe-outline",
      onPress: () => cycleLanguage(),
    },
    {
      id: 6,
      title: t("profile_help"),
      subtitle: t("profile_help_sub"),
      icon: "help-circle-outline",
      onPress: () => router.push("/help" as any),
    },
  ];

  // 🔁 Cycle language on click
  const cycleLanguage = () => {
    const order: Lang[] = ["en", "hi", "mr", "bn"];
    const next = order[(order.indexOf(lang) + 1) % order.length];
    setLang(next);
  };

  return (
    <View key={lang} className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="bg-[#0B5ED7] pb-24 rounded-b-[40px]">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
            <Text className="text-white text-2xl font-semibold">
              {t("profile_title")}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 -mt-20"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <View className="flex-row items-start">
            <View className="w-20 h-20 rounded-full bg-[#0B5ED7] items-center justify-center mr-4">
              <Ionicons name="person" size={40} color="white" />
            </View>

            <View className="flex-1 pt-1">
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#0B5ED7"
                  className="self-start mt-2"
                />
              ) : isError ? (
                <View>
                  <Text className="text-red-500 text-sm">
                    Failed to load profile
                  </Text>
                  <Pressable
                    onPress={() => refetch()}
                    className="mt-2 bg-blue-50 px-3 py-1 rounded-lg self-start"
                  >
                    <Text className="text-blue-600 text-xs font-medium">
                      Retry
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text
                    className="text-xl font-bold text-gray-900"
                    numberOfLines={1}
                  >
                    {user?.name || t("profile_name") || "User"}
                  </Text>

                  {/* Phone Number - Only shows if available, no masking */}
                  {user?.phone && (
                    <Text className="text-gray-600 text-[15px] mt-0.5">
                      +91 {user.phone}
                    </Text>
                  )}

                  {/* Location Info */}
                  {(user?.city || user?.state) && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#9CA3AF"
                      />
                      <Text
                        className="text-gray-500 text-sm ml-1"
                        numberOfLines={1}
                      >
                        {user?.city}
                        {user?.city && user?.state ? ", " : ""}
                        {user?.state}
                      </Text>
                    </View>
                  )}

                  {/* Personal Details Badges */}
                  <View className="flex-row flex-wrap mt-2 gap-2">
                    {user?.gender && (
                      <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                        <Text className="text-gray-500 text-[11px] font-medium uppercase">
                          {user.gender}
                        </Text>
                      </View>
                    )}
                    {user?.dob && (
                      <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                        <Text className="text-gray-500 text-[11px] font-medium uppercase">
                          {formatDate(user.dob)}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/profile")}
              className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"
            >
              <Ionicons name="create-outline" size={20} color="#374151" />
            </Pressable>
          </View>
        </View>

        {/* Menu */}
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 shadow-sm active:opacity-70"
          >
            <View className="w-12 h-12 rounded-2xl bg-[#EFF6FF] items-center justify-center mr-4">
              <Ionicons name={item.icon as any} size={24} color="#0B5ED7" />
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-gray-900 text-[15px]">
                {item.title}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {item.subtitle}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        ))}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mt-4 flex-row items-center justify-center p-4 rounded-2xl border border-red-100 bg-red-50"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold ml-2">
            {t("profile_logout") || "Logout"}
          </Text>
        </Pressable>

        {/* Delete account */}
        <Pressable
          onPress={handleDeleteAccount}
          className="mt-2 flex-row items-center justify-center p-4 rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-2">
            {/* Fallback logic to prevent the "missing translation" error message */}
            {t("profile_delete_account").includes("missing") ||
            t("profile_delete_account") === "profile_delete_account"
              ? "Delete Account"
              : t("profile_delete_account")}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
