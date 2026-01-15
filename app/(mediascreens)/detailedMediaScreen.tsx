import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchMediaById } from "@/app/lib/media.api";

const { width, height } = Dimensions.get("window");

export default function DetailedMediaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const {
    data: media,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mediaDetail", id],
    queryFn: () => fetchMediaById(id as string),
    enabled: !!id,
  });

  // Video Logic
  const videoSource = media?.object_key || "";
  const videoPlayer = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
  });

  // Audio Logic
  const audioPlayer = useAudioPlayer(videoSource);

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    if (!media) return;

    try {
      if (isImage) {
        // Share image with URL
        await Share.share({
          message: `${media.title}\n\n${media.description}`,
          url: media.object_key,
          title: media.title,
        });
      } else {
        // Share text for video/audio
        await Share.share({
          message: `${media.title}\n\n${media.description}\n\nView: ${media.object_key}`,
          title: media.title,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (isLoading || !media) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 text-lg font-semibold mt-4">
          Error loading media
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isImage = media.file_type.toLowerCase().includes("image");
  const isVideo = media.file_type.toLowerCase().includes("video");
  const isAudio = media.file_type.toLowerCase().includes("audio");

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Media Section */}
        <View className="relative">
          {isImage ? (
            <Pressable
              onPress={() => setIsFullscreen(true)}
              className="w-full bg-black active:opacity-95"
              style={{ height: width * 1.2 }}
            >
              <Image
                source={{ uri: media.object_key }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {/* Fullscreen hint */}
              <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-2 rounded-full flex-row items-center">
                <Ionicons name="expand" size={16} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">
                  Tap to expand
                </Text>
              </View>
            </Pressable>
          ) : isVideo ? (
            <View className="w-full bg-black" style={{ height: width * 0.6 }}>
              <VideoView
                player={videoPlayer}
                style={{ width: "100%", height: "100%" }}
                allowsFullscreen
                allowsPictureInPicture
              />
            </View>
          ) : (
            // Audio Player UI
            <View
              className="w-full bg-gradient-to-br from-blue-500 to-purple-600 justify-center items-center"
              style={{ height: width * 0.6 }}
            >
              <View className="items-center">
                <View className="bg-white/20 backdrop-blur-xl p-8 rounded-full mb-6">
                  <Ionicons name="musical-notes" size={64} color="white" />
                </View>

                <Pressable
                  onPress={() =>
                    audioPlayer.playing
                      ? audioPlayer.pause()
                      : audioPlayer.play()
                  }
                  className="bg-white p-5 rounded-full shadow-2xl active:scale-95"
                  style={{ elevation: 8 }}
                >
                  <Ionicons
                    name={audioPlayer.playing ? "pause" : "play"}
                    size={36}
                    color="#3B82F6"
                  />
                </Pressable>

                <Text className="text-white/90 text-sm font-semibold mt-6">
                  {audioPlayer.playing ? "Now Playing" : "Tap to Play"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View className="px-5 py-6">
          {/* Title & Type Badge */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-gray-900 leading-tight">
                {media.title}
              </Text>
            </View>
            <View className="bg-blue-100 px-3 py-1.5 rounded-full">
              <Text className="text-blue-600 font-bold text-xs uppercase">
                {media.file_type}
              </Text>
            </View>
          </View>

          {/* Duration for video/audio */}
          {!isImage && (
            <View className="flex-row items-center mb-4">
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text className="text-gray-600 ml-2 font-medium">
                Duration: {formatDuration(media.duration)}
              </Text>
            </View>
          )}

          {/* Description Card */}
          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#3B82F6"
              />
              <Text className="text-gray-900 font-bold ml-2 text-base">
                Description
              </Text>
            </View>
            <Text className="text-gray-600 leading-6 text-[15px]">
              {media.description || "No description available."}
            </Text>
          </View>

          {/* Source Card */}
          {media.source_text && (
            <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="library-outline" size={20} color="#3B82F6" />
                <Text className="text-gray-900 font-bold ml-2 text-base">
                  Source
                </Text>
              </View>
              <Text className="text-gray-600 text-[15px]">
                {media.source_text}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-2">
            <Pressable
              onPress={handleShare}
              className="flex-1 bg-blue-600 h-14 rounded-2xl flex-row items-center justify-center active:bg-blue-700 shadow-md"
              style={{ elevation: 3 }}
            >
              <Ionicons name="share-social" size={22} color="white" />
              <Text className="text-white font-bold ml-2 text-base">Share</Text>
            </Pressable>

            {isImage && (
              <Pressable
                onPress={() => setIsFullscreen(true)}
                className="bg-gray-800 h-14 px-6 rounded-2xl flex-row items-center justify-center active:bg-gray-900 shadow-md"
                style={{ elevation: 3 }}
              >
                <Ionicons name="expand" size={22} color="white" />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Image Modal */}
      {isImage && (
        <Modal
          visible={isFullscreen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFullscreen(false)}
        >
          <StatusBar hidden />
          <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1">
              {/* Close Button */}
              <Pressable
                onPress={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 bg-black/60 p-3 rounded-full"
                style={{ elevation: 5 }}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>

              {/* Fullscreen Image */}
              <View className="flex-1 justify-center items-center">
                <Image
                  source={{ uri: media.object_key }}
                  style={{ width, height }}
                  resizeMode="contain"
                />
              </View>

              {/* Bottom Actions */}
              <View className="absolute bottom-8 left-0 right-0 px-6">
                <Pressable
                  onPress={handleShare}
                  className="bg-white/90 backdrop-blur-xl h-14 rounded-2xl flex-row items-center justify-center active:bg-white shadow-2xl"
                  style={{ elevation: 8 }}
                >
                  <Ionicons name="share-social" size={22} color="#3B82F6" />
                  <Text className="text-gray-900 font-bold ml-2 text-base">
                    Share Image
                  </Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </>
  );
}
