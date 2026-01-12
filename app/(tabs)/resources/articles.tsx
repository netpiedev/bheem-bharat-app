import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  fetchAllArticles,
  fetchArticleCategories,
  fetchArticlesByCategory,
} from "@/app/lib/articles.api";

export default function Articles() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  /* Categories */
  const { data: categories } = useQuery({
    queryKey: ["article-categories"],
    queryFn: fetchArticleCategories,
  });

  /* Articles (THIS IS THE KEY PART) */
  const { data: articles = [], isFetching } = useQuery({
    queryKey: ["articles", selectedCategory],
    queryFn: () =>
      selectedCategory === "All"
        ? fetchAllArticles()
        : fetchArticlesByCategory(selectedCategory),
  });

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            onPress={() => setSelectedCategory("All")}
            className={`px-5 py-2.5 mr-2 rounded-full ${
              selectedCategory === "All"
                ? "bg-[#0B5ED7]"
                : "border border-gray-300"
            }`}
          >
            <Text className={selectedCategory === "All" ? "text-white" : ""}>
              All
            </Text>
          </Pressable>

          {categories?.map((cat) => (
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
                className={selectedCategory === cat.name ? "text-white" : ""}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading */}
        {isFetching && (
          <Text className="mt-6 text-gray-400">Loading articles…</Text>
        )}

        {/* Articles List */}
        {/* Articles List */}
        {articles.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: "/(articlesscreen)/detailedarticlesscreenPage",
                params: { id: item.id },
              })
            }
            className="mt-4 border border-[#CFE2FF] rounded-2xl p-5"
          >
            <View className="flex-row">
              {/* Icon Box */}
              <View className="w-12 h-12 bg-[#EFF6FF] rounded-xl items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#0B5ED7" />
              </View>

              {/* Content */}
              <View className="flex-1">
                {/* Header Row (Title + Category) */}
                <View className="flex-row items-start justify-between gap-2">
                  <Text className="font-semibold text-gray-900 flex-1">
                    {item.title}
                  </Text>

                  {/* Fixed Category Badge */}
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
      </ScrollView>
    </View>
  );
}
