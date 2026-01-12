import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchHostels } from "@/app/lib/hostels.api";
import { HostelListItem } from "@/app/types/hostels.types";

export default function Hostels() {
  // 1. Fetch data from your API
  const { data, isLoading, error } = useQuery({
    queryKey: ["hostels"],
    queryFn: fetchHostels,
  });

  const hostelsList: HostelListItem[] = data || [];

  // --- 2. State Management with Types ---
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Controls which modal is open
  const [activeModal, setActiveModal] = useState<"state" | "city" | null>(null);

  // 3. Dynamically generate LOCATIONS from the API data
  const locationsMap = hostelsList.reduce((acc, hostel) => {
    if (!acc[hostel.state]) {
      acc[hostel.state] = [];
    }
    if (!acc[hostel.state].includes(hostel.city)) {
      acc[hostel.state].push(hostel.city);
    }
    return acc;
  }, {} as Record<string, string[]>);

  // --- 4. Helper Functions ---
  const router = useRouter();
  const getOptions = (): string[] => {
    if (activeModal === "state") {
      return Object.keys(locationsMap);
    }
    if (activeModal === "city" && selectedState) {
      return locationsMap[selectedState] || [];
    }
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

  // FIX: Added ': string' type here to fix the error
  const handleSelect = (option: string) => {
    if (activeModal === "state") {
      setSelectedState(option);
      setSelectedCity(null); // Reset city when state changes
    } else if (activeModal === "city") {
      setSelectedCity(option);
    }
    setActiveModal(null); // Close modal
  };

  // Filter Logic
  const filteredHostels = hostelsList.filter((hostel) => {
    const matchState = selectedState ? hostel.state === selectedState : true;
    const matchCity = selectedCity ? hostel.city === selectedCity : true;
    return matchState && matchCity;
  });

  // --- 5. Handle Loading & Error States ---
  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading Hostels...</Text>
      </View>
    );
  if (error)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading data.</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Filter Section --- */}
        <View className="flex-row gap-3 mb-6">
          {/* STATE BUTTON */}
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

          {/* CITY BUTTON */}
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

        {/* --- Results Section --- */}
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

        {filteredHostels.length > 0 ? (
          filteredHostels.map((item) => {
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
                // Redesigned Card: White bg, specific border color, soft shadow
                className="mb-4 w-full bg-white border border-[#E5EAF2] rounded-3xl p-4 flex-row items-center shadow-sm"
              >
                {/* Left Icon Container: Light blue tint */}
                <View className="w-14 h-14 rounded-2xl bg-[#E8F2FF] items-center justify-center mr-4">
                  <Ionicons name="home-outline" size={26} color="#1D72D2" />
                </View>

                <View className="flex-1">
                  {/* Top Row: Name and Type Badge */}
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

                  {/* Location Row */}
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-sharp" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {item.city}, {item.state}
                    </Text>
                  </View>

                  {/* Capacity Row */}
                  <Text className="text-gray-500 text-sm mt-2">
                    Capacity: {item.capacity} students
                  </Text>
                </View>

                {/* Right Action Icon: Light blue circle with arrow */}
                <View className="w-8 h-8 rounded-full bg-[#E8F2FF] items-center justify-center ml-2">
                  <Ionicons name="chevron-forward" size={18} color="#1D72D2" />
                </View>
              </Pressable>
            );
          })
        ) : (
          <View className="items-center justify-center py-10">
            <Text className="text-gray-400 font-medium">
              No hostels found in this location.
            </Text>
          </View>
        )}

        {/* --- Help Card --- */}
        <Pressable
          onPress={() => {
            /* Add navigation to FAQ if needed */
          }}
          className="mb-4 w-full bg-white border border-[#E5EAF2] rounded-3xl p-4 flex-row items-center shadow-sm mt-2 active:bg-gray-50"
        >
          {/* Left Icon Container: Matches Hostel Icon Style */}
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

          {/* Right Action Icon: Matches Hostel Chevron Style */}
          <View className="w-8 h-8 rounded-full bg-[#E8F2FF] items-center justify-center ml-2">
            <Ionicons name="chevron-forward" size={18} color="#1D72D2" />
          </View>
        </Pressable>
      </ScrollView>

      {/* --- 4. The Selection Modal --- */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[50%]">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                Select {activeModal === "state" ? "State" : "City"}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* List of Options */}
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
