import React from "react";
import { View } from "react-native";
import { Link, Stack } from "expo-router";

import { Text } from "@/components/ui";

export default function NotFound() {
  return (
    <React.Fragment>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-black">
        <Text weight="bold">This screen doesn&apos;t exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm text-[#2e78b7]">Go to home screen!</Text>
        </Link>
      </View>
    </React.Fragment>
  );
}
