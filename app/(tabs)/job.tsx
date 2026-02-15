import { useLanguage } from "@/app/lib/LanguageContext";
import { fetchJobs } from "@/app/lib/jobs.api";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { JobType } from "@/app/types/jobs.types";

export default function JobTab() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [selectedType, setSelectedType] = useState<JobType | undefined>(
    undefined
  );
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce location query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "jobs",
      selectedType,
      debouncedLocation || null,
      debouncedSearch || null,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchJobs(
        pageParam as number,
        10,
        selectedType,
        debouncedLocation || undefined,
        debouncedSearch || undefined
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.count) return undefined;
      const totalFetched = allPages.length * lastPage.limit;
      const hasMore = totalFetched < lastPage.count;
      return hasMore ? allPages.length + 1 : undefined;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const jobs = useMemo(() => {
    const allJobs = data?.pages.flatMap((page) => page.data) ?? [];
    return allJobs;
  }, [data]);

  const getTypeBadgeColor = (type: JobType) => {
    switch (type) {
      case "remote":
        return "bg-green-100 text-green-700";
      case "hybrid":
        return "bg-blue-100 text-blue-700";
      case "onsite":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: JobType) => {
    switch (type) {
      case "remote":
        return t("job_type_remote");
      case "hybrid":
        return t("job_type_hybrid");
      case "onsite":
        return t("job_type_onsite");
      default:
        return type;
    }
  };

  // Loading placeholder component
  const JobSkeleton = () => (
    <View className="mb-4 bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-2">
          <View className="h-5 bg-gray-200 rounded-lg mb-2 w-3/4" />
          <View className="h-4 bg-gray-200 rounded-lg mb-2 w-1/2" />
        </View>
        <View className="h-6 w-16 bg-gray-200 rounded-lg" />
      </View>
      <View className="h-4 bg-gray-200 rounded-lg mb-2 w-full" />
      <View className="h-4 bg-gray-200 rounded-lg mb-3 w-5/6" />
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="h-4 bg-gray-200 rounded-lg w-24" />
        <View className="h-4 bg-gray-200 rounded-lg w-20" />
      </View>
    </View>
  );

  return (
    <View key={lang} className="flex-1 bg-[#F9FAFB]">
      {/* Blue Header */}
      <LinearGradient
        colors={["#0B5ED7", "#0A58CA"]}
        className="pb-6 rounded-b-3xl"
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-4">
            <Text className="text-white text-xl font-semibold mb-4">
              {t("job_title")}
            </Text>

            {/* Search and Location Row */}
            <View className="flex-row gap-2 mb-3">
              {/* Search */}
              <View className="flex-1 bg-white rounded-xl flex-row items-center px-4 py-3 shadow-sm">
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder={t("job_search_placeholder")}
                  placeholderTextColor="#9CA3AF"
                  className="ml-2 flex-1 text-gray-800 text-sm"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>

              {/* Location Filter */}
              <View className="bg-white rounded-xl flex-row items-center px-3 py-3 shadow-sm">
                <Ionicons name="location" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder={t("job_location_placeholder")}
                  placeholderTextColor="#9CA3AF"
                  className="ml-2 w-24 text-gray-800 text-sm"
                  value={locationQuery}
                  onChangeText={setLocationQuery}
                />
                {locationQuery.length > 0 && (
                  <Pressable onPress={() => setLocationQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Type Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedType(undefined)}
                className={`px-4 py-2 rounded-lg ${
                  !selectedType
                    ? "bg-white"
                    : "bg-white/20 border border-white/30"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    !selectedType ? "text-[#0B5ED7]" : "text-white"
                  }`}
                >
                  {t("job_filter_all")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedType("remote")}
                className={`px-4 py-2 rounded-lg ${
                  selectedType === "remote"
                    ? "bg-white"
                    : "bg-white/20 border border-white/30"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedType === "remote" ? "text-[#0B5ED7]" : "text-white"
                  }`}
                >
                  {t("job_type_remote")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedType("hybrid")}
                className={`px-4 py-2 rounded-lg ${
                  selectedType === "hybrid"
                    ? "bg-white"
                    : "bg-white/20 border border-white/30"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedType === "hybrid" ? "text-[#0B5ED7]" : "text-white"
                  }`}
                >
                  {t("job_type_hybrid")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedType("onsite")}
                className={`px-4 py-2 rounded-lg ${
                  selectedType === "onsite"
                    ? "bg-white"
                    : "bg-white/20 border border-white/30"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedType === "onsite" ? "text-[#0B5ED7]" : "text-white"
                  }`}
                >
                  {t("job_type_onsite")}
                </Text>
              </Pressable>
            </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0B5ED7"]}
            tintColor="#0B5ED7"
          />
        }
      >
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-700 text-center">
              {t("job_error_loading")}
            </Text>
          </View>
        )}

        {/* Active Filters Info */}
        {(debouncedSearch || debouncedLocation || selectedType) && (
          <View className="mb-4 flex-row items-center flex-wrap gap-2">
            <Text className="text-gray-500 text-xs font-medium">
              {t("job_showing_results")}:
            </Text>
            {debouncedSearch && (
              <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-blue-700 text-xs font-medium">
                  {t("job_search")}: {debouncedSearch}
                </Text>
                <Pressable
                  onPress={() => setSearchQuery("")}
                  className="ml-2"
                >
                  <Ionicons name="close" size={14} color="#1E40AF" />
                </Pressable>
              </View>
            )}
            {debouncedLocation && (
              <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-green-700 text-xs font-medium">
                  {t("job_location")}: {debouncedLocation}
                </Text>
                <Pressable
                  onPress={() => setLocationQuery("")}
                  className="ml-2"
                >
                  <Ionicons name="close" size={14} color="#166534" />
                </Pressable>
              </View>
            )}
            {selectedType && (
              <View className="bg-purple-100 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-purple-700 text-xs font-medium">
                  {getTypeLabel(selectedType)}
                </Text>
                <Pressable
                  onPress={() => setSelectedType(undefined)}
                  className="ml-2"
                >
                  <Ionicons name="close" size={14} color="#6B21A8" />
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Loading Skeletons for Initial Load */}
        {(isLoading || (isFetching && jobs.length === 0)) ? (
          <>
            {[...Array(5)].map((_, index) => (
              <JobSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <Pressable
              key={job.id}
              onPress={() =>
                router.push({
                  pathname: "/(jobscreens)/detailedJobPage",
                  params: { id: job.id },
                })
              }
              className="mb-4 bg-white rounded-2xl p-5 shadow-sm border border-blue-100 active:opacity-95"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-lg text-gray-900 mb-2">
                    {job.title}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 text-sm ml-1">
                      {job.location}
                    </Text>
                  </View>
                </View>
                <View
                  className={`px-3 py-1 rounded-lg ${getTypeBadgeColor(
                    job.type
                  )}`}
                >
                  <Text className="text-xs font-semibold">
                    {getTypeLabel(job.type)}
                  </Text>
                </View>
              </View>

              <Text
                className="text-gray-600 text-sm mb-3 leading-5"
                numberOfLines={2}
              >
                {job.description}
              </Text>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={16} color="#10B981" />
                  <Text className="text-green-600 font-semibold text-sm ml-1">
                    {job.salary}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 text-sm font-medium mr-1">
                    {t("job_view_details")}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons name="briefcase-outline" size={48} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-base text-center">
              {t("job_no_jobs_found")}
            </Text>
            {(debouncedSearch || debouncedLocation || selectedType) && (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setLocationQuery("");
                  setSelectedType(undefined);
                }}
                className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">
                  {t("job_clear_filters")}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Loading More Skeletons */}
        {isFetchingNextPage && jobs.length > 0 && (
          <>
            {[...Array(3)].map((_, index) => (
              <JobSkeleton key={`loading-more-${index}`} />
            ))}
          </>
        )}

        {/* Load More Button */}
        {hasNextPage && jobs.length > 0 && !isFetchingNextPage && (
          <Pressable
            onPress={async () => {
              if (hasNextPage && !isFetchingNextPage) {
                try {
                  await fetchNextPage();
                } catch (err) {
                  console.error("Error loading more jobs:", err);
                }
              }
            }}
            disabled={isFetchingNextPage || !hasNextPage}
            className="py-4 rounded-2xl items-center justify-center border mt-4 border-blue-100 bg-blue-50 active:bg-blue-100"
          >
            <View className="flex-row items-center">
              <Text className="text-blue-600 font-semibold text-base">
                {t("job_load_more")}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color="#2563EB"
                style={{ marginLeft: 8 }}
              />
            </View>
          </Pressable>
        )}

        {/* End of Results */}
        {!hasNextPage && jobs.length > 0 && (
          <View className="items-center py-4 mt-2">
            <Text className="text-gray-400 text-sm">
              {t("job_end_of_results")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
