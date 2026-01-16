import { ResourcesHeader } from "@/app/components/ResourcesHeader";
import { fetchLawCategories, fetchLaws } from "@/app/lib/laws.api";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function Legal() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const LIMIT = 10;

  // --- Category Query ---
  const { data: catResponse, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["law-categories"],
    queryFn: fetchLawCategories,
  });

  const categories = useMemo(() => {
    // Note: accessing .data because your fetchLawCategories returns ApiListResponse
    const fetchedNames = catResponse?.data?.map((c) => c.name) || [];
    return ["All", ...fetchedNames];
  }, [catResponse]);

  // --- Infinite Laws Query ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLawsLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["laws", "manual-load", selectedCategory],
    queryFn: ({ pageParam = 1 }) =>
      fetchLaws(pageParam as number, LIMIT, selectedCategory),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * LIMIT;
      return totalFetched < lastPage.count ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allLaws = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  if (isCategoriesLoading || (isLawsLoading && !isRefetching)) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ResourcesHeader title="Laws" />
      {/* Category Horizontal Selector */}
      <View className="py-4 border-b border-gray-50">
        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item}
          renderItem={({ item: cat }) => (
            <Pressable
              onPress={() => handleCategoryChange(cat)}
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
          )}
        />
      </View>

      <FlatList
        data={allLaws}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#0B5ED7"]}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(leagal)/leagleDetaildScreen",
                params: { id: item.id },
              })
            }
            className="mb-4 w-full bg-white border border-[#CFE2FF] rounded-2xl p-5 shadow-sm"
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-xl bg-[#EFF6FF] items-center justify-center mr-4 mt-1">
                <Ionicons name="scale-outline" size={24} color="#0B5ED7" />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text
                    className="font-bold text-gray-900 text-[16px] flex-1 mr-2 leading-6"
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <View className="bg-[#CCFBF1] px-2 py-1 rounded border border-[#99F6E4]">
                    <Text className="text-[#0F766E] text-[10px] font-bold uppercase">
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
        )}
        // ListFooterComponent handles the "Load More" button
        ListFooterComponent={() => (
          <View className="mt-4 mb-8">
            {hasNextPage ? (
              <Pressable
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-4 bg-[#EFF6FF] rounded-xl border border-[#CFE2FF] items-center justify-center"
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color="#0B5ED7" />
                ) : (
                  <Text className="text-[#0B5ED7] font-semibold text-base">
                    Load More Laws
                  </Text>
                )}
              </Pressable>
            ) : allLaws.length > 0 ? (
              <Text className="text-center text-gray-400 py-4 italic">
                You've reached the end of the list
              </Text>
            ) : (
              <Text className="text-center text-gray-400 py-10">
                No laws found in this category
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
