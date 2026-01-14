import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { fetchOrganizations } from "@/app/lib/organizations.api";

export default function Organizations() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | undefined>(
    undefined
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["organizations", selectedState],
    queryFn: ({ pageParam = 1 }) =>
      fetchOrganizations({
        pageParam: pageParam as number,
        state: selectedState,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Logic: If we've fetched everything (page * limit >= count), return undefined
      const fetchedSoFar = lastPage.page * lastPage.limit;
      return lastPage.count > fetchedSoFar ? lastPage.page + 1 : undefined;
    },
  });

  const organizations = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const filteredOrganizations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return organizations;

    return organizations.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query)
    );
  }, [searchQuery, organizations]);

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 bg-white border border-gray-200 rounded-xl flex-row items-center px-4 py-1 shadow-sm">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search by name or location..."
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-gray-800 py-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {searchQuery.length > 0 && (
          <Text className="text-gray-400 text-xs mb-4 px-1 uppercase font-bold tracking-wider">
            Found {filteredOrganizations.length}{" "}
            {filteredOrganizations.length === 1 ? "result" : "results"}
          </Text>
        )}

        {filteredOrganizations.length > 0 ? (
          filteredOrganizations.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/(organizationsscreens)/detailedOrganizationsPage",
                  params: {
                    id: item.id,
                    name: item.name,
                  },
                })
              }
              className="mb-4 border border-[#CFE2FF] rounded-2xl p-4 bg-white active:bg-blue-50"
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-xl bg-[#EAF3FF] items-center justify-center mr-3">
                  <Ionicons name="business" size={20} color="#1976d2" />
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-base">
                    {item.name}
                  </Text>

                  <View className="flex-row items-center mt-2">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-gray-500 text-sm ml-1">
                      {item.city}, {item.state}
                    </Text>
                  </View>

                  <Text className="text-gray-500 text-sm mt-2 leading-5">
                    {item.short_description}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons name="search-outline" size={48} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-base">
              No organizations match your search.
            </Text>
          </View>
        )}

        {/* Pagination Control */}
        <View className="my-4">
          {hasNextPage ? (
            <Pressable
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className={`py-4 rounded-2xl items-center justify-center border ${
                isFetchingNextPage
                  ? "border-gray-100 bg-gray-50"
                  : "border-blue-100 bg-blue-50"
              }`}
            >
              {isFetchingNextPage ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#1976d2" />
                  <Text className="ml-2 text-gray-500 font-medium">
                    Loading more...
                  </Text>
                </View>
              ) : (
                <Text className="text-blue-600 font-semibold text-base">
                  Load More Organizations
                </Text>
              )}
            </Pressable>
          ) : organizations.length > 0 ? (
            <Text className="text-center text-gray-400 text-sm italic">
              You've reached the end of the list.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
