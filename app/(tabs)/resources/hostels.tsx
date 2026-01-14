import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchHostels } from "@/app/lib/hostels.api";

export default function Hostels() {
  const router = useRouter();

  // --- 1. State Management ---
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"state" | "city" | null>(null);

  // --- 2. Infinite Query Implementation ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    // We add filters to the queryKey so the list resets when filters change
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

  // Flatten the pages of hostels into a single array
  const hostelsList = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // --- 3. Locations Logic (for Modals) ---
  // Note: In a real pagination scenario, you might want a separate API for
  // getting all available states/cities, otherwise this only shows
  // locations from currently loaded pages.
  const locationsMap = useMemo(() => {
    return hostelsList.reduce((acc, hostel) => {
      if (!acc[hostel.state]) acc[hostel.state] = [];
      if (!acc[hostel.state].includes(hostel.city)) {
        acc[hostel.state].push(hostel.city);
      }
      return acc;
    }, {} as Record<string, string[]>);
  }, [hostelsList]);

  // --- 4. Helper Functions ---
  const getOptions = (): string[] => {
    if (activeModal === "state") return Object.keys(locationsMap);
    if (activeModal === "city" && selectedState)
      return locationsMap[selectedState] || [];
    return [];
  };

  const getBadgeColors = (type: string) => {
    switch (type?.toLowerCase()) {
      case "boys":
        return { bg: "bg-orange-50", text: "text-orange-600" };
      case "girls":
        return { bg: "bg-pink-50", text: "text-pink-600" };
      default:
        return { bg: "bg-green-50", text: "text-green-600" };
    }
  };

  const handleSelect = (option: string) => {
    if (activeModal === "state") {
      setSelectedState(option);
      setSelectedCity(null);
    } else if (activeModal === "city") {
      setSelectedCity(option);
    }
    setActiveModal(null);
  };

  // --- 5. Conditional Rendering for Loading/Error ---
  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1D72D2" />
        <Text className="text-gray-500 mt-2">Loading Hostels...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-red-500 text-center mt-2">
          Error loading hostels. Please try again.
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- Filter Section --- */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => setActiveModal("state")}
            className={`flex-1 flex-row items-center justify-between px-4 py-3 rounded-2xl border ${
              activeModal === "state"
                ? "bg-blue-50 border-blue-500"
                : "bg-white border-gray-200"
            }`}
          >
            <View className="flex-1">
              <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                State
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-800 font-semibold mt-0.5"
              >
                {selectedState || "Select State"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={() => {
              if (selectedState) setActiveModal("city");
              else alert("Please select a State first");
            }}
            className={`flex-1 flex-row items-center justify-between px-4 py-3 rounded-2xl border ${
              activeModal === "city"
                ? "bg-blue-50 border-blue-500"
                : "bg-white border-gray-200"
            } ${!selectedState ? "opacity-50" : "opacity-100"}`}
          >
            <View className="flex-1">
              <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                City
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-800 font-semibold mt-0.5"
              >
                {selectedCity || "Select City"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* --- Results Info --- */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-gray-900 font-semibold text-lg">
            Available Hostels
          </Text>
          {(selectedState || selectedCity) && (
            <Pressable
              onPress={() => {
                setSelectedState(null);
                setSelectedCity(null);
              }}
            >
              <Text className="text-blue-600 text-sm font-medium">
                Clear Filters
              </Text>
            </Pressable>
          )}
        </View>

        {/* --- Hostel Cards --- */}
        {hostelsList.length > 0 ? (
          hostelsList.map((item) => {
            const badge = getBadgeColors(item.hostel_type);
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/(hostelscreens)/detailedHostelPage",
                    params: { id: item.id, name: item.name },
                  })
                }
                className="mb-4 w-full bg-white border border-[#E5EAF2] rounded-3xl p-4 flex-row items-center shadow-sm"
              >
                <View className="w-14 h-14 rounded-2xl bg-[#E8F2FF] items-center justify-center mr-4">
                  <Ionicons name="home-outline" size={26} color="#1D72D2" />
                </View>

                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <Text className="font-semibold text-gray-900 text-[15px] flex-1 mr-2">
                      {item.name}
                    </Text>
                    <View className={`${badge.bg} px-2.5 py-1 rounded-lg`}>
                      <Text
                        className={`${badge.text} text-xs font-bold uppercase`}
                      >
                        {item.hostel_type}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-sharp" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {item.city}, {item.state}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm mt-2">
                    Capacity: {item.capacity} students
                  </Text>
                </View>

                <View className="w-8 h-8 rounded-full bg-[#E8F2FF] items-center justify-center ml-2">
                  <Ionicons name="chevron-forward" size={18} color="#1D72D2" />
                </View>
              </Pressable>
            );
          })
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons name="search-outline" size={48} color="#E5E7EB" />
            <Text className="text-gray-400 font-medium mt-2">
              No hostels found in this location.
            </Text>
          </View>
        )}

        {/* --- Load More Button --- */}
        {hasNextPage && (
          <Pressable
            onPress={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mt-2 py-4 rounded-2xl border border-blue-100 bg-blue-50 items-center justify-center"
          >
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#1D72D2" />
            ) : (
              <Text className="text-blue-600 font-semibold">
                Load More Hostels
              </Text>
            )}
          </Pressable>
        )}

        {!hasNextPage && hostelsList.length > 0 && (
          <Text className="text-center text-gray-400 text-sm mt-4 italic">
            No more hostels to show.
          </Text>
        )}

        {/* --- Help Card --- */}
        <Pressable className="mb-4 w-full bg-white border border-[#E5EAF2] rounded-3xl p-4 flex-row items-center shadow-sm mt-6 active:bg-gray-50">
          <View className="w-14 h-14 rounded-2xl bg-[#E8F2FF] items-center justify-center mr-4">
            <Ionicons name="help-circle-outline" size={28} color="#1D72D2" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-[16px]">
              Hostel Help & FAQs
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Common questions answered
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-[#E8F2FF] items-center justify-center ml-2">
            <Ionicons name="chevron-forward" size={18} color="#1D72D2" />
          </View>
        </Pressable>
      </ScrollView>

      {/* --- Selection Modal --- */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[50%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                Select {activeModal === "state" ? "State" : "City"}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getOptions()}
              keyExtractor={(item) => item}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="py-4 border-b border-gray-100 flex-row justify-between items-center"
                >
                  <Text
                    className={`text-base ${
                      (activeModal === "state" && selectedState === item) ||
                      (activeModal === "city" && selectedCity === item)
                        ? "text-[#0B5ED7] font-bold"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
                  </Text>
                  {((activeModal === "state" && selectedState === item) ||
                    (activeModal === "city" && selectedCity === item)) && (
                    <Ionicons name="checkmark" size={20} color="#0B5ED7" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
