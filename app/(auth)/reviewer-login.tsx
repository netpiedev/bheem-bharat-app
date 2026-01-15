import { loginReviewer } from "@/app/lib/auth.api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReviewerLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginReviewer({ email, password });

      // Save token
      await AsyncStorage.setItem("token", response.token);
      
      // Save user data
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/home"),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid credentials for reviewer access.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen
        options={{ headerShown: true, title: "", headerShadowVisible: false }}
      />

      <KeyboardAwareScrollView
        bottomOffset={62} // Offsets the view so input isn't flush against keyboard top
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-slate-900">
            Reviewer Login
          </Text>
          <Text className="text-slate-500 mt-2 text-center">
            Enter your credentials to continue
          </Text>
        </View>

        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">
              Email Address
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-lg px-4 h-14">
              <TextInput
                className="flex-1"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mt-4">
            <Text className="text-slate-700 font-semibold mb-2 ml-1">
              Password
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-lg px-4 h-14">
              <TextInput
                className="flex-1"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={16}
                  color="#64748b"
                />
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleReviewerLogin}
            disabled={loading}
            className="bg-slate-900 h-16 rounded-2xl items-center justify-center mt-8 shadow-sm active:opacity-90"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Log In</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
