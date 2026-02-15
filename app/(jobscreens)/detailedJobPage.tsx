import { useLanguage } from "@/app/lib/LanguageContext";
import { applyToJob, fetchJobById } from "@/app/lib/jobs.api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailedJobPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const {
    data: job,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) throw new Error("Job ID is required");
      const result = await fetchJobById(id as string);
      console.log("🟢 [JobDetail] Fetched job:", result);
      return result;
    },
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToJob(id as string, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      setShowApplyModal(false);
      setFormData({ name: "", email: "", description: "" });
      setErrors({});
      Alert.alert(
        t("job_apply_success_title"),
        t("job_apply_success_message"),
        [{ text: t("job_apply_ok"), onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || t("job_apply_error");
      Alert.alert(t("job_apply_error_title"), message);
    },
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "remote":
        return "bg-green-100 text-green-700 border-green-200";
      case "hybrid":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "onsite":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "remote":
        return t("job_type_remote");
      case "hybrid":
        return t("job_type_hybrid");
      case "onsite":
        return t("job_type_onsite");
      default:
        return type;
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = t("job_apply_name_required");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("job_apply_email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("job_apply_email_invalid");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = () => {
    if (validateForm()) {
      applyMutation.mutate();
    }
  };

  // Loading Skeleton Component
  const JobDetailSkeleton = () => (
    <View className="flex-1 bg-[#F8F9FA]">
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
          <View className="w-8 h-8 bg-gray-200 rounded" />
          <View className="h-5 w-32 bg-gray-200 rounded ml-3" />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card Skeleton */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-blue-100">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1 mr-3">
              <View className="h-7 w-3/4 bg-gray-200 rounded-lg mb-3" />
              <View className="h-5 w-1/2 bg-gray-200 rounded-lg mb-2" />
            </View>
            <View className="h-8 w-20 bg-gray-200 rounded-xl" />
          </View>
          <View className="pt-4 border-t border-gray-100">
            <View className="h-6 w-40 bg-gray-200 rounded-lg" />
          </View>
        </View>

        {/* Description Card Skeleton */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-blue-50">
          <View className="h-6 w-32 bg-gray-200 rounded-lg mb-4" />
          <View className="h-4 w-full bg-gray-200 rounded mb-2" />
          <View className="h-4 w-full bg-gray-200 rounded mb-2" />
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
          <View className="h-4 w-full bg-gray-200 rounded mb-2" />
          <View className="h-4 w-4/5 bg-gray-200 rounded" />
        </View>
      </ScrollView>

      {/* Apply Button Skeleton */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="h-12 w-full bg-gray-200 rounded-xl" />
      </View>
    </View>
  );

  // Show loading skeleton during initial load or when fetching
  if (isLoading || (isFetching && !job)) {
    return <JobDetailSkeleton />;
  }

  if (error) {
    console.error("🔴 [JobDetail] Error:", error);
    return (
      <View className="flex-1 bg-[#F8F9FA]">
        <SafeAreaView edges={["top"]} className="bg-white">
          <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <Text className="text-lg font-semibold flex-1" numberOfLines={1}>
              {t("job_details")}
            </Text>
          </View>
        </SafeAreaView>

        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-gray-800 text-lg font-semibold mt-4 text-center">
            {t("job_error_loading")}
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            {error instanceof Error
              ? error.message
              : t("job_error_loading_details")}
          </Text>
          <View className="flex-row gap-3 mt-6">
            <Pressable
              onPress={() => refetch()}
              className="bg-blue-100 px-6 py-3 rounded-xl"
            >
              <Text className="text-blue-600 font-semibold">
                {t("job_retry")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              className="bg-[#0B5ED7] px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">
                {t("job_go_back")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 bg-[#F8F9FA]">
        <SafeAreaView edges={["top"]} className="bg-white">
          <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <Text className="text-lg font-semibold flex-1" numberOfLines={1}>
              {t("job_details")}
            </Text>
          </View>
        </SafeAreaView>

        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-gray-800 text-lg font-semibold mt-4 text-center">
            {t("job_not_found")}
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            {t("job_not_found_message")}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-[#0B5ED7] px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">{t("job_go_back")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Debug log
  if (job) {
    console.log("🟢 [JobDetail] Rendering job:", job);
  }

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-semibold flex-1" numberOfLines={1}>
            {t("job_details")}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Header Card */}
        {job && (
          <>
            <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-blue-100">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1 mr-3">
                  <Text className="text-2xl font-bold text-gray-900 mb-3">
                    {job.title || "No Title"}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-700 text-base ml-2">
                      {job.location || t("job_location_not_specified")}
                    </Text>
                  </View>
                </View>
                <View
                  className={`px-3 py-2 rounded-xl border ${getTypeBadgeColor(
                    job.type
                  )}`}
                >
                  <Text className="text-xs font-bold uppercase tracking-wide">
                    {getTypeLabel(job.type)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center pt-4 border-t border-gray-100">
                <Ionicons name="cash-outline" size={20} color="#10B981" />
                <Text className="text-green-600 font-bold text-lg ml-2">
                  {job.salary || t("job_salary_not_specified")}
                </Text>
              </View>
            </View>

            {/* Description Card */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-blue-50">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                {t("job_description")}
              </Text>
              <Text className="text-gray-700 text-[15px] leading-6">
                {job.description || t("job_no_description")}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Apply Button (Fixed at bottom) */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <Pressable
          onPress={() => setShowApplyModal(true)}
          className="bg-[#0B5ED7] flex-row items-center justify-center py-4 rounded-xl active:opacity-90"
        >
          <Ionicons name="send-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2 text-base">
            {t("job_apply_now")}
          </Text>
        </Pressable>
      </View>

      {/* Apply Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                {t("job_apply_title")}
              </Text>
              <Pressable
                onPress={() => {
                  setShowApplyModal(false);
                  setErrors({});
                }}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Field */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">
                  {t("job_apply_name")} *
                </Text>
                <TextInput
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 ${
                    errors.name ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder={t("job_apply_name_placeholder")}
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                />
                {errors.name && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Email Field */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-2">
                  {t("job_apply_email")} *
                </Text>
                <TextInput
                  className={`bg-gray-50 border rounded-xl px-4 py-3 text-gray-900 ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder={t("job_apply_email_placeholder")}
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email)
                      setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Description Field */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">
                  {t("job_apply_description")}
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 min-h-[120px]"
                  placeholder={t("job_apply_description_placeholder")}
                  placeholderTextColor="#9CA3AF"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleApply}
                disabled={applyMutation.isPending}
                className={`bg-[#0B5ED7] flex-row items-center justify-center py-4 rounded-xl mb-4 ${
                  applyMutation.isPending ? "opacity-50" : "active:opacity-90"
                }`}
              >
                {applyMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="white" />
                    <Text className="text-white font-bold ml-2 text-base">
                      {t("job_apply_submit")}
                    </Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
