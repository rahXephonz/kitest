import { View } from "react-native";
import { useColorScheme } from "nativewind";

import { Text } from "@/components/ui";
import { ToggleTheme } from "@/components/toggle-theme";
import { WrapperStack } from "@/components/wrapper-stack";

export default function Settings() {
  let { colorScheme, setColorScheme } = useColorScheme();

  return (
    <WrapperStack>
      <Text weight="bold" size={24}>
        Settings
      </Text>

      <View className="w-full mt-8">
        <Text className="dark:text-neutral-200 mb-4">Theme Settings</Text>
        <ToggleTheme colorScheme={colorScheme as ColorSchemeSystem} setColorScheme={setColorScheme} theme="light" />
        <ToggleTheme colorScheme={colorScheme as ColorSchemeSystem} setColorScheme={setColorScheme} theme="dark" />
      </View>
    </WrapperStack>
  );
}
