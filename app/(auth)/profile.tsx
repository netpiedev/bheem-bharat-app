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
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile, updateUserProfile } from "../lib/auth.api";
import { registerForPushNotifications } from "../lib/notifications";

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
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [dob, setDob] = useState("");

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
    try {
      const notificationToken = await registerForPushNotifications();
  

      
      if (phone && phone.length < 10) {
        Alert.alert("Invalid Phone", "Please enter a valid phone number.");
        return;
      }

      // Convert dob from DD/MM/YYYY to YYYY-MM-DD format for API
      let dobForAPI: string | undefined = undefined;
      if (dob && dateObj) {
        dobForAPI = formatDateStringForAPI(dateObj);
      }

      const updateResponse = await updateUserProfile({
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        city: city || undefined,
        state: state || undefined,
        dob: dobForAPI,
        gender: gender || undefined,
        notification_token: notificationToken || undefined,
      });

      // Save the updated user object (optional but recommended)
      if (updateResponse?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(updateResponse.user));
      }

      if (state) {
        await AsyncStorage.setItem("userState", state);
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Failed to update profile:", error);
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
              About You
            </Text>
            <Text className="text-lg text-slate-500 mt-2 mb-8">
              Just a few more details to set up your profile.
            </Text>

            <View className="space-y-4">
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                <Ionicons name="person-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="mail-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder="Email"
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
                  placeholder="Phone Number"
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              <View className="flex-row justify-between mt-4">
                {["MALE", "FEMALE", "OTHER"].map((item) => (
                  <TouchableOpacity
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
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder="City"
                  placeholderTextColor="#94a3b8"
                  value={city}
                  onChangeText={setCity}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mt-4">
                <Ionicons name="location-outline" size={20} color="#64748b" />
                <TextInput
                  placeholder="State"
                  placeholderTextColor="#94a3b8"
                  value={state}
                  onChangeText={setState}
                  className="ml-3 flex-1 text-base text-slate-900"
                />
              </View>

              <View className="mt-4">
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                  <Ionicons name="calendar-outline" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Date of Birth (DD/MM/YYYY)"
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
                  <TouchableOpacity
                    onPress={openDatePicker}
                    className="ml-3"
                    accessibilityLabel="Show date picker"
                    accessibilityRole="button"
                  >
                    <Ionicons name="calendar-sharp" size={22} color="#0B5ED7" />
                  </TouchableOpacity>
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
                              Done
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
                  Preferred Language:{" "}
                  <Text className="text-slate-900">English</Text>
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </View>
          </View>

          <View className="mt-8">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCompleteProfile}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-200"
            >
              <Text className="text-white font-bold text-lg">
                Complete Profile
              </Text>
            </TouchableOpacity>

            <Text className="text-slate-400 text-center text-xs mt-4">
              By continuing, you agree to our Terms of Service.
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
