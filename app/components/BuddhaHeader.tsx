import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function BuddhaHeader({ title, subtitle, showBack }: Props) {
  const router = useRouter();

  return (
    <LinearGradient colors={["#0B5ED7", "#0A58CA"]}>
      <SafeAreaView edges={["top"]}>
        <View className="px-4 pt-2 pb-6">
          {showBack && (
            <Pressable
              onPress={() => router.back()}
              className="mb-2 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>
          )}

          <Text className="text-white text-xl font-bold">{title}</Text>

          {subtitle && <Text className="text-white/80 mt-1">{subtitle}</Text>}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
