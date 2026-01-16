import { createProfile, getMyProfile, uploadProfileImages } from "@/app/lib/matrimony.api";
import { getUserProfile } from "@/app/lib/auth.api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "@/app/lib/LanguageContext";
import { WhiteHeader } from "../components/WhiteHeader";

export default function CurrentUserProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  // GET CURRENT USER PROFILE
  const {
    data: myProfile,
    isLoading: isLoadingMyProfile,
    error: myProfileError,
  } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  // Show loading while profile is loading
  if (isLoadingMyProfile) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title={t("matrimony_my_profile")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  // If user does not have a profile, show create form
  if (!myProfile) {
    return <CreateProfileForm />;
  }

  // If there's an error (other than user not having a profile)
  if (myProfileError) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title={t("matrimony_my_profile")} />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500">
            {(
              myProfileError as unknown as {
                response?: { data?: { message?: string } };
              }
            )?.response?.data?.message || t("matrimony_load_profile_error")}
          </Text>
        </View>
      </View>
    );
  }

  // Use user.dob if available, otherwise fall back to profile.dob (for backward compatibility)
  const dobToUse = myProfile.user?.dob || myProfile.dob;
  const age = dobToUse
    ? new Date().getFullYear() - new Date(dobToUse).getFullYear()
    : null;

  const getImageUrl = (imageKey: string) => {
    if (imageKey.startsWith("https://")) {
      return imageKey;
    }
    return `${process.env.EXPO_PUBLIC_S3_URL}/${imageKey}`;
  };

  const primaryImage = myProfile.images && myProfile.images.length > 0 
    ? getImageUrl(myProfile.images[0]) 
    : null;

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title={t("matrimony_my_profile")} />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Profile Header */}
        <View className="items-center mb-6">
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              className="w-24 h-24 rounded-full mb-4"
              style={{ width: 96, height: 96 }}
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#9CA3AF" />
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-900">
            {myProfile.user?.name || t("matrimony_anonymous")}
          </Text>
          <Text className="text-gray-600 mt-1">
            {age ? `${age} ${t("matrimony_years")}` : t("matrimony_age_not_specified")} • {myProfile.gender}
          </Text>
          {myProfile.is_verified && (
            <View className="flex-row items-center mt-2 bg-green-100 px-3 py-1 rounded-full">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-green-700 text-xs ml-1 font-semibold">
                {t("matrimony_verified")}
              </Text>
            </View>
          )}
          {/* Edit Button */}
          <Pressable
            onPress={() => router.push("/(matrimony)/editProfile")}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">{t("matrimony_edit_profile")}</Text>
          </Pressable>
        </View>

        {/* Images Gallery */}
        {myProfile.images && myProfile.images.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              {t("matrimony_photos")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {myProfile.images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: getImageUrl(img) }}
                    className="w-32 h-32 rounded-xl mr-3"
                    style={{ width: 128, height: 128 }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Details */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            {t("matrimony_personal_details")}
          </Text>
          {age && (
            <DetailRow icon="calendar" label={t("matrimony_age")} value={`${age} ${t("matrimony_years")}`} />
          )}
          {myProfile.height && (
            <DetailRow
              icon="resize"
              label={t("profile_height_label")}
              value={`${myProfile.height} cm`}
            />
          )}
          {myProfile.city && (
            <DetailRow icon="location" label={t("profile_city")} value={myProfile.city} />
          )}
          {myProfile.religion && (
            <DetailRow
              icon="book"
              label={t("profile_religion_label")}
              value={myProfile.religion}
            />
          )}
          {myProfile.caste && (
            <DetailRow icon="people" label={t("profile_caste_label")} value={myProfile.caste} />
          )}
        </View>

        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            {t("matrimony_professional_details")}
          </Text>
          {myProfile.education && (
            <DetailRow
              icon="school"
              label={t("profile_education_label")}
              value={myProfile.education}
            />
          )}
          {myProfile.profession && (
            <DetailRow
              icon="briefcase"
              label={t("profile_occupation_label")}
              value={myProfile.profession}
            />
          )}
          {myProfile.income && (
            <DetailRow icon="cash" label={t("profile_income_label")} value={myProfile.income} />
          )}
        </View>

        {myProfile.about_me_text && (
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              {t("matrimony_about_me")}
            </Text>
            <Text className="text-gray-700 leading-6">
              {myProfile.about_me_text}
            </Text>
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

function formatDateString(dateObj: Date): string {
  return [
    dateObj.getFullYear(),
    (dateObj.getMonth() + 1).toString().padStart(2, "0"),
    dateObj.getDate().toString().padStart(2, "0"),
  ].join("-");
}

function parseDateString(str: string): Date | null {
  const parts = str.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function CreateProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dob, setDob] = useState("");
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [city, setCity] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [newImageUris, setNewImageUris] = useState<string[]>([]);
  const [userDob, setUserDob] = useState<string | null>(null);
  const [isDobDisabled, setIsDobDisabled] = useState(false);

  // Fetch user profile to check if dob exists
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  useEffect(() => {
    if (userProfile?.user?.dob) {
      const userDobDate = new Date(userProfile.user.dob);
      if (!isNaN(userDobDate.getTime())) {
        setUserDob(formatDateString(userDobDate));
        setDob(formatDateString(userDobDate));
        setDateObj(userDobDate);
        setIsDobDisabled(true);
      }
    }
  }, [userProfile]);

  const uploadImagesMutation = useMutation({
    mutationFn: ({ profileId, imageUris }: { profileId: string; imageUris: string[] }) =>
      uploadProfileImages(profileId, imageUris),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrimony-my-profile"] });
      setNewImageUris([]);
    },
    onError: (error: any) => {
      console.error("Failed to upload images:", error);
    },
  });

  
  // useEffect(() => {
  const createMutation = useMutation({
    mutationFn: createProfile,
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["matrimony-profile"] });
      queryClient.invalidateQueries({
        queryKey: ["matrimony-my-profile"],
      });
      queryClient.invalidateQueries({ queryKey: ["matrimony-profiles"] });
      
      // If there are images, upload them after profile creation
      if (newImageUris.length > 0 && data.id) {
        try {
          await uploadImagesMutation.mutateAsync({ profileId: data.id, imageUris: newImageUris });
        } catch (error) {
          // Profile was created but images failed - still show success
          console.error("Failed to upload images:", error);
        }
      }
      
      Alert.alert(t("matrimony_success"), t("matrimony_profile_created"), [
        {
          text: t("matrimony_ok"),
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        t("matrimony_error"),
        error?.response?.data?.message || t("matrimony_failed_create_profile")
      );
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("matrimony_permission_required"),
        t("matrimony_permission_photos")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((asset) => asset.uri);
      const totalImages = newImageUris.length + uris.length;
      if (totalImages > 5) {
        Alert.alert(t("matrimony_error"), t("matrimony_max_images"));
        return;
      }
      setNewImageUris([...newImageUris, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setNewImageUris(newImageUris.filter((_, i) => i !== index));
  };

  const openDatePicker = () => setIsDatePickerVisible(true);

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setIsDatePickerVisible(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setDob(formatDateString(selectedDate));
    }
  };

  const handleSubmit = () => {
    // Only validate dob if it's not from user profile
    if (!isDobDisabled && !dob) {
      Alert.alert(t("matrimony_error"), t("matrimony_dob_required"));
      return;
    }

    // Validate date format (YYYY-MM-DD) if dob is provided
    if (dob) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dob)) {
        Alert.alert(t("matrimony_error"), t("matrimony_dob_format"));
        return;
      }
    }

    createMutation.mutate({
      gender,
      dob: dob || null, // dob is optional now since it comes from user table
      height: height ? parseInt(height, 10) : null,
      religion: religion || null,
      caste: caste || null,
      city: city || null,
      education: education || null,
      profession: profession || null,
      income: income || null,
      about_me: aboutMe || null,
    });
    
    // Note: Images will be uploaded in the onSuccess callback
  };

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title={t("matrimony_create_profile")} />
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
            {t("matrimony_create_profile_title")}
          </Text>
          <Text className="text-gray-600 mb-6">
            {t("matrimony_create_profile_form_desc")}
          </Text>

          {/* Images Section */}
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-3">
              {t("matrimony_profile_images")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {newImageUris.map((uri, index) => (
                  <View key={`new-${index}`} className="mr-3 relative">
                    <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
                    <Pressable
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </Pressable>
                  </View>
                ))}
                {newImageUris.length < 5 && (
                  <TouchableOpacity
                    onPress={pickImage}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                  >
                    <Ionicons name="add" size={32} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
            <Text className="text-gray-500 text-xs mt-2">
              {t("matrimony_max_images")}
            </Text>
          </View>

          {/* Gender */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_gender_required")}</Text>
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
            {t("profile_dob_label")} {!isDobDisabled ? "*" : ""} (YYYY-MM-DD)
            {isDobDisabled && (
              <Text className="text-gray-500 text-xs ml-2">
                {t("matrimony_dob_from_profile")}
              </Text>
            )}
          </Text>
          <View className={`flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 ${isDobDisabled ? "opacity-60" : ""}`}>
            <TextInput
              value={dob}
              onChangeText={(text) => {
                if (!isDobDisabled) {
                  setDob(text);
                  const parsed = parseDateString(text);
                  if (parsed) setDateObj(parsed);
                }
              }}
              placeholder="2000-01-01"
              className="flex-1 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
              editable={!isDobDisabled}
            />
            {!isDobDisabled && (
              <TouchableOpacity
                onPress={openDatePicker}
                className="ml-3"
                accessibilityLabel="Show date picker"
                accessibilityRole="button"
              >
                <Ionicons name="calendar-sharp" size={22} color="#0B5ED7" />
              </TouchableOpacity>
            )}
          </View>
          {isDatePickerVisible &&
            DateTimePicker &&
            (Platform.OS === "ios" ? (
              <View className="mb-4">
                <DateTimePicker
                  value={dateObj || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
                <Pressable
                  onPress={() => setIsDatePickerVisible(false)}
                  className="mt-2 bg-blue-600 py-2 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">{t("matrimony_done")}</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mb-4">
                <DateTimePicker
                  value={dateObj || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              </View>
            ))}

          {/* Height */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_height_cm")}</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            keyboardType="numeric"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Religion */}
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_religion_label")}</Text>
          <TextInput
            value={religion}
            onChangeText={setReligion}
            placeholder={t("matrimony_enter_religion")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Caste */}
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_caste_label")}</Text>
          <TextInput
            value={caste}
            onChangeText={setCaste}
            placeholder={t("matrimony_enter_caste")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* City */}
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_city")}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t("matrimony_enter_city")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Education */}
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_education_label")}</Text>
          <TextInput
            value={education}
            onChangeText={setEducation}
            placeholder={t("matrimony_enter_education")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Profession */}
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_occupation_label")}</Text>
          <TextInput
            value={profession}
            onChangeText={setProfession}
            placeholder={t("matrimony_enter_profession")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Income */}
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_income_label")}</Text>
          <TextInput
            value={income}
            onChangeText={setIncome}
            placeholder={t("matrimony_enter_income")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* About Me */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_about_me")}</Text>
          <TextInput
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder={t("matrimony_tell_about")}
            multiline
            numberOfLines={4}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={createMutation.isPending || uploadImagesMutation.isPending}
            className="bg-blue-600 py-4 rounded-xl items-center mb-6 disabled:opacity-50"
          >
            {createMutation.isPending || uploadImagesMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {t("matrimony_create_profile")}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
