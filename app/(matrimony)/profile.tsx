import { getUserIdFromToken } from "@/app/lib/jwt";
import {
  addToWishlist,
  createProfile,
  getMyProfile,
  getProfileById,
  removeFromWishlist,
} from "@/app/lib/matrimony.api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
import { WhiteHeader } from "../components/WhiteHeader";

/* =======================================================
   PROFILE DETAILS SCREEN
======================================================= */
export default function ProfileDetailsScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(false);

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

  const { data: myProfile, isLoading: isLoadingMyProfile } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

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
      Alert.alert("Added", "Profile added to wishlist");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromWishlist(profileId!),
    onSuccess: () => {
      setIsInWishlist(false);
      queryClient.invalidateQueries({ queryKey: ["matrimony-wishlist"] });
      Alert.alert("Removed", "Profile removed from wishlist");
    },
  });

  const handleStartChat = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token || !profile) return;

    const currentUserId = getUserIdFromToken(token);
    if (profile.user_id === currentUserId) {
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

  const is404 = (error as any)?.response?.status === 404;

  if (isLoading || (isLoadingMyProfile && !profile)) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title="Profile" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if ((!profile || is404) && !isLoadingMyProfile && !myProfile) {
    return <CreateProfileForm />;
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

  const age = profile.dob
    ? new Date().getFullYear() - new Date(profile.dob).getFullYear()
    : null;

  return (
    <View className="flex-1 bg-gray-50">
      <WhiteHeader title="Profile Details" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* HERO */}
        <View className="items-center mb-8">
          <View className="w-28 h-28 rounded-full bg-blue-50 items-center justify-center mb-4">
            <Ionicons name="person" size={56} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold">
            {profile.user.name || "Anonymous"}
          </Text>
          <Text className="text-gray-600 mt-1">
            {age ? `${age} yrs` : "Age N/A"} • {profile.gender}
          </Text>

          {profile.is_verified && (
            <View className="flex-row items-center mt-3 bg-green-50 px-4 py-1.5 rounded-full">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-green-700 text-xs ml-2 font-semibold">
                Verified Profile
              </Text>
            </View>
          )}
        </View>

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

        {/* DETAILS */}
        <InfoCard title="Personal Details">
          {age && (
            <DetailRow icon="calendar-outline" label="Age" value={`${age}`} />
          )}
          {profile.city && (
            <DetailRow
              icon="location-outline"
              label="City"
              value={profile.city}
            />
          )}
          {profile.religion && (
            <DetailRow
              icon="book-outline"
              label="Religion"
              value={profile.religion}
            />
          )}
        </InfoCard>

        <InfoCard title="Professional Details">
          {profile.education && (
            <DetailRow
              icon="school-outline"
              label="Education"
              value={profile.education}
            />
          )}
          {profile.profession && (
            <DetailRow
              icon="briefcase-outline"
              label="Profession"
              value={profile.profession}
            />
          )}
          {profile.income && (
            <DetailRow
              icon="cash-outline"
              label="Income"
              value={profile.income}
            />
          )}
        </InfoCard>

        {profile.about_me && (
          <View className="bg-blue-50 rounded-2xl p-5">
            <Text className="text-lg font-bold mb-2">About Me</Text>
            <Text className="text-gray-700 leading-6">{profile.about_me}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* =======================================================
   SHARED UI COMPONENTS
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
      <Ionicons name={icon as any} size={18} color="#6B7280" />
      <Text className="ml-3 flex-1 text-gray-600">{label}</Text>
      <Text className="font-semibold text-gray-900">{value}</Text>
    </View>
  );
}

/* =======================================================
   CREATE PROFILE FORM
======================================================= */
function CreateProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  const createMutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries();
      Alert.alert("Success", "Profile created", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
  });

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title="Create Profile" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="text-3xl font-bold mb-2">Create Your Profile</Text>
          <Text className="text-gray-600 mb-8">
            Help others know you better 💙
          </Text>

          <Input
            label="Date of Birth (YYYY-MM-DD)"
            value={dob}
            onChange={setDob}
          />
          <Input label="City" value={city} onChange={setCity} />
          <Input
            label="Profession"
            value={profession}
            onChange={setProfession}
          />
          <Input
            label="About Me"
            value={aboutMe}
            onChange={setAboutMe}
            multiline
          />

          <Pressable
            onPress={() =>
              createMutation.mutate({
                gender,
                dob,
                city,
                profession,
                about_me: aboutMe,
              })
            }
            className="bg-blue-600 py-5 rounded-2xl items-center mt-6"
          >
            <Text className="text-white font-bold text-lg">
              Save & Continue
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Input({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View className="mb-5">
      <Text className="font-semibold mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        className="bg-white border border-gray-200 rounded-xl px-4 py-4 shadow-sm"
      />
    </View>
  );
}
