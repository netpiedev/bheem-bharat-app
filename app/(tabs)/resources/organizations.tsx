import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchOrganizations } from "@/app/lib/organizations.api";
import { OrganizationListItem } from "@/app/types/organizations.types";

export default function Organizations() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });

  const organizations: OrganizationListItem[] = data || [];

  // useMemo ensures we only re-calculate when searchQuery or data changes
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, organizations]);

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading organizations...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Error loading data.</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Improves UX with search bars
      >
        {/* Search Bar */}
        <View className="mb-6 bg-white border border-gray-200 rounded-xl flex-row items-center px-4 py-1 shadow-sm">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search by name or location..."
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-gray-800"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing" // Adds clear button on iOS
          />
        </View>

        {/* Results Info */}
        {searchQuery.length > 0 && (
          <Text className="text-gray-400 text-xs mb-4 px-1 uppercase font-bold tracking-wider">
            Found {filteredOrganizations.length} results
          </Text>
        )}

        {/* Organization cards */}
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
      </ScrollView>
    </View>
  );
}
