import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "@/app/components/homescreen/Header";

import { useLanguage } from "@/app/lib/LanguageContext";
import { fetchArticles } from "@/app/lib/articles.api";
import { fetchHostels } from "@/app/lib/hostels.api";
import { getMyProfile } from "@/app/lib/matrimony.api";
import { fetchOrganizations } from "@/app/lib/organizations.api";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState<string | undefined>(
    undefined
  );

  // Load state from storage on mount
  useEffect(() => {
    const getSavedState = async () => {
      const saved = await AsyncStorage.getItem("userState");
      if (saved) setSelectedState(saved);
    };
    getSavedState();
  }, []);

  // Sync function to be passed to Header
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
  };

  // React Query - Key includes selectedState so it refetches when state changes
  const { data: organizations, refetch: refetchOrgs } = useQuery({
    queryKey: ["organizations-home", selectedState],
    queryFn: () => fetchOrganizations({ state: selectedState }),
    enabled: !!selectedState,
  });

  const { data: hostels, refetch: refetchHostels } = useQuery({
    queryKey: ["hostels-home", selectedState],
    queryFn: () => fetchHostels({ state: selectedState }),
    enabled: !!selectedState,
  });

  const { data: articles, refetch: refetchArticles } = useQuery({
    queryKey: ["articles-home"],
    queryFn: () => fetchArticles(1, 5),
  });

  const { data: myProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["matrimony-my-profile"],
    queryFn: () => getMyProfile(),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Execute all refetches in parallel
    await Promise.all([
      refetchOrgs(),
      refetchHostels(),
      refetchArticles(),
      refetchProfile(),
    ]);
    setRefreshing(false);
  }, [refetchOrgs, refetchHostels, refetchArticles, refetchProfile]);

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0B5ED7"]} // Android color
          tintColor="#0B5ED7" // iOS color
        />
      }
    >
      {/* Pass the handleStateChange to Header so it can trigger a refresh */}
      <Header onStateSelected={handleStateChange} />

      <ResourceScroll />

      {/* Special Matrimony Drive Banner */}
      <View className="mx-5 bg-[#014BB4] p-6 rounded-3xl mb-6">
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-white mr-2" />
          <Text className="text-white opacity-80 uppercase text-xs font-bold tracking-widest">
            {t("home_featured")}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold mb-2">
          {t("home_matrimony_drive_title")}
        </Text>
        <Text className="text-white/80 mb-4">
          {t("home_matrimony_drive_desc")}
        </Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: myProfile
                ? "/(matrimony)/browse"
                : "/(matrimony)/currentUserProfile",
            })
          }
          className="bg-white self-start px-6 py-3 rounded-lg"
        >
          <Text className="text-[#014BB4] font-medium">
            {t("home_explore_now")}
          </Text>
        </Pressable>
      </View>

      {/* Hostels Section (Filtered) */}
      <HorizontalSection
        title={`${t("home_hostels")} ${
          selectedState ? `${t("home_in")} ${selectedState}` : ""
        }`}
        icon="bed-outline"
        route="/resources/hostels"
        data={hostels?.data || []}
        renderItem={(item) => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/(hostelscreens)/detailedHostelPage",
                params: { id: item.id, name: item.name },
              });
            }}
            // Fixed width and a background color for the bottom section
            className="w-64 mr-4 rounded-3xl overflow-hidden bg-[#F5FAFF] border border-blue-100"
          >
            {/* Top Section: Image */}
            <View className="h-40 w-full bg-gray-200">
              {item.images?.[0] ? (
                <Image
                  source={{ uri: item.images[0] }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-blue-600">
                  <Ionicons name="bed-outline" size={40} color="white" />
                </View>
              )}
            </View>

            {/* Bottom Section: Info */}
            <View className="p-4">
              <Text
                className="text-gray-800 font-bold text-lg"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text className="text-gray-400 text-xs mt-1">
                {item.city} • {item.hostel_type}
              </Text>

              <View className="flex-row items-center mt-3">
                <Ionicons name="person-outline" size={14} color="#2563eb" />
                <Text className="text-gray-400 text-[#2563eb] text-xs ml-2">
                  {t("home_capacity")} {item.capacity}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Stats Section */}
      <View className="flex-row justify-between px-5 my-6">
        {[
          { label: t("home_profiles"), val: "5,000+", icon: "people" },
          { label: t("home_cities"), val: "50+", icon: "location" },
          { label: t("home_stories"), val: "500+", icon: "ribbon" },
        ].map((stat, i) => (
          <View
            key={i}
            className="bg-[#F5FAFF] p-4 rounded-2xl items-center w-[30%] border border-blue-100"
          >
            <Text className="text-blue-600 font-bold text-lg mb-1">
              {stat.val}
            </Text>
            <Text className="text-gray-600 text-xs">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* News & Articles */}
      <HorizontalSection
        title={t("home_news_articles")}
        route="/resources/articles"
        icon="newspaper-outline"
        data={articles?.data || []}
        renderItem={(item) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(articlesscreen)/detailedarticlesscreenPage",
                params: { id: item.id },
              })
            }
            className="w-64 mr-4 p-4 rounded-2xl bg-blue-600 min-h-[140px] justify-between"
          >
            <View>
              <Text className="text-white/70 text-xs font-bold uppercase">
                {item.category}
              </Text>
              <Text
                className="text-white font-bold text-base mt-1"
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>
            <TouchableOpacity className="bg-white/20 self-start px-3 py-1 rounded-md">
              <Text className="text-white text-xs">{t("home_read_more")}</Text>
            </TouchableOpacity>
          </Pressable>
        )}
      />

      {/* Organizations Section (Filtered) */}
      <HorizontalSection
        title={`${t("home_organizations")} ${
          selectedState ? `${t("home_in")} ${selectedState}` : ""
        }`}
        icon="business-outline"
        route="/resources/organizations"
        data={organizations?.data || []}
        renderItem={(item) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(organizationsscreens)/detailedOrganizationsPage",
                params: { id: item.id, name: item.name },
              })
            }
            className="w-64 mr-4 p-4 rounded-2xl bg-[#F5FAFF] border border-blue-100"
            // className="bg-[#F5FAFF] p-5 rounded-2xl w-40 mr-4 border border-blue-100 items-center"
          >
            <Text className="font-bold text-lg text-gray-700">{item.name}</Text>
            <Text className="text-gray-400 text-xs">
              {item.city}, {item.state}
            </Text>
            <Text className="text-gray-400 text-sm mt-6" numberOfLines={2}>
              {item.short_description}
            </Text>
          </Pressable>
        )}
      />

      <View className="h-10" />
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  data: any[];
  route: string;
  icon: any;
  renderItem: (item: any) => React.ReactNode;
}

