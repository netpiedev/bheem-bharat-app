import { fetchLawCategories, fetchLaws } from "@/app/lib/laws.api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router"; // <--- 1. Import useRouter
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Legal() {
  const router = useRouter(); // <--- 2. Initialize router
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Queries ---
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useQuery({ queryKey: ["law-categories"], queryFn: fetchLawCategories });

  const {
    data: lawsData,
    isLoading: isLawsLoading,
    refetch: refetchLaws,
    isRefetching,
  } = useQuery({ queryKey: ["laws"], queryFn: fetchLaws });

  const onRefresh = () => {
    refetchCategories();
    refetchLaws();
  };

  const categories = useMemo(() => {
    const fetchedNames = categoriesData?.map((c) => c.name) || [];
    return ["All", ...fetchedNames];
  }, [categoriesData]);

  const filteredLaws = useMemo(() => {
    if (!lawsData) return [];
    if (selectedCategory === "All") return lawsData;
    return lawsData.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, lawsData]);

  if (isCategoriesLoading || isLawsLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={["#0B5ED7"]}
          />
        }
      >
        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full mr-2 border ${
                selectedCategory === cat
                  ? "bg-[#0B5ED7] border-[#0B5ED7]"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat ? "text-white" : "text-gray-600"
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Laws List */}
        {filteredLaws.map((item) => (
          <Pressable
            key={item.id}
            // --- 3. Update onPress to navigate ---
            onPress={() => {
              router.push({
                pathname: "/(leagal)/leagleDetaildScreen", // Ensure this matches your exact filename
                params: { id: item.id },
              });
            }}
            className="mb-4 w-full bg-white border border-[#CFE2FF] rounded-2xl p-5 shadow-sm"
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-xl bg-[#EFF6FF] items-center justify-center mr-4 mt-1">
                <Ionicons name="scale-outline" size={24} color="#0B5ED7" />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="font-bold text-gray-900 text-[16px] flex-1 mr-2 leading-6">
                    {item.title}
                  </Text>
                  <View className="bg-[#CCFBF1] px-2 py-1 rounded border border-[#99F6E4]">
                    <Text
                      className="text-[#0F766E] text-[10px] font-bold uppercase"
                      numberOfLines={1}
                    >
                      {item.category}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-gray-500 text-sm leading-5 mt-2"
                  numberOfLines={3}
                >
                  {item.short_description}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
