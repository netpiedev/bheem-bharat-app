import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { fetchBooksByCategory } from "@/app/lib/books.api";
import { BookListItem } from "@/app/types/books.types";

export default function BooksByCategory() {
  const router = useRouter();
  const { id, category } = useLocalSearchParams<{
    id: string;
    category: string;
  }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["booksByCategory", id],
    queryFn: () => fetchBooksByCategory(id as string),
    enabled: !!id,
  });

  const books: BookListItem[] = data || [];

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#0B5ED7" />
        <Text className="text-gray-400 mt-2">Loading books...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-red-500 mt-2 text-center">
          Error loading books.
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-[#FAFCFF]">
      <Stack.Screen options={{ title: category }} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {books.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              router.push({
                pathname: "/(booksscreens)/detailedBookPage",
                params: { id: item.id },
              });
            }}
            className="mb-4 w-full bg-[#F1F7FF] border border-[#D6E4FF] rounded-[16px] p-4 flex-row items-center"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            {/* Book Cover Image */}
            <View className="mr-4">
              {item.cover_image_object_key ? (
                <Image
                  source={{ uri: item.cover_image_object_key }}
                  className="w-[70px] h-[90px] rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                /* Placeholder if cover is null */
                <View className="w-[70px] h-[90px] rounded-xl bg-[#D6E8FF] items-center justify-center">
                  <Ionicons name="book" size={32} color="#0B5ED7" />
                </View>
              )}
            </View>

            {/* Text Content */}
            <View className="flex-1 pr-2">
              <Text
                className="font-bold text-[#1A1C1E] text-[16px] mb-1"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text
                className="text-gray-500 text-[14px] mb-2"
                numberOfLines={1}
              >
                {item.author}
              </Text>

              {/* PDF Badge */}
              <View className="bg-[#FFE5E5] self-start px-2 py-0.5 rounded-md border border-[#FFD1D1]">
                <Text className="text-[#FF4D4D] font-bold text-[10px]">
                  PDF
                </Text>
              </View>
            </View>

            {/* Right Arrow Action */}
            <View className="w-9 h-9 rounded-full bg-[#D6E8FF] items-center justify-center">
              <Ionicons name="chevron-forward" size={18} color="#0B5ED7" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