const HorizontalSection = ({
  title,
  data,
  route,
  icon,
  renderItem,
}: SectionProps) => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View className="my-4">
      <View className="flex-row justify-between items-center px-5 mb-3">
        <View className="flex-row items-center">
          {/* Icon placed before the title */}
          <View className="rounded-lg mr-2">
            <Ionicons name={icon} size={18} color="#2563eb" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        </View>

        <Pressable onPress={() => router.push(route as any)} hitSlop={20}>
          <Text className="text-blue-600">{t("home_view_all")}</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20 }}
        data={data}
        // Passing index here so the cards can have alternating theme colors
        renderItem={({ item }) => renderItem(item) as React.ReactElement}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const ResourceScroll = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const resources = [
    {
      id: "1",
      title: t("home_buddhavihar_title"),
      sub: t("home_buddhavihar_sub"),
      icon: "business-outline",
      route: "/buddhavihar",
    },
    {
      id: "2",
      title: t("home_scholarships_title"),
      sub: t("home_scholarships_sub"),
      icon: "school-outline",
      route: "/resources/scholarships",
    },
    {
      id: "3",
      title: t("home_matrimony_title"),
      sub: t("home_matrimony_sub"),
      icon: "heart-outline",
      route: "/(matrimony)/browse",
    },
  ];

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={resources}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: item.route as any })}
          className="bg-[#F5FAFF] p-5 rounded-2xl w-40 mr-4 border border-blue-100 items-center"
        >
          <View className="bg-[#DBE6F7] w-14 h-14 rounded-2xl items-center justify-center mb-4">
            <Ionicons name={item.icon as any} size={24} color="#3184D6" />
          </View>
          <Text
            className="font-semibold text-[15px] text-gray-800 text-center leading-5"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text className="text-gray-400 text-xs mt-2 text-center">
            {item.sub}
          </Text>
        </Pressable>
      )}
    />
  );
};
