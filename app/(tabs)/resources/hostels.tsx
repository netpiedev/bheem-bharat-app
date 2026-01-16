import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchHostels } from "@/app/lib/hostels.api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // Full width minus padding

export default function Hostels() {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"state" | "city" | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["hostels", selectedState, selectedCity],
    queryFn: ({ pageParam = 1 }) =>
      fetchHostels({
        pageParam: pageParam as number,
        state: selectedState,
        city: selectedCity,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const fetchedSoFar = lastPage.page * lastPage.limit;
      return lastPage.count > fetchedSoFar ? lastPage.page + 1 : undefined;
    },
  });

  const hostelsList = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const locationsMap = useMemo(() => {
    return hostelsList.reduce((acc, hostel) => {
      if (!acc[hostel.state]) acc[hostel.state] = [];
      if (!acc[hostel.state].includes(hostel.city)) {
        acc[hostel.state].push(hostel.city);
      }
      return acc;
    }, {} as Record<string, string[]>);
  }, [hostelsList]);

  const getOptions = (): string[] => {
    if (activeModal === "state") return Object.keys(locationsMap);
    if (activeModal === "city" && selectedState)
      return locationsMap[selectedState] || [];
    return [];
  };

  const getBadgeColors = (type: string) => {
    switch (type?.toLowerCase()) {
      case "boys":
        return {
          bg: "bg-blue-500",
          text: "text-white",
          icon: "male" as keyof typeof Ionicons.glyphMap,
        };
      case "girls":
        return {
          bg: "bg-pink-500",
          text: "text-white",
          icon: "female" as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          bg: "bg-purple-500",
          text: "text-white",
          icon: "people" as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSelect = (option: string) => {
    if (activeModal === "state") {
      setSelectedState(option);
      setSelectedCity(null);
    } else if (activeModal === "city") {
      setSelectedCity(option);
    }
    setActiveModal(null);
  };

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-3 font-medium">
          Loading Hostels...
        </Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-red-500 text-center mt-3 font-semibold text-lg">
          Error loading hostels
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Please try again later
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1976d2"]} // Android color
            tintColor="#1976d2" // iOS color
          />
        }
      >
        {/* Filter Section with gradient background */}
        <View className="bg-white px-4 pt-4 pb-6 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Find Hostels
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setActiveModal("state")}
              className={`flex-1 flex-row items-center justify-between px-4 py-3.5 rounded-2xl border-2 ${
                selectedState
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                  State
                </Text>
                <Text
                  numberOfLines={1}
                  className={`font-bold ${
                    selectedState ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {selectedState || "All States"}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={selectedState ? "#3B82F6" : "#9CA3AF"}
              />
            </Pressable>

            <Pressable
              onPress={() => {
                if (selectedState) setActiveModal("city");
                else alert("Please select a State first");
              }}
              className={`flex-1 flex-row items-center justify-between px-4 py-3.5 rounded-2xl border-2 ${
                selectedCity
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-gray-200"
              } ${!selectedState ? "opacity-40" : "opacity-100"}`}
            >
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                  City
                </Text>
                <Text
                  numberOfLines={1}
                  className={`font-bold ${
                    selectedCity ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {selectedCity || "All Cities"}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={selectedCity ? "#3B82F6" : "#9CA3AF"}
              />
            </Pressable>
          </View>

          {(selectedState || selectedCity) && (
            <Pressable
              onPress={() => {
                setSelectedState(null);
                setSelectedCity(null);
              }}
              className="mt-3 flex-row items-center justify-center py-2"
            >
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text className="text-red-500 text-sm font-semibold ml-1">
                Clear All Filters
              </Text>
            </Pressable>
          )}
        </View>

        {/* Results Info */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-gray-600 font-medium">
            {hostelsList.length} hostel{hostelsList.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
        </View>

        {/* Hostel Cards */}
        <View className="px-4">
          {hostelsList.length > 0 ? (
            hostelsList.map((item) => {
              const badge = getBadgeColors(item.hostel_type);
              const hasImage = item.images && item.images.length > 0;

              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(hostelscreens)/detailedHostelPage",
                      params: { id: item.id, name: item.name },
                    })
                  }
                  className="mb-4 bg-white rounded-3xl overflow-hidden shadow-md active:opacity-95"
                  style={{ elevation: 3 }}
                >
                  {/* Image Section */}
                  <View className="relative h-48 bg-gray-200">
                    {hasImage ? (
                      <Image
                        source={{ uri: item.images[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 items-center justify-center">
                        <Ionicons name="home" size={64} color="#93C5FD" />
                      </View>
                    )}

                    {/* Overlay Gradient */}
                    <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Type Badge */}
                    <View className="absolute top-3 right-3">
                      <View
                        className={`${badge.bg} px-3 py-1.5 rounded-full flex-row items-center shadow-lg`}
                      >
                        <Ionicons name={badge.icon} size={14} color="white" />
                        <Text
                          className={`${badge.text} text-xs font-bold uppercase ml-1`}
                        >
                          {item.hostel_type}
                        </Text>
                      </View>
                    </View>

                    {/* Capacity Badge */}
                    <View className="absolute bottom-3 left-3">
                      <View className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex-row items-center">
                        <Ionicons name="people" size={14} color="#3B82F6" />
                        <Text className="text-gray-800 text-xs font-bold ml-1">
                          {item.capacity} Students
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Content Section */}
                  <View className="p-4">
                    <Text
                      className="font-bold text-gray-900 text-lg mb-2"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    <View className="flex-row items-center">
                      <View className="bg-gray-100 p-1.5 rounded-lg mr-2">
                        <Ionicons name="location" size={16} color="#3B82F6" />
                      </View>
                      <Text
                        className="text-gray-600 text-sm font-medium flex-1"
                        numberOfLines={1}
                      >
                        {item.city}, {item.state}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#CBD5E1"
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View className="items-center justify-center py-16 bg-white rounded-3xl">
              <View className="bg-gray-100 p-6 rounded-full mb-4">
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mb-1">
                No hostels found
              </Text>
              <Text className="text-gray-500 text-sm">
                Try adjusting your filters
              </Text>
            </View>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <Pressable
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-2 mb-4 py-4 rounded-2xl bg-white border-2 border-blue-100 items-center justify-center shadow-sm"
              style={{ elevation: 2 }}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-blue-600 font-bold text-base mr-2">
                    Load More Hostels
                  </Text>
                  <Ionicons
                    name="arrow-down-circle"
                    size={20}
                    color="#3B82F6"
                  />
                </View>
              )}
            </Pressable>
          )}

          {!hasNextPage && hostelsList.length > 0 && (
            <View className="py-6 items-center">
              <View className="h-[1px] w-full bg-gray-200 absolute top-1/2" />
              <Text className="bg-gray-50 px-4 text-gray-400 text-sm font-medium">
                You've reached the end
              </Text>
            </View>
          )}
        </View>

        {/* Help Card */}
        <View className="px-4 mt-4">
          <Pressable className="bg-blue-500 rounded-3xl p-6 flex-row items-center shadow-lg active:opacity-90">
            <View className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mr-4">
              <Ionicons name="help-circle" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-white text-lg mb-1">
                Need Help?
              </Text>
              <Text className="text-blue-100 text-sm">View FAQs & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ height: "60%" }}>
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">
                Select {activeModal === "state" ? "State" : "City"}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={getOptions()}
              keyExtractor={(item) => item}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected =
                  (activeModal === "state" && selectedState === item) ||
                  (activeModal === "city" && selectedCity === item);

                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    className={`py-4 px-4 mb-2 rounded-2xl flex-row justify-between items-center ${
                      isSelected
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50"
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        isSelected ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <View className="bg-blue-500 p-1 rounded-full">
                        <Ionicons name="checkmark" size={18} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
