import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface HeaderProps {
  onStateSelected?: (state: string) => void;
}

export default function Header({ onStateSelected }: HeaderProps) {
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState("Select State");

  useEffect(() => {
    const loadState = async () => {
      const savedState = await AsyncStorage.getItem("userState");
      if (savedState) {
        setSelectedState(savedState);
        // Sync the initial load with the parent component
        if (onStateSelected) onStateSelected(savedState);
      }
    };
    loadState();
  }, []);

  const handleSelectState = async (state: string) => {
    await AsyncStorage.setItem("userState", state);
    setSelectedState(state);
    setModalVisible(false);

    // Trigger the callback to refresh React Query data in HomeScreen
    if (onStateSelected) {
      onStateSelected(state);
    }
  };

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.multiRemove(["token", "user", "mobileNumber"]);
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <View className="bg-[#014BB4] p-6 pt-12 rounded-b-[30px]">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white text-xl font-bold">Bheem Bharat</Text>
          <Pressable
            onPress={() => setModalVisible(true)}
            className="flex-row items-center mt-1"
          >
            <Ionicons name="location-outline" size={16} color="white" />
            <Text className="text-white ml-1 font-medium">{selectedState}</Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color="white"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={handleLogout}
          className="bg-white/20 p-2 rounded-full"
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
        </Pressable>
      </View>

      <View className="bg-white flex-row items-center px-4 py-4 rounded-xl">
        <Ionicons name="search" size={20} color="gray" />
        <Text className="text-gray-400 ml-2">
          Search community, profiles...
        </Text>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select State</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </Pressable>
            </View>

            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectState(item)}
                  className={`py-4 border-b border-gray-100 ${
                    selectedState === item ? "bg-blue-50 px-2 rounded-lg" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedState === item
                        ? "text-blue-600 font-bold"
                        : "text-gray-800"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
