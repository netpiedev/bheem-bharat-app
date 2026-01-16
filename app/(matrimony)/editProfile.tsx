import {
  getMyProfile,
  updateProfile,
  uploadProfileImages,
} from "@/app/lib/matrimony.api";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const { data: myProfile, isLoading } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dob, setDob] = useState("");
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [region, setRegion] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [aboutMeText, setAboutMeText] = useState("");
  const [city, setCity] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [state, setState] = useState("");
  const [village, setVillage] = useState("");
  const [siblingsCount, setSiblingsCount] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);
  const [userDob, setUserDob] = useState<string | null>(null);
  const [isDobDisabled, setIsDobDisabled] = useState(false);

  // Fetch user profile to get user.dob
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    retry: false,
  });

  useEffect(() => {
    // Load user DOB from user profile - prioritize this over profile.dob
    if (userProfile?.user?.dob) {
      const userDobDate = new Date(userProfile.user.dob);
      if (!isNaN(userDobDate.getTime())) {
        const formattedDob = formatDateString(userDobDate);
        setUserDob(formattedDob);
        setDob(formattedDob);
        setDateObj(userDobDate);
        setIsDobDisabled(true);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (myProfile && !isDobDisabled) {
      setGender(myProfile.gender);
      // Only use profile.dob if user.dob is not available
      if (!userDob && myProfile.dob) {
        const dt = new Date(myProfile.dob);
        if (!isNaN(dt.getTime())) {
          setDob(formatDateString(dt));
          setDateObj(dt);
        }
      }
      setHeight(myProfile.height?.toString() || "");
      setReligion(myProfile.religion || "");
      setCaste(myProfile.caste || "");
      setRegion(myProfile.region || "");
      setProfession(myProfile.profession || "");
      setEducation(myProfile.education || "");
      setIncome(myProfile.income || "");
      setAboutMeText(myProfile.about_me_text || "");
      setCity(myProfile.city || "");
      setMotherOccupation(myProfile.mother_occupation || "");
      setFatherOccupation(myProfile.father_occupation || "");
      setState(myProfile.state || "");
      setVillage(myProfile.village || "");
      setSiblingsCount(myProfile.siblings_count?.toString() || "");
      setImages(myProfile.images || []);
    }
  }, [myProfile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrimony-my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["matrimony-profiles"] });
      Alert.alert(t("matrimony_success"), t("matrimony_profile_updated"), [
        {
          text: t("matrimony_ok"),
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        t("matrimony_error"),
        error?.response?.data?.message || t("matrimony_failed_update_profile")
      );
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: (imageUris: string[]) =>
      uploadProfileImages(myProfile!.id, imageUris),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrimony-my-profile"] });
      setNewImageUris([]);
      Alert.alert(t("matrimony_success"), t("matrimony_images_uploaded"));
    },
    onError: (error: any) => {
      Alert.alert(
        t("matrimony_error"),
        error?.response?.data?.message || t("matrimony_failed_upload_images")
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
      setNewImageUris([...newImageUris, ...uris]);
    }
  };

  const removeImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewImageUris(newImageUris.filter((_, i) => i !== index));
    } else {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    let formattedDob: string | undefined;

    if (dob) {
      const parsed = parseDateString(dob);
      if (!parsed) {
        Alert.alert(t("matrimony_error"), t("matrimony_invalid_date_format"));
        return;
      }
      formattedDob = formatDateString(parsed);
    }

    const updatePayload: any = {};
    if (gender !== myProfile?.gender) updatePayload.gender = gender;
    // Don't update dob if it's disabled (comes from user profile)
    if (!isDobDisabled && formattedDob && formattedDob !== myProfile?.dob) {
      // dob is no longer updated in matrimony profiles, it comes from users table
      // updatePayload.dob = formattedDob;
    }
    if (height !== (myProfile?.height?.toString() || ""))
      updatePayload.height = height ? parseInt(height, 10) : null;
    if (religion !== (myProfile?.religion || ""))
      updatePayload.religion = religion || null;
    if (caste !== (myProfile?.caste || ""))
      updatePayload.caste = caste || null;
    if (region !== (myProfile?.region || ""))
      updatePayload.region = region || null;
    if (profession !== (myProfile?.profession || ""))
      updatePayload.profession = profession || null;
    if (education !== (myProfile?.education || ""))
      updatePayload.education = education || null;
    if (income !== (myProfile?.income || ""))
      updatePayload.income = income || null;
    if (
      aboutMeText !==
      (myProfile?.about_me_text || "")
    )
      updatePayload.about_me_text = aboutMeText || null;
    if (city !== (myProfile?.city || "")) updatePayload.city = city || null;
    if (motherOccupation !== (myProfile?.mother_occupation || ""))
      updatePayload.mother_occupation = motherOccupation || null;
    if (fatherOccupation !== (myProfile?.father_occupation || ""))
      updatePayload.father_occupation = fatherOccupation || null;
    if (state !== (myProfile?.state || "")) updatePayload.state = state || null;
    if (village !== (myProfile?.village || ""))
      updatePayload.village = village || null;
    if (
      siblingsCount !== (myProfile?.siblings_count?.toString() || "")
    )
      updatePayload.siblings_count = siblingsCount
        ? parseInt(siblingsCount, 10)
        : null;

    if (Object.keys(updatePayload).length > 0) {
      updateMutation.mutate(updatePayload);
    }

    if (newImageUris.length > 0) {
      uploadImagesMutation.mutate(newImageUris);
    }

    if (Object.keys(updatePayload).length === 0 && newImageUris.length === 0) {
      Alert.alert(t("matrimony_info"), t("matrimony_no_changes"));
    }
  };

  const openDatePicker = () => setIsDatePickerVisible(true);

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setIsDatePickerVisible(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setDob(formatDateString(selectedDate));
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title={t("matrimony_edit_profile")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (!myProfile) {
    return (
      <View className="flex-1 bg-white">
        <WhiteHeader title={t("matrimony_edit_profile")} />
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500">{t("matrimony_profile_not_found")}</Text>
        </View>
      </View>
    );
  }

  const getImageUrl = (imageKey: string) => {
    if (imageKey.startsWith("https://")) {
      return imageKey;
    }
    return `${process.env.EXPO_PUBLIC_S3_URL}/${imageKey}`;
  };

  return (
    <View className="flex-1 bg-white">
      <WhiteHeader title={t("matrimony_edit_profile")} />
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
            {t("matrimony_edit_profile_title")}
          </Text>
          <Text className="text-gray-600 mb-6">
            {t("matrimony_edit_profile_desc")}
          </Text>

          {/* Images Section */}
          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-3">
              {t("matrimony_profile_images")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {images.map((img, index) => (
                  <View key={`existing-${index}`} className="mr-3 relative">
                    <Image
                      source={{ uri: getImageUrl(img) }}
                      className="w-24 h-24 rounded-xl"
                    />
                    <Pressable
                      onPress={() => removeImage(index, false)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </Pressable>
                  </View>
                ))}
                {newImageUris.map((uri, index) => (
                  <View key={`new-${index}`} className="mr-3 relative">
                    <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
                    <Pressable
                      onPress={() => removeImage(index, true)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </Pressable>
                  </View>
                ))}
                {images.length + newImageUris.length < 5 && (
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
          <Text className="text-gray-900 font-semibold mb-2">{t("profile_gender_label")}</Text>
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
            {t("profile_dob_label")} (YYYY-MM-DD)
            {userDob && (
              <Text className="text-gray-500 text-sm font-normal ml-2">
                {t("matrimony_dob_from_user_profile")}
              </Text>
            )}
          </Text>
          <View className={`flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 ${userDob ? 'opacity-60' : ''}`}>
            <TextInput
              value={dob}
              onChangeText={(text) => {
                if (!userDob) {
                  setDob(text);
                  const parsed = parseDateString(text);
                  if (parsed) setDateObj(parsed);
                }
              }}
              placeholder="2000-01-01"
              className="flex-1 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
              editable={!userDob}
            />
            <TouchableOpacity
              onPress={userDob ? undefined : openDatePicker}
              className="ml-3"
              accessibilityLabel="Show date picker"
              accessibilityRole="button"
              disabled={!!userDob}
            >
              <Ionicons 
                name="calendar-sharp" 
                size={22} 
                color={userDob ? "#9CA3AF" : "#0B5ED7"} 
              />
            </TouchableOpacity>
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

          {/* Region */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_region")}</Text>
          <TextInput
            value={region}
            onChangeText={setRegion}
            placeholder={t("matrimony_enter_region")}
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

          {/* State */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_state")}</Text>
          <TextInput
            value={state}
            onChangeText={setState}
            placeholder={t("matrimony_enter_city")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Village */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_village")}</Text>
          <TextInput
            value={village}
            onChangeText={setVillage}
            placeholder={t("matrimony_enter_village")}
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

          {/* Mother Occupation */}
          <Text className="text-gray-900 font-semibold mb-2">
            {t("matrimony_mother_occupation")}
          </Text>
          <TextInput
            value={motherOccupation}
            onChangeText={setMotherOccupation}
            placeholder={t("matrimony_enter_mother_occupation")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Father Occupation */}
          <Text className="text-gray-900 font-semibold mb-2">
            {t("matrimony_father_occupation")}
          </Text>
          <TextInput
            value={fatherOccupation}
            onChangeText={setFatherOccupation}
            placeholder={t("matrimony_enter_father_occupation")}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* Siblings Count */}
          <Text className="text-gray-900 font-semibold mb-2">
            {t("matrimony_siblings_count")}
          </Text>
          <TextInput
            value={siblingsCount}
            onChangeText={setSiblingsCount}
            placeholder="0"
            keyboardType="numeric"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
            placeholderTextColor="#9CA3AF"
          />

          {/* About Me */}
          <Text className="text-gray-900 font-semibold mb-2">{t("matrimony_about_me")}</Text>
          <TextInput
            value={aboutMeText}
            onChangeText={setAboutMeText}
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
            disabled={updateMutation.isPending || uploadImagesMutation.isPending}
            className="bg-blue-600 py-4 rounded-xl items-center mb-6 disabled:opacity-50"
          >
            {updateMutation.isPending || uploadImagesMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {t("matrimony_save_changes")}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

