import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
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

      {/* Image Carousel */}
      <ImageCarousel />

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
                <Text className="text-[#2563eb] text-xs ml-2">
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_WIDTH = SCREEN_WIDTH; // Full width for proper paging

const ImageCarousel = () => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const currentIndexRef = useRef(1);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isScrollingRef = useRef(false);
  const isJumpingRef = useRef(false);

  // Carousel images with navigation mapping
  const carouselImages = [
    require("@/assets/images/crousel bheem bharat /6.png"),
    require("@/assets/images/crousel bheem bharat /7.png"), // -> jobs tab
    require("@/assets/images/crousel bheem bharat /8.png"), // -> matrimony tab
    require("@/assets/images/crousel bheem bharat /9.png"), // -> buddhavihar tab
    require("@/assets/images/crousel bheem bharat /10.png"),
  ];

  // Create infinite scroll data by duplicating items
  const infiniteData = [
    carouselImages[carouselImages.length - 1], // Last item at the beginning
    ...carouselImages,
    carouselImages[0], // First item at the end
  ];

  // Handle image click navigation
  const handleImagePress = (infiniteIndex: number) => {
    // Map infinite index to actual image index
    let actualIndex: number;
    if (infiniteIndex === 0) {
      // First duplicate (last image)
      actualIndex = carouselImages.length - 1;
    } else if (infiniteIndex === infiniteData.length - 1) {
      // Last duplicate (first image)
      actualIndex = 0;
    } else {
      // Real items (subtract 1 because index 0 is duplicate)
      actualIndex = infiniteIndex - 1;
    }

    // Navigate based on image
    if (actualIndex === 1) {
      // 7.png -> jobs tab
      router.push("/(tabs)/job");
    } else if (actualIndex === 2) {
      // 8.png -> matrimony tab
      router.push("/(matrimony)/browse");
    } else if (actualIndex === 3) {
      // 9.png -> buddhavihar tab
      router.push("/(tabs)/buddhavihar");
    }
  };

  // Auto-scroll function
  const startAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }

    autoScrollTimerRef.current = setInterval(() => {
      if (!isScrollingRef.current && !isJumpingRef.current && flatListRef.current) {
        const nextIndex = currentIndexRef.current + 1;
        
        // If we're at the last real item, loop back to first
        if (nextIndex >= infiniteData.length - 1) {
          // Scroll to the duplicate first item (which will jump to real first)
          flatListRef.current.scrollToIndex({
            index: infiniteData.length - 1,
            animated: true,
          });
        } else {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
      }
    }, 3500); // Auto-scroll every 3.5 seconds (slower, smoother)
  }, [infiniteData.length]);

  useEffect(() => {
    // Start at index 1 (first real item)
    const timer = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: CAROUSEL_WIDTH, animated: false });
        currentIndexRef.current = 1;
        setCurrentIndex(1);
      }
    }, 100);

    // Start auto-scroll
    startAutoScroll();

    return () => {
      clearTimeout(timer);
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [startAutoScroll]);

  const handleScroll = (event: any) => {
    if (isJumpingRef.current) return;
    
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CAROUSEL_WIDTH);
    
    // Only update index for real items (not duplicates)
    if (index > 0 && index < infiniteData.length - 1 && index !== currentIndexRef.current) {
      setCurrentIndex(index);
      currentIndexRef.current = index;
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CAROUSEL_WIDTH);
    isScrollingRef.current = false;

    // Infinite scroll logic - instant jump without delay
    if (index === 0) {
      // If at the duplicate last item, jump to the real last item instantly
      isJumpingRef.current = true;
      flatListRef.current?.scrollToOffset({
        offset: CAROUSEL_WIDTH * carouselImages.length,
        animated: false,
      });
      setCurrentIndex(carouselImages.length);
      currentIndexRef.current = carouselImages.length;
      // Reset flag immediately
      isJumpingRef.current = false;
    } else if (index === infiniteData.length - 1) {
      // If at the duplicate first item, jump to the real first item instantly
      isJumpingRef.current = true;
      flatListRef.current?.scrollToOffset({
        offset: CAROUSEL_WIDTH,
        animated: false,
      });
      setCurrentIndex(1);
      currentIndexRef.current = 1;
      // Reset flag immediately
      isJumpingRef.current = false;
    } else {
      setCurrentIndex(index);
      currentIndexRef.current = index;
    }

    // Restart auto-scroll after manual scroll
    startAutoScroll();
  };

  const handleScrollBeginDrag = () => {
    isScrollingRef.current = true;
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: CAROUSEL_WIDTH,
    offset: CAROUSEL_WIDTH * index,
    index,
  });

  const onScrollToIndexFailed = (info: any) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToOffset({
        offset: CAROUSEL_WIDTH * info.index,
        animated: false,
      });
    });
  };

  // Real index for pagination dots (0-4)
  const realIndex =
    currentIndex === 0
      ? carouselImages.length - 1
      : currentIndex === infiniteData.length - 1
        ? 0
        : currentIndex - 1;

  return (
    <View className="mb-6">
      <FlatList
        ref={flatListRef}
        data={infiniteData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `carousel-${index}`}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => handleImagePress(index)}
            style={{ width: CAROUSEL_WIDTH, paddingHorizontal: 20 }}
            className="rounded-3xl overflow-hidden shadow-lg active:opacity-90"
          >
            <Image
              source={item}
              style={{ width: CAROUSEL_WIDTH - 40, height: 200 }}
              resizeMode="cover"
              className="rounded-3xl"
            />
          </Pressable>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_WIDTH}
        snapToAlignment="start"
        removeClippedSubviews={false}
      />

      {/* Pagination Dots */}
      <View className="flex-row justify-center items-center mt-4">
        {carouselImages.map((_, index) => (
          <View
            key={`dot-${index}`}
            className={`mx-1 rounded-full ${
              index === realIndex
                ? "bg-blue-600 w-8 h-2"
                : "bg-gray-300 w-2 h-2"
            }`}
          />
        ))}
      </View>
    </View>
  );
};
