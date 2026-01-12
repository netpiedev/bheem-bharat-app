import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { authenticateWithGoogle } from "../lib/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const googleAuthMutation = useMutation({
    mutationFn: authenticateWithGoogle,
    onSuccess: async (data) => {
      if (data.token && data.user) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem("token", data.token);

        // Check if user profile is complete
        // Navigate to profile if name, city, or dob is missing
        if (!data.user.name || !data.user.city || !data.user.dob) {
          router.replace("/(auth)/profile");
        } else {
          router.replace("/(tabs)/home");
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
    <View className="flex-1 px-4 justify-center">
      {/* Google Button */}
      <Pressable
        onPress={handleSignIn}
        disabled={isLoading}
        className="flex-row items-center justify-center bg-white border border-slate-200 h-14 rounded-xl active:bg-slate-50 shadow-sm disabled:opacity-50"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#64748b" />
        ) : (
          <>
            <Image
              source={require("../../assets/images/google.png")}
              className="w-5 h-5 mr-3"
              style={{ width: 20, height: 20 }}
            />
            <Text className="text-slate-900 font-semibold text-lg">
              Continue with Google
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
