import { ResourcesHeader } from "@/app/components/ResourcesHeader";
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
  Modal,
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
      <ResourcesHeader title="Scholarships" />
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
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-500 text-xs uppercase tracking-widest font-bold">
              Available Schemes
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              Education & Aid
            </Text>
          </View>

          <Pressable
            onPress={() => setShowFilters(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${
              selectedState
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <Ionicons
              name={selectedState ? "funnel" : "filter-outline"}
              size={16}
              color={selectedState ? "#0B5ED7" : "#64748B"}
            />
            <Text
              className={`ml-2 font-semibold ${
                selectedState ? "text-[#0B5ED7]" : "text-gray-600"
              }`}
            >
              {selectedState ? selectedState : "Select State"}
            </Text>
          </Pressable>
        </View>

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
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setShowFilters(false)}
        />
        <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
          <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              Filter by State
            </Text>
            <Pressable
              onPress={() => setShowFilters(false)}
              className="bg-gray-100 p-2 rounded-full"
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 350 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap gap-2">
              {states.map((state) => (
                <Pressable
                  key={state.id}
                  onPress={() => setSelectedState(state.name)}
                  className={`px-5 py-3 rounded-2xl border ${
                    selectedState === state.name
                      ? "border-[#0B5ED7] bg-blue-600"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedState === state.name
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {state.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row mt-8 gap-4">
            <Pressable
              onPress={handleReset}
              className="flex-1 py-4 rounded-2xl bg-gray-100 items-center"
            >
              <Text className="text-gray-600 font-bold">Reset</Text>
            </Pressable>

            <Pressable
              onPress={applyFilter}
              className="flex-3 py-4 rounded-2xl bg-[#0B5ED7] items-center flex-[2]"
            >
              <Text className="text-white font-bold text-lg">Apply Filter</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
