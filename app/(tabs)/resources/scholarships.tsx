import axiosInstance from "@/app/lib/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

/* ---------------- TYPES ---------------- */

type ScholarshipState = {
  id: string;
  name: string;
};

type Scholarship = {
  id: string;
  title: string;
  description: string;
  state_id: string;
  state_name: string;
  last_date: string;
};

/* ---------------- SCREEN ---------------- */

export default function Scholarships() {
  const router = useRouter();

  const [states, setStates] = useState<ScholarshipState[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedState, setSelectedState] = useState<string | null>(null);

  /* ---------------- FETCH DATA ---------------- */

  const fetchStates = async () => {
    const res = await axiosInstance.get("/resources/scholarships/states");
    setStates(res.data.data);
  };

  const fetchScholarships = async (stateName?: string) => {
    setLoading(true);

    const res = await axiosInstance.get("/resources/scholarships", {
      params: stateName ? { state: stateName } : undefined,
    });

    setScholarships(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStates();
    fetchScholarships();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- APPLY FILTER ---------------- */

  const applyFilter = async () => {
    await fetchScholarships(selectedState ?? undefined);
    setShowFilters(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
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

        {/* LOADING */}
        {loading && <ActivityIndicator size="large" color="#0B5ED7" />}

        {/* SCHOLARSHIP LIST */}
        {!loading &&
          scholarships.map((item) => (
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
              onPress={() => {
                setSelectedState(null);
                fetchScholarships();
                setShowFilters(false);
              }}
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
