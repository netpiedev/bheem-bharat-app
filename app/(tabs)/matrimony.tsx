"use client";

import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getMyProfile, getProfiles } from "@/app/lib/matrimony.api";
import { useLanguage } from "@/app/lib/LanguageContext";
import type { MatrimonyProfileWithUser } from "@/app/types/matrimony.types";

/* ------------------ FALLBACK AVATARS ------------------ */
const FEMALE_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/042/332/066/non_2x/person-photo-placeholder-woman-default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-social-media-free-vector.jpg";

const MALE_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg";

/* ------------------ HELPERS ------------------ */
const calculateAge = (dob?: string | null) => {
  if (!dob) return undefined;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/**
 * IMAGE PRIORITY (Professional Matrimony Standard)
 * 1️⃣ profile.images[0]
 * 2️⃣ user.photo
 * 3️⃣ gender based avatar
 */
const getProfileImage = (profile: MatrimonyProfileWithUser) => {
  if (profile.images?.length && profile.images[0]) {
    return profile.images[0];
  }

  if (profile.user?.photo && profile.user.photo.startsWith("http")) {
    return profile.user.photo;
  }

  return profile.gender === "FEMALE" ? FEMALE_AVATAR : MALE_AVATAR;
};

/* ------------------ SCREEN ------------------ */
export default function MatrimonyTab() {
  const router = useRouter();
  const { t } = useLanguage();
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["matrimony-profiles", gender],
    queryFn: () => getProfiles({ gender, limit: 10 }),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View className="bg-blue-600 px-5 pt-12 pb-8 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold mb-2">
          {t("matrimony_find_partner")}
        </Text>
        <Text className="text-blue-100 mb-4">
          {t("matrimony_verified_profiles")}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(matrimony)/browse")}
          className="flex-row items-center bg-white rounded-full px-4 py-3"
        >
          <Ionicons name="search" size={18} color="#2563EB" />
          <Text className="ml-3 text-gray-500 flex-1">
            {t("matrimony_search_placeholder")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* GENDER FILTER */}
      <View className="mx-5 mt-5 bg-blue-50 rounded-2xl flex-row p-1">
        {(["MALE", "FEMALE"] as const).map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setGender(g)}
            className={`flex-1 py-3 rounded-xl items-center ${
              gender === g ? "bg-blue-600" : ""
            }`}
          >
            <Text
              className={`font-semibold ${
                gender === g ? "text-white" : "text-gray-500"
              }`}
            >
              {g === "MALE" ? t("matrimony_groom") : t("matrimony_bride")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FEATURED */}
      <SectionHeader
        title={t("matrimony_featured_profiles")}
        onPress={() => router.push("/(matrimony)/browse")}
      />

      {isLoading ? (
        <ActivityIndicator className="mt-10" size="large" color="#2563EB" />
      ) : isError ? (
        <Text className="text-red-500 mx-5">{t("matrimony_load_error")}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5"
        >
          {data?.data?.slice(0, 5).map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onPress={() =>
                router.push({
                  pathname: "/(matrimony)/profile",
                  params: { profileId: profile.id },
                })
              }
            />
          ))}
        </ScrollView>
      )}

      {/* QUICK ACTIONS */}
      <View className="mx-5 mt-6 flex-row justify-between">
        <QuickCard
          icon="people-outline"
          title={t("matrimony_browse")}
          onPress={() => router.push("/(matrimony)/browse")}
        />
        <QuickCard
          icon="heart-outline"
          title={t("matrimony_wishlist")}
          onPress={() => router.push("/(matrimony)/wishlist")}
        />
        <QuickCard
          icon="chatbubble-outline"
          title={t("matrimony_chats")}
          onPress={() => router.push("/(matrimony)/chats")}
        />
      </View>

      {/* CREATE PROFILE CTA */}
      {!myProfile && (
        <View className="mx-5 mt-8 bg-blue-600 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-1">
            {t("matrimony_create_profile")}
          </Text>
          <Text className="text-blue-100 mb-4">
            {t("matrimony_create_profile_desc")}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(matrimony)/profile")}
            className="bg-white py-3 rounded-xl items-center"
          >
            <Text className="text-blue-600 font-semibold text-base">
              {t("matrimony_get_started")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SectionHeader({ title, onPress }: any) {
  const { t } = useLanguage();
  return (
    <View className="mx-5 mt-8 mb-3 flex-row justify-between items-center">
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-blue-600 font-medium">{t("matrimony_view_all")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProfileCard({ profile, onPress }: any) {
  const { t } = useLanguage();
  const age = calculateAge(profile.dob);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-64 mr-4 rounded-2xl overflow-hidden bg-black"
    >
      <Image
        source={getProfileImage(profile)}
        style={{ width: "100%", height: 288 }}
        contentFit="cover"
        transition={200}
      />

      <View className="absolute bottom-0 w-full p-4 bg-black/60">
        <Text className="text-white font-bold text-lg">
          {profile.user?.name || t("matrimony_anonymous")}
          {age ? `, ${age}` : ""}
        </Text>
        <Text className="text-gray-200 text-sm">
          {profile.profession || t("matrimony_profession_not_specified")}
        </Text>
        <Text className="text-gray-300 text-sm">
          {profile.city || t("matrimony_city_not_specified")}
        </Text>

        <View className="mt-3 bg-white py-2 rounded-xl items-center">
          <Text className="font-semibold text-gray-900">{t("matrimony_view_profile")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickCard({ icon, title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[30%] bg-blue-50 rounded-xl py-5 items-center"
    >
      <Ionicons name={icon} size={22} color="#2563EB" />
      <Text className="mt-2 font-semibold text-gray-700">{title}</Text>
    </TouchableOpacity>
  );
}
