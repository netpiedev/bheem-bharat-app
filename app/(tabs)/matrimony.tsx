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
          Find Your Life Partner
        </Text>
        <Text className="text-blue-100 mb-4">
          Verified profiles • Trusted matches
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(matrimony)/browse")}
          className="flex-row items-center bg-white rounded-full px-4 py-3"
        >
          <Ionicons name="search" size={18} color="#2563EB" />
          <Text className="ml-3 text-gray-500 flex-1">
            Search by name, city, profession
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
              {g === "MALE" ? "Groom" : "Bride"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FEATURED */}
      <SectionHeader
        title="Featured Profiles"
        onPress={() => router.push("/(matrimony)/browse")}
      />

      {isLoading ? (
        <ActivityIndicator className="mt-10" size="large" color="#2563EB" />
      ) : isError ? (
        <Text className="text-red-500 mx-5">Failed to load profiles</Text>
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
          title="Browse"
          onPress={() => router.push("/(matrimony)/browse")}
        />
        <QuickCard
          icon="heart-outline"
          title="Wishlist"
          onPress={() => router.push("/(matrimony)/wishlist")}
        />
        <QuickCard
          icon="chatbubble-outline"
          title="Chats"
          onPress={() => router.push("/(matrimony)/chats")}
        />
      </View>

      {/* CREATE PROFILE CTA */}
      {!myProfile && (
        <View className="mx-5 mt-8 bg-blue-600 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-1">
            Create Your Profile
          </Text>
          <Text className="text-blue-100 mb-4">
            Start connecting with verified profiles today
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(matrimony)/profile")}
            className="bg-white py-3 rounded-xl items-center"
          >
            <Text className="text-blue-600 font-semibold text-base">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SectionHeader({ title, onPress }: any) {
  return (
    <View className="mx-5 mt-8 mb-3 flex-row justify-between items-center">
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-blue-600 font-medium">View All</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProfileCard({ profile, onPress }: any) {
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
          {profile.user?.name || "Anonymous"}
          {age ? `, ${age}` : ""}
        </Text>
        <Text className="text-gray-200 text-sm">
          {profile.profession || "Profession not specified"}
        </Text>
        <Text className="text-gray-300 text-sm">
          {profile.city || "City not specified"}
        </Text>

        <View className="mt-3 bg-white py-2 rounded-xl items-center">
          <Text className="font-semibold text-gray-900">View Profile</Text>
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
