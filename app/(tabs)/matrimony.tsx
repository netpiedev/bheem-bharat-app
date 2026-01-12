import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getProfiles, getMyProfile } from "@/app/lib/matrimony.api";
import { useQuery } from "@tanstack/react-query";

// Updated ProfileCardProps to align with API data (age as number, optional keys)
type ProfileCardProps = {
  name: string;
  age?: number;
  job?: string | null;
  city?: string | null;
  image?: string | null;
  grayscale?: boolean;
};

type StatCardProps = {
  title: string;
  subtitle: string;
};

export default function Matrimony() {
  // Fetch profiles from API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["matrimony-profiles"],
    queryFn: () => getProfiles({ limit: 10 }), // display 10 max for overview
  });

  // Fetch current user's matrimony profile
  const {
    data: myProfile,
    isLoading: isLoadingMyProfile,
    error: myProfileError,
  } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 px-5 pt-12 pb-8 rounded-b-3xl">
        <Text className="text-white text-xl font-bold mb-4">
          Find Your Life Partner
        </Text>
        <View className="flex-row items-center bg-white rounded-full px-4 py-3">
          <TextInput
            placeholder="Search by name, city, profession"
            className="flex-1 text-gray-600"
          />
          <Text className="text-blue-600 text-lg">⚙️</Text>
        </View>
      </View>

      {/* Groom / Bride Tabs */}
      <View className="mx-5 mt-5 bg-blue-50 rounded-xl flex-row">
        <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-xl items-center">
          <Text className="text-white font-semibold">👤 Groom</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 items-center">
          <Text className="text-gray-500 font-semibold">🤍 Bride</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Profiles */}
      <View className="mx-5 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-lg">⭐ Featured Profiles</Text>
          <Text className="text-blue-600">View All</Text>
        </View>
        {isLoading ? (
          <View className="h-72 flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : isError ? (
          <View className="h-40 items-center justify-center">
            <Text className="text-red-500">Failed to load profiles</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(data?.data?.slice(0, 5) || []).map((profile: any, i: number) => {
              // age calculation
              let age: number | undefined;
              if (profile.dob) {
                const dob = new Date(profile.dob);
                const now = new Date();
                age = now.getFullYear() - dob.getFullYear();
                const m = now.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
                  age--;
                }
              }
              const userImg =
                profile.user?.avatar ??
                `https://i.pravatar.cc/300?img=${11 + i}`;
              return (
                <ProfileCard
                  key={profile.id || i}
                  name={
                    profile.user?.name ||
                    profile.user?.fullName ||
                    profile.user?.displayName ||
                    "Anonymous"
                  }
                  age={age}
                  job={profile.profession || null}
                  city={profile.city || profile.region || ""}
                  image={userImg}
                  grayscale={i % 2 === 1}
                />
              );
            })}
            {/* Show at least 1 fallback if no API data */}
            {(!data?.data || data.data.length === 0) && (
              <ProfileCard
                name="Rahul Ambedkar"
                age={28}
                job="Business Analyst"
                city="Pune"
                image="https://i.pravatar.cc/300?img=12"
                grayscale={false}
              />
            )}
          </ScrollView>
        )}
      </View>

      {/* Browse All */}
      <View className="mx-5 mt-6 bg-blue-50 rounded-xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="font-semibold">Browse All Profiles</Text>
          <Text className="text-gray-500">
            {data?.total || "5,000+"} verified profiles
          </Text>
        </View>
        <Text className="text-blue-600 text-xl">➡️</Text>
      </View>

      {/* Create Profile */}
      {!myProfile && !isLoadingMyProfile && (
        <View className="mx-5 mt-6 bg-blue-600 rounded-xl p-5">
          <Text className="text-white text-lg font-bold mb-2">
            Create Your Profile
          </Text>
          <Text className="text-blue-100 mb-4">
            Join thousands of verified profiles
          </Text>
          <TouchableOpacity className="bg-white py-3 rounded-full items-center">
            <Text className="text-blue-600 font-semibold">Get Started</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats */}
      <View className="mx-5 my-6 flex-row justify-between">
        <StatCard
          title={`${data?.total || "500+"}`}
          subtitle="Success Stories"
        />
        <StatCard
          title={`${data?.total || "100%"}`}
          subtitle="Verified Profiles"
        />
      </View>
    </ScrollView>
  );
}

/* Components */
function ProfileCard({
  name,
  age,
  job,
  city,
  image,
  grayscale,
}: ProfileCardProps) {
  return (
    <View className="w-60 mr-4 bg-black rounded-2xl overflow-hidden">
      <Image
        source={{ uri: image || "https://i.pravatar.cc/300" }}
        className="w-full h-72"
        style={{ opacity: grayscale ? 0.7 : 1 }}
      />
      <View className="absolute bottom-0 w-full p-4 bg-black/60">
        <Text className="text-white font-bold text-lg">
          {name}
          {age !== undefined ? `, ${age}` : ""}
        </Text>
        <Text className="text-gray-200">{job}</Text>
        <Text className="text-gray-300">📍 {city}</Text>
        <TouchableOpacity className="bg-white mt-3 py-2 rounded-full items-center">
          <Text className="font-semibold">View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ title, subtitle }: StatCardProps) {
  return (
    <View className="w-[48%] border border-blue-100 rounded-xl p-4 items-center">
      <Text className="text-blue-600 text-lg font-bold">{title}</Text>
      <Text className="text-gray-500">{subtitle}</Text>
    </View>
  );
}
