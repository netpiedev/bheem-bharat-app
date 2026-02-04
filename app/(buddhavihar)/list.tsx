import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Pressable,
	Text,
	View,
} from "react-native";

import { fetchBuddhaViharsByCity } from "@/app/lib/buddhavihar.api";
import type { BuddhaViharListItem } from "@/app/types/buddhavihar.types";
import { WhiteHeader } from "../components/WhiteHeader";

export default function BuddhaViharList() {
	const router = useRouter();

	const { cityId, cityName, stateName } = useLocalSearchParams<{
		cityId?: string;
		cityName?: string;
		stateName?: string;
	}>();

	const {
		data: vihars,
		isLoading,
		error,
	} = useQuery<BuddhaViharListItem[]>({
		queryKey: ["buddhavihar-vihars", cityId],
		queryFn: () => fetchBuddhaViharsByCity(cityId as string),
		enabled: !!cityId,
	});

	/* ---------- Loading ---------- */
	if (isLoading) {
		return (
			<View className="flex-1 bg-white">
				<WhiteHeader
					title="Buddha Vihars"
					subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
				/>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0B5ED7" />
				</View>
			</View>
		);
	}

	/* ---------- Error ---------- */
	if (error || !vihars) {
		return (
			<View className="flex-1 bg-white">
				<WhiteHeader
					title="Buddha Vihars"
					subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
				/>
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-red-500 text-center">
						Failed to load Buddha Vihars.
					</Text>
				</View>
			</View>
		);
	}

	/* ---------- Empty ---------- */
	if (vihars.length === 0) {
		return (
			<View className="flex-1 bg-white">
				<WhiteHeader
					title="Buddha Vihars"
					subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
				/>
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-gray-500 text-center">
						No Buddha Vihars found in this city.
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#F6F8FC]">
			<WhiteHeader
				title="Buddha Vihars"
				subtitle={`${cityName ?? ""}, ${stateName ?? ""}`}
			/>

			<FlatList
				data={vihars}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ padding: 16 }}
				ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
				renderItem={({ item }) => (
					<Pressable
						onPress={() =>
							router.push({
								pathname: "/(buddhavihar)/details",
								params: {
									viharId: item.id,
									cityName,
									stateName,
								},
							})
						}
						className="
              bg-white
              rounded-2xl
              overflow-hidden
              shadow-sm
              border border-[#E6EDFF]
            "
					>
						{/* ---------- Image ---------- */}
						<View className="w-full h-44 bg-[#EAF3FF]">
							{item.image ? (
								<Image
									source={{ uri: item.image }}
									className="w-full h-full"
									resizeMode="cover"
								/>
							) : (
								<View className="flex-1 items-center justify-center">
									<Ionicons name="business" size={40} color="#0B5ED7" />
								</View>
							)}
						</View>

						{/* ---------- Text Content ---------- */}
						<View className="p-4">
							<Text
								numberOfLines={2}
								className="text-base font-semibold text-gray-900"
							>
								{item.name}
							</Text>

							{item.address && (
								<View className="flex-row items-start mt-2">
									<Ionicons
										name="location"
										size={16}
										color="#0B5ED7"
										style={{ marginTop: 2, marginRight: 4 }}
									/>
									<Text
										numberOfLines={2}
										className="text-sm text-gray-600 flex-1"
									>
										{item.address}
									</Text>
								</View>
							)}
						</View>
					</Pressable>
				)}
			/>
		</View>
	);
}
