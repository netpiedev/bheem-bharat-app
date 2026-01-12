import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { fetchBookById } from "@/app/lib/books.api";

export default function DetailedBookPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id as string),
    enabled: !!id,
  });

  const handleDownload = async () => {
    if (!book?.pdf_file_object_key) {
      Alert.alert("Error", "Download link not available for this book.");
      return;
    }
    // Logic to open the PDF URL
    await Linking.openURL(book.pdf_file_object_key);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FAFCFF] items-center justify-center">
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-gray-500 mt-2">Failed to load book details.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFCFF]">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Card (Title, Author, Image) */}
        <View className="bg-white border border-[#E9EEF5] rounded-[24px] p-5 flex-row items-center mb-5 shadow-sm">
          <View className="mr-4">
            {book.cover_image_object_key ? (
              <Image
                source={{ uri: book.cover_image_object_key }}
                className="w-[80px] h-[100px] rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-[80px] h-[100px] rounded-xl bg-[#D6E8FF] items-center justify-center">
                <Ionicons name="book" size={32} color="#0B5ED7" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="font-bold text-[#1A1C1E] text-[18px] mb-1">
              {book.name}
            </Text>
            <Text className="text-gray-500 text-[15px] mb-2">
              {book.author}
            </Text>
            <View className="bg-[#FFE5E5] self-start px-2 py-0.5 rounded-md border border-[#FFD1D1]">
              <Text className="text-[#FF4D4D] font-bold text-[10px]">PDF</Text>
            </View>
          </View>
        </View>

        {/* 2. Description Section */}
        <View className="bg-white border border-[#E9EEF5] rounded-[24px] p-5 mb-5 shadow-sm">
          <Text className="font-bold text-[#1A1C1E] text-[16px] mb-3">
            Description
          </Text>
          <Text className="text-gray-600 leading-6 text-[15px]">
            {book.description || "No description available for this book."}
          </Text>
        </View>

        {/* 3. Source Section */}
        <View className="bg-white border border-[#E9EEF5] rounded-[24px] p-5 mb-8 shadow-sm">
          <Text className="font-bold text-[#1A1C1E] text-[16px] mb-2">
            Source
          </Text>
          <Text className="text-gray-600 text-[15px]">
            {book.source || "Unknown Source"}
          </Text>
        </View>

        {/* 4. Download Button */}
        <Pressable
          onPress={handleDownload}
          className="bg-[#0B5ED7] flex-row items-center justify-center py-4 rounded-2xl shadow-lg active:opacity-90"
        >
          <Ionicons name="download-outline" size={22} color="white" />
          <Text className="text-white font-bold text-[16px] ml-2">
            Download PDF
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!book?.pdf_file_object_key) return;

            router.push({
              pathname: "/(booksscreens)/PdfReaderPage",
              params: {
                url: book.pdf_file_object_key, // This is your pre-signed URL
                title: book.name,
              },
            });
          }}
          className="bg-[#c2213e] flex-row items-center justify-center py-4 mt-4 rounded-2xl shadow-lg active:opacity-90"
        >
          <Ionicons name="eye-outline" size={22} color="white" />
          <Text className="text-white font-bold text-[16px] ml-2">
            Read Now
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
