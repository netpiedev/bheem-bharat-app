import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addToWishlist,
  createProfile,
  getMyProfile,
  getProfileById,
  removeFromWishlist,
} from "@/app/lib/matrimony.api";
import { getUserIdFromToken } from "@/app/lib/jwt";
import { WhiteHeader } from "../components/WhiteHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileDetailsScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["matrimony-profile", profileId],
    queryFn: () => getProfileById(profileId!),
    enabled: !!profileId,
    retry: false,
  });

  // Check if current user has a profile (to show create form if needed)
  const { data: myProfile, isLoading: isLoadingMyProfile } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  // Check if in wishlist
  useQuery({
    queryKey: ["matrimony-wishlist"],
    queryFn: async () => {
      const wishlist = await queryClient.fetchQuery({
        queryKey: ["matrimony-wishlist"],
      });
      if (Array.isArray(wishlist)) {
        const found = wishlist.some((item) => item.profile_id === profileId);
        setIsInWishlist(found);
      }
      return wishlist;
    },
    enabled: !!profileId,
  });

  const addMutation = useMutation({
    mutationFn: () => addToWishlist(profileId!),
    onSuccess: () => {
      setIsInWishlist(true);
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
      Alert.alert("Success", "Added to wishlist");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to add to wishlist"
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromWishlist(profileId!),
    onSuccess: () => {
      setIsInWishlist(false);
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
      Alert.alert("Success", "Removed from wishlist");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to remove from wishlist"
      );
    },
  });

  const handleStartChat = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !profile) return;

      const currentUserId = getUserIdFromToken(token);
      if (!currentUserId) {
        Alert.alert("Error", "Unable to identify user");
        return;
      }

      if (profile.user_id === currentUserId) {
        Alert.alert("Error", "Cannot chat with yourself");
        return;
      }

      router.push({
        pathname: "/(matrimony)/chat" as any,
        params: { otherUserId: profile.user_id, otherUserName: profile.user.name || "User" },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to start chat");
    }
  };

  const is404Error = (error as any)?.response?.status === 404;
  const hasFinishedLoadingMyProfile = !isLoadingMyProfile;

  // Show loading while initial profile or my profile is loading
  if (isLoading || (isLoadingMyProfile && !profile)) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Profile" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  // Show create form if:
  // 1. Profile not found (404 error or no profile data after loading)
  // 2. User doesn't have their own profile (myProfile is null/undefined after loading)
  // 3. My profile query has finished loading
  if ((!profile || is404Error) && hasFinishedLoadingMyProfile && !myProfile) {
    return <CreateProfileForm />;
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Profile" />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500">Profile not found</Text>
        </View>
      </View>
    );
  }

  const age = profile.dob
    ? new Date().getFullYear() - new Date(profile.dob).getFullYear()
    : null;

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title="Profile Details" />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {profile.user.name || "Anonymous"}
          </Text>
          <Text className="text-gray-600 mt-1">
            {age ? `${age} years` : "Age not specified"} • {profile.gender}
          </Text>
          {profile.is_verified && (
            <View className="flex-row items-center mt-2 bg-green-100 px-3 py-1 rounded-full">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-green-700 text-xs ml-1 font-semibold">
                Verified
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row mb-6">
          <Pressable
            onPress={handleStartChat}
            className="flex-1 bg-blue-600 py-3 rounded-lg mr-2 items-center"
          >
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text className="text-white font-semibold mt-1">Message</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              isInWishlist
                ? removeMutation.mutate()
                : addMutation.mutate()
            }
            className={`flex-1 py-3 rounded-lg ml-2 items-center ${
              isInWishlist ? "bg-red-100" : "bg-gray-100"
            }`}
            disabled={addMutation.isPending || removeMutation.isPending}
          >
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist ? "#EF4444" : "#6B7280"}
            />
            <Text
              className={`font-semibold mt-1 ${
                isInWishlist ? "text-red-600" : "text-gray-700"
              }`}
            >
              {isInWishlist ? "Remove" : "Wishlist"}
            </Text>
          </Pressable>
        </View>

        {/* Details */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Personal Details
          </Text>
          {age && (
            <DetailRow icon="calendar" label="Age" value={`${age} years`} />
          )}
          {profile.height && (
            <DetailRow
              icon="resize"
              label="Height"
              value={`${profile.height} cm`}
            />
          )}
          {profile.city && (
            <DetailRow icon="location" label="City" value={profile.city} />
          )}
          {profile.religion && (
            <DetailRow icon="book" label="Religion" value={profile.religion} />
          )}
          {profile.caste && (
            <DetailRow icon="people" label="Caste" value={profile.caste} />
          )}
        </View>

        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Professional Details
          </Text>
          {profile.education && (
            <DetailRow
              icon="school"
              label="Education"
              value={profile.education}
            />
          )}
          {profile.profession && (
            <DetailRow
              icon="briefcase"
              label="Profession"
              value={profile.profession}
            />
          )}
          {profile.income && (
            <DetailRow icon="cash" label="Income" value={profile.income} />
          )}
        </View>

        {profile.about_me && (
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              About Me
            </Text>
            <Text className="text-gray-700 leading-6">{profile.about_me}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center mb-3">
      <Ionicons name={icon as any} size={20} color="#6B7280" />
      <Text className="text-gray-600 ml-3 flex-1">{label}:</Text>
      <Text className="text-gray-900 font-semibold">{value}</Text>
    </View>
  );
}

function CreateProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dob, setDob] = useState("");
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [city, setCity] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  const createMutation = useMutation({
    mutationFn: createProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matrimony-profile"] });
      queryClient.invalidateQueries({ queryKey: ["matrimony-my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["matrimony-profiles"] });
      Alert.alert("Success", "Profile created successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create profile"
      );
    },
  });

  const handleSubmit = () => {
    if (!dob) {
      Alert.alert("Error", "Date of birth is required");
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      Alert.alert("Error", "Date of birth must be in YYYY-MM-DD format");
      return;
    }

    createMutation.mutate({
      gender,
      dob,
      height: height ? parseInt(height, 10) : null,
      religion: religion || null,
      caste: caste || null,
      city: city || null,
      education: education || null,
      profession: profession || null,
      income: income || null,
      about_me: aboutMe || null,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title="Create Profile" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Create Matrimony Profile
          </Text>
          <Text className="text-gray-600 mb-6">
            Fill in your details to create your matrimony profile
          </Text>

          {/* Gender */}
          <Text className="text-gray-900 font-semibold mb-2">Gender *</Text>
          <View className="flex-row mb-4">
            {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                className={`flex-1 mx-1 py-3 rounded-xl border items-center ${
                  gender === g
                    ? "bg-blue-50 border-blue-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-medium ${
                    gender === g ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Date of Birth */}
          <Text className="text-gray-900 font-semibold mb-2">
            Date of Birth * (YYYY-MM-DD)
          </Text>
          <TextInput
            value={dob}
            onChangeText={setDob}
            placeholder="2000-01-01"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Height */}
          <Text className="text-gray-900 font-semibold mb-2">Height (cm)</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            keyboardType="numeric"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Religion */}
          <Text className="text-gray-900 font-semibold mb-2">Religion</Text>
          <TextInput
            value={religion}
            onChangeText={setReligion}
            placeholder="Enter your religion"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Caste */}
          <Text className="text-gray-900 font-semibold mb-2">Caste</Text>
          <TextInput
            value={caste}
            onChangeText={setCaste}
            placeholder="Enter your caste"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* City */}
          <Text className="text-gray-900 font-semibold mb-2">City</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Education */}
          <Text className="text-gray-900 font-semibold mb-2">Education</Text>
          <TextInput
            value={education}
            onChangeText={setEducation}
            placeholder="Enter your education"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Profession */}
          <Text className="text-gray-900 font-semibold mb-2">Profession</Text>
          <TextInput
            value={profession}
            onChangeText={setProfession}
            placeholder="Enter your profession"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Income */}
          <Text className="text-gray-900 font-semibold mb-2">Income</Text>
          <TextInput
            value={income}
            onChangeText={setIncome}
            placeholder="Enter your income"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* About Me */}
          <Text className="text-gray-900 font-semibold mb-2">About Me</Text>
          <TextInput
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-blue-600 py-4 rounded-xl items-center mb-6 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Create Profile
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

