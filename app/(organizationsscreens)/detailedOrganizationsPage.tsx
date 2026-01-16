import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useLanguage } from "@/app/lib/LanguageContext";
import { fetchOrganizationById } from "@/app/lib/organizations.api";

export default function OrganizationDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();

  const {
    data: org,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organization", id],
    queryFn: () => fetchOrganizationById(id as string),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <View className="flex-1 justify-center bg-white">
        <ActivityIndicator color="#1D72D2" />
      </View>
    );
  if (error || !org)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t("org_error_loading")}</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Info Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-blue-100">
          <Text className="text-lg font-semibold text-gray-900 mb-6 leading-6">
            {org.name}
          </Text>

          <InfoSection
            icon="location-outline"
            label={t("org_address")}
            content={`${org.address}, ${org.city}, ${org.state} ${org.pincode}`}
          />
          <InfoSection
            icon="call-outline"
            label={t("org_contact")}
            content={org.phone}
          />
          <InfoSection
            icon="mail-outline"
            label={t("org_email")}
            content={org.email}
          />
          {org.website_url && (
            <InfoSection
              icon="globe-outline"
              label={t("org_website")}
              content={org.website_url}
              isLink
            />
          )}
        </View>

        {/* Description Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-blue-50">
          <Text className="text-base font-bold text-gray-900 mb-3">
            {t("org_description")}
          </Text>
          <Text className="text-gray-600 text-[15px] leading-6">
            {org.description}
          </Text>
        </View>

        {/* --- Buttons Section (Now inside ScrollView) --- */}
        <View className="flex-row gap-x-3 px-1">
          <Pressable
            onPress={() => Linking.openURL(`tel:${org.phone}`)}
            className="flex-1 bg-[#1D72D2] flex-row items-center justify-center py-4 rounded-xl active:opacity-90"
          >
            <Ionicons name="call" size={20} color="white" />
            <Text className="text-white font-bold ml-2 text-base">
              {t("org_call")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(`mailto:${org.email}`)}
            className="flex-1 bg-white border border-[#1D72D2] flex-row items-center justify-center py-4 rounded-xl active:bg-blue-50"
          >
            <Ionicons name="mail" size={20} color="#1D72D2" />
            <Text className="text-[#1D72D2] font-bold ml-2 text-base">
              {t("org_email_button")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoSection({
  icon,
  label,
  content,
  isLink,
}: {
  icon: any;
  label: string;
  content: string;
  isLink?: boolean;
}) {
  return (
    <View className="flex-row mb-5">
      <View className="w-10 h-10 bg-[#E8F2FF] rounded-xl items-center justify-center">
        <Ionicons name={icon} size={20} color="#1D72D2" />
      </View>
      <View className="ml-4 flex-1 justify-center">
        <Text className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-0.5">
          {label}
        </Text>
        <Text
          className={`text-[14px] leading-5 ${
            isLink ? "text-blue-600" : "text-gray-700"
          }`}
          onPress={
            isLink
              ? () =>
                  Linking.openURL(
                    content.startsWith("http") ? content : `https://${content}`
                  )
              : undefined
          }
        >
          {content}
        </Text>
      </View>
    </View>
  );
}
