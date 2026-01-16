import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ResourcesHeader } from "@/app/components/ResourcesHeader";
import { fetchArticleCategories, fetchArticles } from "@/app/lib/articles.api";

export default function Articles() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const LIMIT = 10;

  /* Categories */
  const { data: categories } = useQuery({
    queryKey: ["article-category-list"],
    queryFn: fetchArticleCategories,
  });

  /* Infinite Query for Articles */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["article-list", selectedCategory],
    // Explicitly type and cast pageParam to ensure fetchArticles accepts it
    queryFn: ({ pageParam }) =>
      fetchArticles(pageParam as number, LIMIT, selectedCategory),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate if next page exists
      // If the current number of items loaded is less than the total count
      const loadedSoFar = allPages.flatMap((page) => page.data).length;
      return loadedSoFar < lastPage.count ? allPages.length + 1 : undefined;
    },
  });

  // Flatten the nested pages into a single list
  const allArticles = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  return (
    <View className="flex-1 bg-white">
      <ResourcesHeader title="Articles" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#1976d2"]} // Android color
            tintColor="#1976d2" // iOS color
          />
        }
      >
        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <Pressable
            onPress={() => setSelectedCategory("All")}
            className={`px-5 py-2.5 mr-2 rounded-full ${
              selectedCategory === "All"
                ? "bg-[#0B5ED7]"
                : "border border-gray-300"
            }`}
          >
            <Text
              className={
                selectedCategory === "All" ? "text-white" : "text-gray-600"
              }
            >
              All
            </Text>
          </Pressable>

          {categories?.data?.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 mr-2 rounded-full ${
                selectedCategory === cat.name
                  ? "bg-[#0B5ED7]"
                  : "border border-gray-300"
              }`}
            >
              <Text
                className={
                  selectedCategory === cat.name ? "text-white" : "text-gray-600"
                }
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading Initial State */}
        {isLoading && !isRefetching && (
          <View className="mt-10">
            <ActivityIndicator color="#0B5ED7" />
            <Text className="text-center mt-2 text-gray-400">
              Loading articles…
            </Text>
          </View>
        )}

        {/* Articles List */}
        {allArticles.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/(articlesscreen)/detailedarticlesscreenPage",
                params: { id: item.id },
              })
            }
            className="mt-4 border border-[#CFE2FF] rounded-2xl p-5 bg-white"
          >
            <View className="flex-row">
              <View className="w-12 h-12 bg-[#EFF6FF] rounded-xl items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#0B5ED7" />
              </View>

              <View className="flex-1">
                <View className="flex-row items-start justify-between gap-2">
                  <Text className="font-semibold text-gray-900 flex-1">
                    {item.title}
                  </Text>
                  <View className="bg-[#E0E7FF] px-2 py-1 rounded shrink-0">
                    <Text className="text-xs font-bold text-[#0B5ED7]">
                      {item.category}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                  {item.description}
                </Text>

                <Text className="text-gray-400 text-xs mt-2">
                  {new Date(item.published_date).toDateString()}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Load More Button */}
        {hasNextPage && (
          <Pressable
            onPress={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mt-6 w-full py-4 bg-[#EFF6FF] rounded-xl border border-dashed border-[#0B5ED7] items-center"
          >
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#0B5ED7" />
            ) : (
              <Text className="text-[#0B5ED7] font-semibold">
                Load More Articles
              </Text>
            )}
          </Pressable>
        )}

        {!hasNextPage && allArticles.length > 0 && (
          <Text className="text-center text-gray-400 mt-8 italic">
            You've viewed all articles
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
