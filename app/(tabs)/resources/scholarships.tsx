import {
  fetchScholarships,
  fetchScholarshipStates,
} from "@/app/lib/scholarships.api";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Scholarships() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const LIMIT = 10;

  /* ---------------- QUERIES ---------------- */

  const { data: statesData } = useQuery({
    queryKey: ["scholarship-states"],
    queryFn: fetchScholarshipStates,
  });

  const {
    data: scholarshipPages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["scholarships", selectedState],
    queryFn: ({ pageParam = 1 }) =>
      fetchScholarships(pageParam, LIMIT, selectedState ?? undefined),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * LIMIT;
      return totalFetched < lastPage.count ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const states = statesData?.data || [];
  const allScholarships = useMemo(
    () => scholarshipPages?.pages.flatMap((page) => page.data) || [],
    [scholarshipPages]
  );

  /* ---------------- ACTIONS ---------------- */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const applyFilter = () => {
    refetch();
    setShowFilters(false);
  };

  const handleReset = () => {
    setSelectedState(null);
    setShowFilters(false);
    // The queryKey change will trigger a refetch automatically
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1976d2"]} // Android color
            tintColor="#1976d2" // iOS color
          />
        }
      >
        {/* FILTER BUTTON */}
        <Pressable
          onPress={() => setShowFilters(true)}
          className="self-start flex-row items-center bg-[#0B5ED7] px-4 py-2 rounded-full mb-4"
        >
          <Ionicons name="filter" size={14} color="white" />
          <Text className="text-white ml-2 text-sm">
            {selectedState ? selectedState : "Filters"}
          </Text>
        </Pressable>

        {/* LOADING STATE */}
        {isLoading && <ActivityIndicator size="large" color="#0B5ED7" />}

        {/* SCHOLARSHIP LIST */}
        {!isLoading &&
          allScholarships.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/(scholarshipsscreens)/detailedScholarshipPage",
                  params: { id: item.id },
                })
              }
              className="mb-4 border border-[#CFE2FF] rounded-2xl p-4 bg-white"
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-xl bg-[#EAF3FF] items-center justify-center mr-3">
                  <Ionicons name="school" size={20} color="#0B5ED7" />
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {item.state_name}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 text-sm mt-3">
                {item.description}
              </Text>
            </Pressable>
          ))}

        {/* LOAD MORE BUTTON */}
        {hasNextPage && (
          <Pressable
            onPress={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mt-2 py-4 rounded-2xl bg-gray-50 border border-dashed border-gray-300 items-center justify-center"
          >
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#0B5ED7" />
            ) : (
              <Text className="text-[#0B5ED7] font-medium text-sm">
                Load More Scholarships
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>

      {/* FILTER PANEL (BOTTOM SHEET) */}
      {showFilters && (
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 p-5 shadow-xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">Select State</Text>
            <Pressable onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={22} color="gray" />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 300 }}>
            {states.map((state) => (
              <Pressable
                key={state.id}
                onPress={() => setSelectedState(state.name)}
                className={`px-4 py-3 rounded-xl mb-2 border ${
                  selectedState === state.name
                    ? "border-[#0B5ED7] bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <Text
                  className={`${
                    selectedState === state.name
                      ? "text-[#0B5ED7] font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  {state.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ACTIONS */}
          <View className="flex-row mt-5 gap-3">
            <Pressable
              onPress={handleReset}
              className="flex-1 py-3 rounded-xl border border-gray-400 items-center"
            >
              <Text className="text-gray-600">Reset</Text>
            </Pressable>

            <Pressable
              onPress={applyFilter}
              className="flex-1 py-3 rounded-xl bg-[#0B5ED7] items-center"
            >
              <Text className="text-white">Apply</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
