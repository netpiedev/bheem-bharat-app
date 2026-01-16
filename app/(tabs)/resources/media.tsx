import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ResourcesHeader } from "@/app/components/ResourcesHeader";
import { fetchMedia } from "@/app/lib/media.api";

type FileType = "image" | "video" | "audio" | "all";

const { width } = Dimensions.get("window");
const COLUMN_GAP = 12;
const PADDING = 16;
const NUM_COLUMNS = 2;
const ITEM_WIDTH =
  (width - PADDING * 2 - COLUMN_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function MediaScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<FileType>("image");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["medialist", selectedType],
    queryFn: ({ pageParam = 1 }) =>
      fetchMedia({
        pageParam: pageParam as number,
        fileType: selectedType,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const fetchedSoFar = lastPage.page * lastPage.limit;
      return lastPage.count > fetchedSoFar ? lastPage.page + 1 : undefined;
    },
  });

  const mediaList = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Split items into two columns for masonry layout
  const columns = useMemo(() => {
    const col1: typeof mediaList = [];
    const col2: typeof mediaList = [];

    mediaList.forEach((item, index) => {
      if (index % 2 === 0) {
        col1.push(item);
      } else {
        col2.push(item);
      }
    });

    return [col1, col2];
  }, [mediaList]);

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const FilterButton = ({
    type,
    label,
    icon,
  }: {
    type: FileType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const isSelected = selectedType === type;
    return (
      <Pressable
        onPress={() => setSelectedType(type)}
        className={`flex-row items-center px-4 py-2.5 rounded-full mr-2 ${
          isSelected
            ? "bg-blue-500 shadow-md"
            : "bg-gray-100 border border-gray-200"
        }`}
        style={isSelected ? { elevation: 3 } : {}}
      >
        <Ionicons
          name={icon}
          size={16}
          color={isSelected ? "white" : "#6B7280"}
        />
        <Text
          className={`ml-1.5 font-semibold text-sm ${
            isSelected ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const MasonryItem = ({ item }: { item: (typeof mediaList)[0] }) => {
    const isImage = item.file_type === "image";
    const isAudio = item.file_type === "audio";
    const isVideo = item.file_type === "video";
    const previewUri = isImage ? item.object_key : item.thumbnail_key;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(mediascreens)/detailedMediaScreen",
            params: { id: item.id },
          })
        }
        className="bg-white rounded-2xl overflow-hidden shadow-sm mb-3 active:opacity-90"
        style={{ width: ITEM_WIDTH, elevation: 2 }}
      >
        {/* Media Preview */}
        <View
          className="w-full bg-gray-100 relative"
          style={{ aspectRatio: isImage ? 0.75 : 16 / 9 }}
        >
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-50">
              <Ionicons
                name={isAudio ? "musical-note" : "videocam"}
                size={32}
                color="#CBD5E1"
              />
            </View>
          )}

          {/* Type Badge */}
          <View className="absolute top-2 left-2">
            <View className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center">
              <Ionicons
                name={isAudio ? "musical-notes" : isVideo ? "play" : "image"}
                size={12}
                color="white"
              />
            </View>
          </View>

          {/* Duration Badge */}
          {!isImage && item.duration && (
            <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">
                {formatDuration(item.duration)}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="p-3">
          <Text
            className="text-sm font-bold text-gray-800 mb-1"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text className="text-xs text-gray-500 leading-4" numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ResourcesHeader title="Media" />
      {/* Filter Buttons */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <FilterButton type="image" label="Images" icon="image" />
          <FilterButton type="video" label="Videos" icon="play-circle" />
          <FilterButton type="audio" label="Audio" icon="musical-notes" />
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: PADDING,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1976d2"]} // Android color
            tintColor="#1976d2" // iOS color
          />
        }
      >
        {mediaList.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-base">
              No {selectedType} found
            </Text>
          </View>
        ) : (
          <>
            {/* Masonry Grid */}
            <View className="flex-row " style={{ gap: COLUMN_GAP }}>
              {/* Column 1 */}
              <View className="flex-1">
                {columns[0].map((item) => (
                  <MasonryItem key={item.id} item={item} />
                ))}
              </View>

              {/* Column 2 */}
              <View className="flex-1">
                {columns[1].map((item) => (
                  <MasonryItem key={item.id} item={item} />
                ))}
              </View>
            </View>

            {/* Pagination Footer */}
            <View className="mt-4 mb-8">
              {hasNextPage ? (
                <Pressable
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full py-4 rounded-2xl bg-white border border-gray-200 items-center justify-center shadow-sm"
                  style={{ elevation: 1 }}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Text className="text-gray-700 font-semibold text-sm">
                      Load More
                    </Text>
                  )}
                </Pressable>
              ) : mediaList.length > 0 ? (
                <View className="py-4 items-center">
                  <View className="h-[1px] w-full bg-gray-200 absolute top-1/2" />
                  <Text className="bg-gray-50 px-4 text-gray-400 text-xs font-medium italic">
                    End of list
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
