import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticateWithGoogle } from "../lib/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const googleAuthMutation = useMutation({
    mutationFn: authenticateWithGoogle,
    onSuccess: async (data) => {
      if (data.token && data.user) {
        // Save token
        await AsyncStorage.setItem("token", data.token);

        // Redirect
        if (data.user.is_on_boarded) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/profile");
        }
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to sign in with Google. Please try again.";
      Alert.alert("Error", message);
      setIsGoogleSigningIn(false);
    },
  });

  const handleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const signInResult = await GoogleSignin.signIn();

      // The response structure may vary, try to get idToken from different possible locations
      const idToken =
        (signInResult as any).idToken ||
        (signInResult as any).data?.idToken ||
        (signInResult as any).user?.idToken;

      if (!idToken) {
        console.error("Sign-in result:", signInResult);
        throw new Error("No ID token received from Google");
      }

      const serverAuthCode =
        (signInResult as any).serverAuthCode ||
        (signInResult as any).data?.serverAuthCode;

      // Call backend API with idToken
      await googleAuthMutation.mutateAsync({
        idToken,
        accessToken: serverAuthCode || undefined,
      });
    } catch (error: any) {
      setIsGoogleSigningIn(false);

      // Handle Google Sign-In cancellation
      if (error.code === "SIGN_IN_CANCELLED") {
        console.log("User cancelled Google Sign-In");
        return;
      }

      // Handle other errors
      console.error("Sign-in Error: ", error);
      const message =
        error?.message || "Failed to sign in with Google. Please try again.";
      Alert.alert("Error", message);
    }
  };

  const isLoading = isGoogleSigningIn || googleAuthMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8">
        {/* Logo & Branding Section */}
        <View className="flex-[2] justify-center items-center">
          <View className="w-48 h-48 items-center justify-center">
            <Image
              source={require("../../assets/images/icon-previous.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Action Section */}
        <View className="flex-[1] pb-12">
          <View className="mb-8">
            <Text className="text-2xl font-bold text-slate-800">
              Welcome back
            </Text>
            <Text className="text-slate-500 mt-2 text-base leading-6">
              Join the community and contribute to a stronger Bharat.
            </Text>
          </View>

          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            className="flex-row items-center justify-center bg-slate-900 h-16 rounded-2xl shadow-md disabled:opacity-70"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <View className="bg-white p-1.5 rounded-full mr-4">
                  <Image
                    source={require("../../assets/images/google.png")}
                    className="w-5 h-5"
                  />
                </View>
                <Text className="text-white font-bold text-lg">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Footer */}
          <Text className="text-center text-slate-400 text-xs mt-8 px-4">
            By logging in, you agree to our
            <Text className="text-slate-600 font-medium"> Terms</Text> &
            <Text className="text-slate-600 font-medium"> Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
