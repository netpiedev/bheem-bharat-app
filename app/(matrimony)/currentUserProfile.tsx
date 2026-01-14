import { createProfile, getMyProfile, uploadProfileImages } from "@/app/lib/matrimony.api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { WhiteHeader } from "../components/WhiteHeader";

export default function CurrentUserProfileScreen() {
    // GET CURRENT USER PROFILE
    const {
        data: myProfile,
        isLoading: isLoadingMyProfile,
        error: myProfileError,
    } = useQuery({
        queryKey: ["matrimony-my-profile"],
        queryFn: getMyProfile,
        retry: false,
    });

    // Show loading while profile is loading
    if (isLoadingMyProfile) {
        return (
            <View className="flex-1 bg-white">
                <WhiteHeader title="My Profile" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </View>
        );
    }

    // If user does not have a profile, show create form
    if (!myProfile) {
        return <CreateProfileForm />;
    }

    // If there's an error (other than user not having a profile)
    if (myProfileError) {
        return (
            <View className="flex-1 bg-white">
                <WhiteHeader title="My Profile" />
                <View className="flex-1 items-center justify-center p-5">
                    <Text className="text-red-500">
                        {(
                            myProfileError as unknown as {
                                response?: { data?: { message?: string } };
                            }
                        )?.response?.data?.message || "Failed to load profile"}
                    </Text>
                </View>
            </View>
        );
    }

    const age = myProfile.dob
        ? new Date().getFullYear() - new Date(myProfile.dob).getFullYear()
        : null;

    return (
        <View className="flex-1 bg-white">
            <WhiteHeader title="My Profile" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20 }}
            >
                {/* Profile Header */}
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
                        <Ionicons name="person" size={48} color="#9CA3AF" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">
                        {myProfile.user?.name || "Anonymous"}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                        {age ? `${age} years` : "Age not specified"} •{" "}
                        {myProfile.gender}
                    </Text>
                    {myProfile.is_verified && (
                        <View className="flex-row items-center mt-2 bg-green-100 px-3 py-1 rounded-full">
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color="#10B981"
                            />
                            <Text className="text-green-700 text-xs ml-1 font-semibold">
                                Verified
                            </Text>
                        </View>
                    )}
                </View>

                {/* Details */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Personal Details
                    </Text>
                    {age && (
                        <DetailRow
                            icon="calendar"
                            label="Age"
                            value={`${age} years`}
                        />
                    )}
                    {myProfile.height && (
                        <DetailRow
                            icon="resize"
                            label="Height"
                            value={`${myProfile.height} cm`}
                        />
                    )}
                    {myProfile.city && (
                        <DetailRow
                            icon="location"
                            label="City"
                            value={myProfile.city}
                        />
                    )}
                    {myProfile.religion && (
                        <DetailRow
                            icon="book"
                            label="Religion"
                            value={myProfile.religion}
                        />
                    )}
                    {myProfile.caste && (
                        <DetailRow
                            icon="people"
                            label="Caste"
                            value={myProfile.caste}
                        />
                    )}
                </View>

                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Professional Details
                    </Text>
                    {myProfile.education && (
                        <DetailRow
                            icon="school"
                            label="Education"
                            value={myProfile.education}
                        />
                    )}
                    {myProfile.profession && (
                        <DetailRow
                            icon="briefcase"
                            label="Profession"
                            value={myProfile.profession}
                        />
                    )}
                    {myProfile.income && (
                        <DetailRow
                            icon="cash"
                            label="Income"
                            value={myProfile.income}
                        />
                    )}
                </View>

                {myProfile.about_me && (
                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            About Me
                        </Text>
                        <Text className="text-gray-700 leading-6">
                            {myProfile.about_me}
                        </Text>
                    </View>
                )}

                {/* Images Section */}
                <ImageUploadSection profileId={myProfile.id} images={myProfile.images || []} />
            </ScrollView>
        </View>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <View className="flex-row items-center mb-3">
            <Ionicons name={icon as any} size={20} color="#6B7280" />
            <Text className="text-gray-600 ml-3 flex-1">{label}:</Text>
            <Text className="text-gray-900 font-semibold">{value}</Text>
        </View>
    );
}

