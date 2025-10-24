import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import Colors from "@/constants/colors";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size: number }) {
  return <FontAwesome style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  let { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon size={28} name="home" color={color} />,
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="user-circle" size={25} color={color} />,
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
