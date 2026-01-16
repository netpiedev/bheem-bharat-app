const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  expo: {
    name: IS_DEV ? "Bheem Bharat (Dev)" : "Bheem Bharat",
    // "name": "Bheem Bharat",
    slug: "bheembharat",
    owner: "bheem-bharat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon-previous.png",
    scheme: "bheembharat",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: IS_DEV
        ? "com.bheembharat.app.dev"
        : "com.bheembharat.app",
      supportsTablet: true,
    },
    android: {
      package: IS_DEV ? "com.bheembharat.app.dev" : "com.bheembharat.app",
      // "package": "com.bheembharat.app",
      googleServicesFile: "./google-services.json",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["android.permission.RECORD_AUDIO"],
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/icon-previous.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon-previous.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon-previous.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon-previous.png",
          color: "#E6F4FE",
        },
      ],
      "@react-native-google-signin/google-signin",
      "@react-native-community/datetimepicker",
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app needs access to your photos to let you upload images to your profile.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "071dc45f-86f3-485b-80e7-ea679480e56c",
      },
    },
  },
};
