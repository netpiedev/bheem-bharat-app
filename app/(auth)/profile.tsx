import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../lib/LanguageContext";
import { getUserProfile, updateUserProfile } from "../lib/auth.api";
import { registerForPushNotifications } from "../lib/notifications";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
].sort();

function formatDateString(dateObj: Date): string {
  return [
    dateObj.getDate().toString().padStart(2, "0"),
    (dateObj.getMonth() + 1).toString().padStart(2, "0"),
    dateObj.getFullYear(),
  ].join("/");
}

function formatDateStringForAPI(dateObj: Date): string {
  return [
    dateObj.getFullYear(),
    (dateObj.getMonth() + 1).toString().padStart(2, "0"),
    dateObj.getDate().toString().padStart(2, "0"),
  ].join("-");
}

function parseDateString(str: string): Date | null {
  const parts = str.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export default function CompleteProfile() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [dob, setDob] = useState("");

  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [dateObj, setDateObj] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);
      let user: any = null;
      try {
        try {
          const profile = await getUserProfile();
          user = profile?.user;
        } catch {
          const userStr = await AsyncStorage.getItem("user");
          if (userStr) user = JSON.parse(userStr);
        }
        if (mounted && user) {
          setName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setGender(user.gender || "MALE");
          setCity(user.city || "");
          setState(user.state || "");
          if (user.dob) {
            const dt = new Date(user.dob);
            if (!isNaN(dt.getTime())) {
              setDob(formatDateString(dt));
              setDateObj(dt);
            }
          }
          if (user.state) {
            await AsyncStorage.setItem("userState", user.state);
          }
        }
      } catch {}
      setLoading(false);
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCompleteProfile = async () => {
    // Validation - Run BEFORE any async operations
    const trimmedName = name?.trim() || "";
    const trimmedEmail = email?.trim() || "";
    const trimmedPhone = phone?.trim() || "";
    const trimmedCity = city?.trim() || "";
    const trimmedState = state?.trim() || "";
    const trimmedDob = dob?.trim() || "";

    if (!trimmedName || trimmedName.length === 0) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_name_required")
      );
      return;
    }

    if (!trimmedEmail || trimmedEmail.length === 0) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_email_required")
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_email_invalid")
      );
      return;
    }

    if (!trimmedPhone || trimmedPhone.length === 0) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_phone_required")
      );
      return;
    }

    // Remove any non-digit characters for phone validation
    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      Alert.alert(t("auth_invalid_phone"), t("auth_invalid_phone_message"));
      return;
    }

    if (!trimmedCity || trimmedCity.length === 0) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_city_required")
      );
      return;
    }

    if (!trimmedState || trimmedState.length === 0) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_state_required")
      );
      return;
    }

    if (!trimmedDob || trimmedDob.length === 0) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_dob_required")
      );
      return;
    }

    // Validate date format - parse the date string
    const parsedDate = parseDateString(trimmedDob);
    if (!parsedDate) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_dob_required")
      );
      return;
    }

    // Use parsedDate if dateObj is not set, otherwise use dateObj
    const finalDateObj = dateObj || parsedDate;

    // Validate gender
    if (
      !gender ||
      (gender !== "MALE" && gender !== "FEMALE" && gender !== "OTHER")
    ) {
      Alert.alert(
        t("auth_validation_required"),
        t("auth_validation_gender_required")
      );
      return;
    }

    try {
      const notificationToken = await registerForPushNotifications();

      // Convert dob from DD/MM/YYYY to YYYY-MM-DD format for API
      const dobForAPI = formatDateStringForAPI(finalDateObj);

      const updateResponse = await updateUserProfile({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        city: trimmedCity,
        state: trimmedState,
        dob: dobForAPI,
        gender: gender,
        notification_token: notificationToken || undefined,
      });

      // Save the updated user object (optional but recommended)
      if (updateResponse?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(updateResponse.user));
      }

      if (trimmedState) {
        await AsyncStorage.setItem("userState", trimmedState);
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert(
        t("matrimony_error"),
        error instanceof Error
          ? error.message
          : t("matrimony_failed_update_profile")
      );
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <KeyboardAwareScrollView
        bottomOffset={62}
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-between">
          <View className="mt-10">
            <Text className="text-4xl font-bold text-slate-900 tracking-tight">
              {t("auth_about_you")}
            </Text>
            <Text className="text-lg text-slate-500 mt-2 mb-8">
              {t("auth_profile_setup_desc")}
            </Text>

            <View className="space-y-4">
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                <Ionicons name="person-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder={t("auth_full_name")}
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="mail-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder={t("auth_email")}
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              {/* Phone Number Input */}
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="call-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder={t("auth_phone_number")}
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              <View className="flex-row justify-between mt-4">
                {(["MALE", "FEMALE", "OTHER"] as const).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setGender(item)}
                    className={[
                      "flex-1 mx-1 py-3 rounded-xl border items-center",
                      gender === item
                        ? "bg-blue-50 border-blue-600"
                        : "bg-white border-slate-200",
                    ].join(" ")}
                  >
                    <Text
                      className={[
                        "font-medium",
                        gender === item ? "text-blue-600" : "text-slate-500",
                      ].join(" ")}
                    >
                      {item === "MALE"
                        ? t("auth_gender_male")
                        : item === "FEMALE"
                        ? t("auth_gender_female")
                        : t("auth_gender_other")}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder={t("profile_city")}
                  placeholderTextColor="#94a3b8"
                  value={city}
                  onChangeText={setCity}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              {/* <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder="State"
                  placeholderTextColor="#94a3b8"
                  value={state}
                  onChangeText={setState}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View> */}

              {/* State Selection */}
              <Pressable
                onPress={() => setIsStateModalVisible(true)}
                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-6 mt-4"
              >
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <View className="ml-3 flex-1">
                  <Text
                    className={`text-base ${
                      state ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {state || t("auth_select_state")}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              </Pressable>

              {/* State Picker Modal */}
              <Modal
                visible={isStateModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsStateModalVisible(false)}
              >
                <View className="flex-1 justify-center bg-black/50 px-6">
                  <View className="bg-white rounded-3xl max-h-[70%] overflow-hidden">
                    <View className="p-4 border-b border-slate-100 items-center">
                      <Text className="text-lg font-bold text-slate-900">
                        {t("auth_select_state")}
                      </Text>
                    </View>

                    <KeyboardAwareScrollView>
                      {INDIAN_STATES.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() => {
                            setState(item);
                            setIsStateModalVisible(false);
                          }}
                          className={`p-4 border-b border-slate-50 ${
                            state === item ? "bg-blue-50" : ""
                          }`}
                        >
                          <Text
                            className={`text-base ${
                              state === item
                                ? "text-blue-600 font-semibold"
                                : "text-slate-700"
                            }`}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      ))}
                    </KeyboardAwareScrollView>

                    <Pressable
                      onPress={() => setIsStateModalVisible(false)}
                      className="p-4 items-center bg-slate-100"
                    >
                      <Text className="text-slate-600 font-semibold">
                        {t("auth_cancel")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>

              <View className="mt-4">
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                  <Ionicons name="calendar-outline" size={20} color="#64748b" />
                  <TextInput
                    placeholder={t("auth_dob_placeholder")}
                    placeholderTextColor="#94a3b8"
                    value={dob}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9/]/g, "");
                      setDob(cleaned);
                      const parsed = parseDateString(cleaned);
                      if (parsed) setDateObj(parsed);
                    }}
                    className="ml-3 flex-1 text-base text-slate-900"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <Pressable
                    onPress={openDatePicker}
                    className="ml-3"
                    accessibilityLabel="Show date picker"
                    accessibilityRole="button"
                  >
                    <Ionicons name="calendar-sharp" size={22} color="#0B5ED7" />
                  </Pressable>
                </View>
                {isDatePickerVisible &&
                  DateTimePicker &&
                  (Platform.OS === "ios" ? (
                    <Modal
                      visible={isDatePickerVisible}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setIsDatePickerVisible(false)}
                    >
                      <View className="flex-1 justify-end bg-black/40">
                        <View className="bg-white p-4 rounded-t-2xl">
                          <DateTimePicker
                            value={dateObj || new Date(2000, 0, 1)}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                            maximumDate={new Date()}
                          />
                          <Pressable
                            style={{
                              marginTop: 12,
                              alignSelf: "flex-end",
                              padding: 8,
                              paddingHorizontal: 18,
                              borderRadius: 8,
                              backgroundColor: "#0B5ED7",
                            }}
                            onPress={() => setIsDatePickerVisible(false)}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 16,
                              }}
                            >
                              {t("matrimony_done")}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </Modal>
                  ) : (
                    <View className="mt-2">
                      <DateTimePicker
                        value={dateObj || new Date(2000, 0, 1)}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                        maximumDate={new Date()}
                      />
                    </View>
                  ))}
              </View>

              {/* Language (read-only, no action) */}
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="globe-outline" size={20} color="#64748b" />
                <Text className="ml-3 flex-1 text-base text-slate-400">
                  {t("auth_preferred_language")}{" "}
                  <Text className="text-slate-900">
                    {t(`profile_lang_${lang}`)}
                  </Text>
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </View>
          </View>

          <View className="mt-8">
            <Pressable
              onPress={handleCompleteProfile}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-200"
            >
              <Text className="text-white font-bold text-lg">
                {t("auth_complete_profile")}
              </Text>
            </Pressable>

            <Text className="text-slate-400 text-center text-xs mt-4">
              {t("auth_terms_agreement")}
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
