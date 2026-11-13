import { useLanguage } from "@/app/lib/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 8);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0B5ED7",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: tabHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          paddingHorizontal: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "600",
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs_home"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matrimony"
        options={{
          title: t("tabs_matrimony"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buddhavihar"
        options={{
          title: t("tabs_buddhavihar"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "business" : "business-outline"}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: t("tabs_resources"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // If we are already on the resources tab, and we press the icon again,
            // it should pop to the top of the stack.
            // Or simply navigate to the index.
            navigation.navigate("resources", { screen: "index" });
          },
        })}
      />
      <Tabs.Screen
        name="job"
        options={{
          title: t("tabs_job"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "briefcase" : "briefcase-outline"}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs_profile"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
