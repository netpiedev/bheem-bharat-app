import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getUserIdFromToken } from "@/app/lib/jwt";
import {
  addToWishlist,
  getMyProfile,
  getProfileById,
  getWishlist,
  removeFromWishlist,
} from "@/app/lib/matrimony.api";
import { WhiteHeader } from "../components/WhiteHeader";

/* =======================================================
   PROFILE DETAILS SCREEN (SINGLE FILE)
======================================================= */
export default function ProfileDetailsScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  /* ---------------- DATA ---------------- */
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["matrimony-profile", profileId],
    queryFn: () => getProfileById(profileId!),
    enabled: !!profileId,
    retry: false,
  });

  const { data: myProfile, isLoading: loadingMyProfile } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  useQuery({
    queryKey: ["matrimony-wishlist"],
    queryFn: async () => {
      const wishlist = await getWishlist();
      if (Array.isArray(wishlist) && profileId) {
        setIsInWishlist(wishlist.some((i) => i.profile_id === profileId));
      }
      return wishlist;
    },
    enabled: !!profileId,
  });

  /* ---------------- MUTATIONS ---------------- */
  const addMutation = useMutation({
    mutationFn: () => addToWishlist(profileId!),
    onSuccess: () => {
      setIsInWishlist(true);
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromWishlist(profileId!),
    onSuccess: () => {
      setIsInWishlist(false);
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
    },
  });

  /* ---------------- CHAT ---------------- */
  const handleStartChat = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token || !profile) return;

    const myUserId = getUserIdFromToken(token);
    if (myUserId === profile.user_id) {
      Alert.alert("Error", "You cannot chat with yourself");
      return;
    }

    router.push({
      pathname: "/(matrimony)/chat" as any,
      params: {
        otherUserId: profile.user_id,
        otherUserName: profile.user.name || "User",
      },
    });
  };

  /* ---------------- STATES ---------------- */
  if (isLoading || (loadingMyProfile && !profile)) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Profile" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (!profile && !loadingMyProfile && !myProfile) {
    return <Redirect href="/(matrimony)/currentUserProfile" />;
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Profile" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Profile not found</Text>
        </View>
      </View>
    );
  }

  /* ---------------- DERIVED ---------------- */
  const dob = profile.user?.dob || profile.dob;
  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : null;

  /* =======================================================
     UI
  ======================================================= */
  return (
    <View className="flex-1 bg-gray-50">
      <WhiteHeader title="Profile Details" />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* HERO IMAGE */}
        <View className="items-center mb-8">
          {profile.images?.length > 0 ? (
            <Pressable
              onPress={() => {
                setSelectedImage(profile.images[0]);
                setViewerVisible(true);
              }}
            >
              <Image
                source={profile.images[0]}
                style={{ width: 120, height: 120, borderRadius: 60 }}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ) : (
            <View className="w-28 h-28 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="person" size={56} color="#2563EB" />
            </View>
          )}

          <Text className="text-2xl font-bold mt-4">
            {profile.user.name || "Anonymous"}
          </Text>

          {age && (
            <Text className="text-gray-600 mt-1">
              {age} yrs • {profile.gender}
            </Text>
          )}
        </View>

        {/* GALLERY */}
        {profile.images?.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold mb-3">Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profile.images.map((img, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setSelectedImage(img);
                    setViewerVisible(true);
                  }}
                  className="mr-3"
                >
                  <Image
                    source={img}
                    style={{ width: 130, height: 130, borderRadius: 16 }}
                    contentFit="cover"
                    transition={200}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ACTIONS */}
        <View className="flex-row mb-8">
          <Pressable
            onPress={handleStartChat}
            className="flex-1 bg-blue-600 py-4 rounded-xl mr-2 items-center"
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="white" />
            <Text className="text-white font-semibold mt-1">Chat</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              isInWishlist ? removeMutation.mutate() : addMutation.mutate()
            }
            className={`flex-1 py-4 rounded-xl ml-2 items-center border ${
              isInWishlist
                ? "bg-red-50 border-red-200"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist ? "#EF4444" : "#2563EB"}
            />
            <Text
              className={`font-semibold mt-1 ${
                isInWishlist ? "text-red-600" : "text-blue-600"
              }`}
            >
              {isInWishlist ? "Wishlisted" : "Wishlist"}
            </Text>
          </Pressable>
        </View>

        {/* PERSONAL */}
        <InfoCard title="Personal Details">
          {age && (
            <Detail label="Age" value={`${age}`} icon="calendar-outline" />
          )}
          {profile.height && (
            <Detail
              label="Height"
              value={`${profile.height} cm`}
              icon="resize-outline"
            />
          )}
          {profile.city && (
            <Detail label="City" value={profile.city} icon="location-outline" />
          )}
          {profile.state && (
            <Detail label="State" value={profile.state} icon="map-outline" />
          )}
          {profile.religion && (
            <Detail
              label="Religion"
              value={profile.religion}
              icon="book-outline"
            />
          )}
          {profile.caste && (
            <Detail label="Caste" value={profile.caste} icon="people-outline" />
          )}
        </InfoCard>

        {/* PROFESSIONAL */}
        <InfoCard title="Professional Details">
          {profile.education && (
            <Detail
              label="Education"
              value={profile.education}
              icon="school-outline"
            />
          )}
          {profile.profession && (
            <Detail
              label="Profession"
              value={profile.profession}
              icon="briefcase-outline"
            />
          )}
          {profile.income && (
            <Detail label="Income" value={profile.income} icon="cash-outline" />
          )}
        </InfoCard>

        {/* ABOUT */}
        {profile.about_me_text && (
          <InfoCard title="About Me">
            <Text className="text-gray-700 leading-6">
              {profile.about_me_text}
            </Text>
          </InfoCard>
        )}
      </ScrollView>

      {/* FULL SCREEN IMAGE VIEWER */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View className="flex-1 bg-black">
          <Pressable
            onPress={() => {
              setViewerVisible(false);
              setSelectedImage(null);
            }}
            className="absolute top-12 right-6 z-10"
          >
            <Ionicons name="close" size={32} color="white" />
          </Pressable>

          {selectedImage && (
            <Image
              source={selectedImage}
              style={{ flex: 1 }}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

/* =======================================================
   UI HELPERS
======================================================= */
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
      <Text className="text-lg font-bold mb-4">{title}</Text>
      {children}
    </View>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <View className="flex-row items-center mb-3">
      <Ionicons name={icon as any} size={18} color="#6B7280" />
      <Text className="ml-3 flex-1 text-gray-600">{label}</Text>
      <Text className="font-semibold text-gray-900">{value}</Text>
    </View>
  );
}
