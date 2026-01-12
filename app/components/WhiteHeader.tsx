import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  title: string;
  subtitle?: string;
};

export function WhiteHeader({ title, subtitle }: Props) {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="bg-white">
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>

          <View>
            <Text className="text-lg font-semibold">{title}</Text>
            {subtitle && (
              <Text className="text-gray-500 text-sm">{subtitle}</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
