import "@/global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { sendTestOTP } from "../lib/auth.api";

export default function Login() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");

  const sendOTPMutation = useMutation({
    mutationFn: (mobileNumber: string) => sendTestOTP(mobileNumber),
    onSuccess: async (data) => {
      console.log("🟢 [Login] OTP sent successfully:", data);
      await AsyncStorage.setItem("mobileNumber", mobileNumber);
      router.replace("/(auth)/otp");
    },
    onError: (error: any) => {
      console.error("🔴 [Login] Error sending OTP:", error);
      console.error("🔴 [Login] Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        config: error?.config,
      });
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP. Please check your connection and try again.";
      Alert.alert("Error", message);
    },
  });

  const handleSendOTP = async () => {
    console.log("🔵 [Login] handleSendOTP called");

    if (!mobileNumber.trim()) {
      Alert.alert("Error", "Please enter your mobile number");
      return;
    }

    // Basic validation for Indian mobile numbers (10 digits)
    const cleanedNumber = mobileNumber.replace(/\D/g, "");
    if (cleanedNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    // Use mutation (react-query)
    sendOTPMutation.mutate(cleanedNumber);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-between py-12">
          {/* Top Section */}
          <View className="mt-10">
            <Text className="text-4xl font-bold text-slate-900 tracking-tight">
              Sign In
            </Text>
            <Text className="text-lg text-slate-500 mt-2 mb-8">
              Log in to your account with your mobile number
            </Text>

            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">
                Mobile Number
              </Text>
              <TextInput
                placeholder="Enter your mobile number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                maxLength={10}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-lg text-slate-900 focus:border-blue-500"
              />
              <Text className="text-slate-400 text-xs mt-3 px-1">
                A 6-digit OTP will be sent to your number for verification.
              </Text>
            </View>
          </View>

          {/* Bottom Section */}
          <View>
            <TouchableOpacity
              onPress={handleSendOTP}
              activeOpacity={0.7}
              disabled={sendOTPMutation.isPending}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {sendOTPMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Log In</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/signup")}
              className="mt-6"
            >
              <Text className="text-slate-500 text-center text-base">
                Don't have an account?{" "}
                <Text className="text-blue-600 font-semibold">Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
