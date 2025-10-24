import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";

import { Text } from "@/components/ui";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text>Modal</Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
