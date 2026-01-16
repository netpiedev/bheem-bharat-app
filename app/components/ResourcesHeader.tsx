import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitle?: string;
};

export function ResourcesHeader({ title, subtitle }: Props) {
  const router = useRouter();

  const handleBack = () => {
    router.replace("/resources");
    // if (router.canGoBack()) {
    //   // router.back();
    // } else {
    //   // If there's no history (like jumping from Home),
    //   // redirect to the main Resources screen
    //   router.replace("/resources");
    // }
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-white">
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={handleBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>

          <View>
            <Text className="text-xl font-semibold">{title}</Text>
            {subtitle && (
              <Text className="text-gray-500 text-sm">{subtitle}</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
