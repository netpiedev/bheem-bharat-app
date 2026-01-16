import { useLanguage } from "@/app/lib/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs_home"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matrimony"
        options={{
          title: t("tabs_matrimony"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buddhavihar"
        options={{
          title: t("tabs_buddhavihar"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="business-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: t("tabs_resources"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={22} color={color} />
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
        name="profile"
        options={{
          title: t("tabs_profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
