import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("⚠️ [notifications] Must use physical device for push notifications");
    return null;
  }

  // 1. Setup Android Channel (Mandatory for Android 13+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  try {
    // 2. Check & Request Permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("⚠️ [notifications] Permission not granted");
      return null;
    }

    // 3. Get Project ID from EAS Config
    // This is required for new SDKs to avoid the "Project ID not found" error
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.error("❌ [notifications] EAS Project ID not found in app config.");
      return null;
    }

    // 4. Get the Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("✅ [notifications] Push token registered:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("❌ [notifications] Registration failed:", error);
    return null;
  }
}