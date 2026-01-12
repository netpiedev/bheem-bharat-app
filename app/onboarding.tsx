import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Connect with SC/ST Community",
    desc: "oin a vibrant community of like-minded individuals. Share experiences, get support, and grow together.",
    icon: "account-group",
  },
  {
    title: "Find Support Across Cities",
    desc: "Access resources, hostels, scholarships, and government schemes designed for the community.",
    icon: "office-building",
  },
  {
    title: "Find Your Life Partner",
    desc: "Connect with verified profiles from the SC/ST community. Start your journey to find the perfect match.",
    icon: "heart-outline",
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("hasOnboarded", "true");
    router.replace("/(auth)/login"); // or /(tabs)/home
  };

  return (
    <View className="flex-1 bg-white">
      {/* Skip */}
      {index !== slides.length - 1 && (
        <TouchableOpacity
          onPress={completeOnboarding}
          className="absolute top-14 right-5 z-10"
        >
          <Text className="text-gray-100 /50 font-semibold text-base">
            Skip
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View
            style={{ width, height: "100%" }}
            className="justify-center items-center px-8"
          >
            <View className="bg-blue-100 p-7 rounded-full mb-8">
              <MaterialCommunityIcons
                name={item.icon as any}
                size={50}
                color="#1E88E5"
              />
            </View>

            <Text className="text-xl font-bold text-center mb-3">
              {item.title}
            </Text>

            <Text className="text-gray-500 text-center text-sm">
              {item.desc}
            </Text>
          </View>
        )}
      />

      {/* Dots */}
      <View className="flex-row justify-center mb-6">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full mx-1 ${
              index === i ? "bg-blue-600 w-6" : "bg-gray-300 w-2"
            }`}
          />
        ))}
      </View>

      {/* Buttons */}
      <View className="px-5 pb-8">
        {index === slides.length - 1 ? (
          <>
            <TouchableOpacity
              onPress={completeOnboarding}
              className="bg-blue-600 py-4 rounded-xl items-center mb-3"
            >
              <Text className="text-white font-semibold text-base">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="border border-blue-600 py-4 rounded-xl items-center"
            >
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() =>
              flatListRef.current?.scrollToIndex({ index: index + 1 })
            }
            className="bg-blue-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-base">Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
