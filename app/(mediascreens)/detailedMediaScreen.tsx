import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  Share,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer } from "expo-audio";

import { fetchMediaById } from "@/app/lib/media.api";

export default function DetailedMediaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: media,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mediaDetail", id],
    queryFn: () => fetchMediaById(id as string),
    enabled: !!id,
  });

  // --- Video Logic ---
  const videoSource = media?.object_key || "";
  const videoPlayer = useVideoPlayer(videoSource);

  // --- Audio Logic ---
  // The useAudioPlayer hook manages the lifecycle of the audio stream
  const audioPlayer = useAudioPlayer(videoSource);

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading || !media) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }
  if (error || !media)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading media.</Text>
      </View>
    );

  const isImage = media.file_type.toLowerCase().includes("image");
  const isVideo = media.file_type.toLowerCase().includes("video");
  const isAudio = media.file_type.toLowerCase().includes("audio");

  return (
    <ScrollView
      className="flex-1 bg-gray-50/30"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-5">
        {/* Media Player / Preview Area */}
        <View className="relative w-full h-64 bg-black rounded-3xl overflow-hidden shadow-sm">
          {isVideo ? (
            <VideoView
              player={videoPlayer}
              style={{ width: "100%", height: "100%" }}
              allowsFullscreen
            />
          ) : (
            <>
              <Image
                source={{ uri: media.object_key }}
                className="w-full h-full opacity-90"
                resizeMode="cover"
              />

              {isAudio && (
                <View className="absolute inset-0 justify-center items-center">
                  <Pressable
                    onPress={() =>
                      audioPlayer.playing
                        ? audioPlayer.pause()
                        : audioPlayer.play()
                    }
                    className="bg-white p-5 rounded-full shadow-lg active:scale-95"
                  >
                    <Ionicons
                      name={audioPlayer.playing ? "pause" : "musical-notes"}
                      size={32}
                      color="#3B82F6"
                    />
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>

        {/* Content Details */}
        <View className="bg-white mt-5 p-6 rounded-3xl border border-gray-100 shadow-sm">
          <Text className="text-xl font-bold text-gray-800">{media.title}</Text>

          {!isImage && (
            <Text className="text-gray-400 mt-2 font-medium">
              Duration: {formatDuration(media.duration)}
            </Text>
          )}

          <Text className="text-gray-500 mt-4 leading-6">
            {media.description}
          </Text>
        </View>

        {/* Source Section */}
        <View className="bg-white mt-4 p-6 rounded-3xl border border-gray-100 shadow-sm">
          <Text className="text-lg font-bold text-gray-800">Source</Text>
          <Text className="text-gray-500 mt-2">
            {media.source_text || "National Archive"}
          </Text>
        </View>

        {/* Share Action */}
        <Pressable
          onPress={() =>
            Share.share({ message: `Check this out: ${media.title}` })
          }
          className="bg-blue-600 mt-6 h-14 rounded-2xl flex-row items-center justify-center active:bg-blue-700 shadow-md"
        >
          <Ionicons name="share-social-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2 text-lg">Share</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
