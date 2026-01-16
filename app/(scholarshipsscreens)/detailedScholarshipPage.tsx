import { WhiteHeader } from "@/app/components/WhiteHeader";
import { useLanguage } from "@/app/lib/LanguageContext";
import { fetchScholarshipDetails } from "@/app/lib/scholarships.api"; // Adjust path as needed
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

/* ---------------- TYPES ---------------- */
export interface ScholarshipDetails {
  id: string;
  title: string;
  description: string;
  state_id: string;
  state_name: string;
  income_limit: number | string | null;
  gender: string;
  minority_type: string | null;
  education_level: string;
  benefits: string;
  application_process: string;
  documents_required: string[];
  last_date: string;
  official_url: string;
  created_at: string;
}

/* ---------------- HELPERS ---------------- */

const formatCurrency = (
  amount: string | number | null,
  t: (key: string) => string
) => {
  if (!amount) return t("scholarship_no_limit");
  const value = Number(amount);
  if (isNaN(value)) return t("scholarship_not_specified");

  // Format as Lakhs if > 100k, else standard currency
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2).replace(/\.00$/, "")} ${t(
      "scholarship_lakh_per_yr"
    )}`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatDate = (dateString: string, t: (key: string) => string) => {
  if (!dateString) return t("scholarship_na");
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatus = (dateString: string, t: (key: string) => string) => {
  const deadline = new Date(dateString);
  const now = new Date();
  const isActive = deadline > now;
  return {
    label: isActive ? t("scholarship_active") : t("scholarship_closed"),
    color: isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
    dotColor: isActive ? "#15803d" : "#b91c1c", // green-700 : red-700
  };
};

const capitalize = (str: string | null, t: (key: string) => string) => {
  if (!str) return t("scholarship_all");
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function DetailedScholarshipPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();

  // 1. Implementation of TanStack Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["scholarship-details", id],
    queryFn: () => fetchScholarshipDetails(id!), // Non-null assertion as we check enabled
    enabled: !!id, // Only run if ID exists
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F7F9FC] items-center justify-center">
        <ActivityIndicator size="large" color="#0B5ED7" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-[#F7F9FC] items-center justify-center p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-gray-800 font-semibold text-lg mt-2">
          {t("scholarship_failed_load")}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="mt-4 bg-gray-200 px-6 py-2 rounded-full"
        >
          <Text className="text-gray-700 font-medium">
            {t("scholarship_retry")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const status = getStatus(data.last_date, t);

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <WhiteHeader title={t("scholarship_details")} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CARD */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-start mb-2">
            <View className={`px-3 py-1 rounded-full ${status.color}`}>
              <Text className="text-xs font-bold uppercase">
                {status.label}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded-md">
              {data.state_name}
            </Text>
          </View>

          <Text className="text-xl font-bold text-gray-900 leading-tight mb-2">
            {data.title}
          </Text>

          <Text className="text-gray-600 leading-5">{data.description}</Text>
        </View>

        {/* ELIGIBILITY GRID */}
        <SectionTitle
          title={t("scholarship_eligibility_criteria")}
          icon="shield-checkmark-outline"
        />
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100">
          <View className="flex-row flex-wrap">
            {/* Income */}
            <DetailGridItem
              icon="wallet-outline"
              label={t("scholarship_max_income")}
              value={formatCurrency(data.income_limit, t)}
            />
            {/* Education */}
            <DetailGridItem
              icon="school-outline"
              label={t("scholarship_education")}
              value={capitalize(data.education_level, t)}
            />
            {/* Gender */}
            <DetailGridItem
              icon="person-outline"
              label={t("scholarship_gender")}
              value={capitalize(data.gender, t)}
            />
            {/* Minority */}
            <DetailGridItem
              icon="people-outline"
              label={t("scholarship_category")}
              value={capitalize(data.minority_type, t)}
            />
          </View>
        </View>

        {/* BENEFITS */}
        <SectionTitle title={t("scholarship_benefits")} icon="gift-outline" />
        <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-100">
          <Text className="text-gray-700 text-base leading-6 font-medium">
            {data.benefits}
          </Text>
        </View>

        {/* DOCUMENTS REQUIRED */}
        <SectionTitle
          title={t("scholarship_required_documents")}
          icon="document-text-outline"
        />
        <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-100">
          {data.documents_required && data.documents_required.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {data.documents_required.map((doc: any, index: number) => (
                <View
                  key={index}
                  className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg"
                >
                  <Text className="text-blue-800 text-xs font-medium">
                    {doc}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">
              {t("scholarship_no_documents")}
            </Text>
          )}
        </View>

        {/* APPLICATION PROCESS & DATES */}
        <SectionTitle
          title={t("scholarship_process_dates")}
          icon="time-outline"
        />
        <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-100">
          <View className="mb-4">
            <Text className="text-gray-500 text-xs uppercase font-bold mb-1">
              {t("scholarship_how_to_apply")}
            </Text>
            <Text className="text-gray-800 leading-5">
              {data.application_process}
            </Text>
          </View>

          <View className="h-[1px] bg-gray-100 my-2" />

          <View className="mt-2 flex-row items-center">
            <Ionicons name="calendar" size={18} color="#EF4444" />
            <Text className="ml-2 text-gray-600">
              {t("scholarship_deadline")}{" "}
              <Text className="font-bold text-gray-900">
                {formatDate(data.last_date, t)}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FLOATING BOTTOM ACTION */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
        <Pressable
          onPress={() => Linking.openURL(data.official_url)}
          className="bg-[#1976D2] py-4 rounded-xl flex-row items-center justify-center active:opacity-90"
        >
          <Text className="text-white text-base font-bold mr-2">
            {t("scholarship_apply_now")}
          </Text>
          <Ionicons name="open-outline" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- SUB-COMPONENTS ---------------- */

function SectionTitle({ title, icon }: { title: string; icon: any }) {
  return (
    <View className="flex-row items-center mb-3 px-1">
      <Ionicons name={icon} size={18} color="#64748B" />
      <Text className="text-gray-500 font-bold uppercase text-xs ml-2 tracking-wider">
        {title}
      </Text>
    </View>
  );
}

function DetailGridItem({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="w-1/2 mb-4 pr-2">
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={14} color="#94A3B8" />
        <Text className="text-gray-400 text-xs ml-1">{label}</Text>
      </View>
      <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