function ImageUploadSection({ profileId, images }: { profileId: string; images: string[] }) {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    const uploadMutation = useMutation({
        mutationFn: (imageUris: string[]) => uploadProfileImages(profileId, imageUris),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matrimony-my-profile"] });
            queryClient.invalidateQueries({ queryKey: ["matrimony-profile"] });
            Alert.alert("Success", "Images uploaded successfully");
        },
        onError: (error: any) => {
            Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to upload images"
            );
        },
        onSettled: () => {
            setUploading(false);
        },
    });

    const pickImages = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "We need access to your photos to upload images."
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5 - images.length, // Limit based on remaining slots
            });

            if (!result.canceled && result.assets.length > 0) {
                setUploading(true);
                const imageUris = result.assets.map((asset: ImagePicker.ImagePickerAsset) => asset.uri);
                uploadMutation.mutate(imageUris);
            }
        } catch (error) {
            console.error("Error picking images:", error);
            Alert.alert("Error", "Failed to pick images");
        }
    };

    return (
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-900">Photos</Text>
                {images.length < 5 && (
                    <Pressable
                        onPress={pickImages}
                        disabled={uploading}
                        className="bg-blue-600 px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                        {uploading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text className="text-white font-semibold">Add Photos</Text>
                        )}
                    </Pressable>
                )}
            </View>

            {images.length === 0 ? (
                <View className="items-center py-8">
                    <Ionicons name="images-outline" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-2 text-center">
                        No photos yet. Add up to 5 photos to your profile.
                    </Text>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-3">
                        {images.map((imageKey, index) => (
                            <View key={index} className="relative">
                                <ExpoImage
                                    source={{ uri: imageKey }}
                                    className="w-32 h-32 rounded-xl"
                                    contentFit="cover"
                                />
                            </View>
                        ))}
                        {images.length < 5 && (
                            <Pressable
                                onPress={pickImages}
                                disabled={uploading}
                                className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-100"
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#6B7280" />
                                ) : (
                                    <>
                                        <Ionicons name="add" size={32} color="#6B7280" />
                                        <Text className="text-gray-500 text-xs mt-1">Add</Text>
                                    </>
                                )}
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

function CreateProfileForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
    const [dob, setDob] = useState("");
    const [height, setHeight] = useState("");
    const [religion, setReligion] = useState("");
    const [caste, setCaste] = useState("");
    const [city, setCity] = useState("");
    const [education, setEducation] = useState("");
    const [profession, setProfession] = useState("");
    const [income, setIncome] = useState("");
    const [aboutMe, setAboutMe] = useState("");

    const createMutation = useMutation({
        mutationFn: createProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["matrimony-profile"] });
            queryClient.invalidateQueries({
                queryKey: ["matrimony-my-profile"],
            });
            queryClient.invalidateQueries({ queryKey: ["matrimony-profiles"] });
            Alert.alert("Success", "Profile created successfully", [
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ]);
        },
        onError: (error: any) => {
            Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to create profile"
            );
        },
    });

    const handleSubmit = () => {
        if (!dob) {
            Alert.alert("Error", "Date of birth is required");
            return;
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dob)) {
            Alert.alert("Error", "Date of birth must be in YYYY-MM-DD format");
            return;
        }

        createMutation.mutate({
            gender,
            dob,
            height: height ? parseInt(height, 10) : null,
            religion: religion || null,
            caste: caste || null,
            city: city || null,
            education: education || null,
            profession: profession || null,
            income: income || null,
            about_me: aboutMe || null,
        });
    };

    return (
        <View className="flex-1 bg-white">
            <WhiteHeader title="Create Profile" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        Create Matrimony Profile
                    </Text>
                    <Text className="text-gray-600 mb-6">
                        Fill in your details to create your matrimony profile
                    </Text>

                    {/* Gender */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Gender *
                    </Text>
                    <View className="flex-row mb-4">
                        {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                            <Pressable
                                key={g}
                                onPress={() => setGender(g)}
                                className={`flex-1 mx-1 py-3 rounded-xl border items-center ${
                                    gender === g
                                        ? "bg-blue-50 border-blue-600"
                                        : "bg-white border-gray-200"
                                }`}
                            >
                                <Text
                                    className={`font-medium ${
                                        gender === g
                                            ? "text-blue-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {g}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Date of Birth */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Date of Birth * (YYYY-MM-DD)
                    </Text>
                    <TextInput
                        value={dob}
                        onChangeText={setDob}
                        placeholder="2000-01-01"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Height */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Height (cm)
                    </Text>
                    <TextInput
                        value={height}
                        onChangeText={setHeight}
                        placeholder="170"
                        keyboardType="numeric"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Religion */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Religion
                    </Text>
                    <TextInput
                        value={religion}
                        onChangeText={setReligion}
                        placeholder="Enter your religion"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Caste */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Caste
                    </Text>
                    <TextInput
                        value={caste}
                        onChangeText={setCaste}
                        placeholder="Enter your caste"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* City */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        City
                    </Text>
                    <TextInput
                        value={city}
                        onChangeText={setCity}
                        placeholder="Enter your city"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Education */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Education
                    </Text>
                    <TextInput
                        value={education}
                        onChangeText={setEducation}
                        placeholder="Enter your education"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Profession */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Profession
                    </Text>
                    <TextInput
                        value={profession}
                        onChangeText={setProfession}
                        placeholder="Enter your profession"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Income */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        Income
                    </Text>
                    <TextInput
                        value={income}
                        onChangeText={setIncome}
                        placeholder="Enter your income"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* About Me */}
                    <Text className="text-gray-900 font-semibold mb-2">
                        About Me
                    </Text>
                    <TextInput
                        value={aboutMe}
                        onChangeText={setAboutMe}
                        placeholder="Tell us about yourself"
                        multiline
                        numberOfLines={4}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6"
                        placeholderTextColor="#9CA3AF"
                        textAlignVertical="top"
                    />

                    {/* Submit Button */}
                    <Pressable
                        onPress={handleSubmit}
                        disabled={createMutation.isPending}
                        className="bg-blue-600 py-4 rounded-xl items-center mb-6 disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                Create Profile
                            </Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
