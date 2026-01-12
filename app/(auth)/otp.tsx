import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { sendTestOTP, verifyOTP } from "../lib/auth.api";

export default function OTP() {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState<string | null>(null);

  useEffect(() => {
    const getMobileNumber = async () => {
      const stored = await AsyncStorage.getItem("mobileNumber");
      if (stored) {
        setMobileNumber(stored);
      } else {
        router.replace("/(auth)/login");
      }
    };
    getMobileNumber();
  }, [router]);

  const { data: testOTP } = useQuery({
    queryKey: ["test-otp", mobileNumber],
    queryFn: () => (mobileNumber ? sendTestOTP(mobileNumber) : null),
  });

  const verifyOTPMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: async (data) => {
      if (data.token && data.user) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.removeItem("mobileNumber");
        if (!data.user.name || !data.user.city || !data.user.dob) {
          router.replace("/(auth)/profile");
        } else {
          router.replace("/(tabs)/home");
        }
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Invalid OTP. Please try again.";
      Alert.alert("Error", message);
    },
  });

  const handleVerifyOTP = () => {
    if (!mobileNumber) {
      Alert.alert("Error", "Mobile number not found");
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP");
      return;
    }

    verifyOTPMutation.mutate({
      mobileNumber,
      code: otpCode,
    });
  };

  const handleResendOTP = async () => {
    if (!mobileNumber) return;
    // Navigate back to login to resend
    router.replace("/(auth)/login");
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
              Verify OTP
            </Text>
            <Text className="text-lg text-slate-500 mt-2 mb-10">
              We've sent a 6-digit code to your mobile number.
            </Text>

            {/* Show OTP for testing */}
            {testOTP?.otp && (
              <View className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <Text className="text-xs font-semibold text-yellow-800 mb-1">
                  🧪 TEST MODE - OTP for testing:
                </Text>
                <Text className="text-2xl font-bold text-yellow-900 text-center">
                  {testOTP.otp}
                </Text>
                <Text className="text-xs text-yellow-700 text-center mt-1">
                  (This is only visible in development)
                </Text>
              </View>
            )}

            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2 ml-1">
                Enter Code
              </Text>
              <TextInput
                placeholder="0 0 0 0 0 0"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
                style={{ letterSpacing: 10 }} // Makes the OTP digits look spaced out
                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 text-2xl font-bold text-center text-slate-900 focus:border-blue-500"
              />

              <View className="flex-row justify-between items-center mt-6 px-1">
                <Text className="text-slate-400 text-sm">
                  Didn't receive the code?
                </Text>
                <TouchableOpacity onPress={handleResendOTP}>
                  <Text className="text-blue-600 font-semibold text-sm">
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleVerifyOTP}
              disabled={verifyOTPMutation.isPending || otpCode.length !== 6}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {verifyOTPMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Verify & Continue
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="mt-6">
              <Text className="text-slate-500 text-center text-base">
                Entered wrong number?{" "}
                <Text className="text-blue-600 font-semibold">Go Back</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
