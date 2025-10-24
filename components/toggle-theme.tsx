import { Pressable, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { capitalizeFirstLetter } from "@/lib/utils";

import { Text } from "./ui";

interface Props {
  theme: "light" | "dark";
  colorScheme: ColorSchemeSystem;
  setColorScheme: (colorSchemeSystem: ColorSchemeSystem) => void;
}

export function ToggleTheme({ colorScheme, setColorScheme, theme }: Props) {
  let shadowBox = {
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      height: 5,
      width: 0,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  };

  return (
    <Pressable
      style={{
        alignItems: "center",
        backgroundColor: colorScheme === "light" ? "white" : "#333",
        flexDirection: "row",
        height: 56,
        justifyContent: "space-between",
        paddingHorizontal: 32,
        // Equivalent to w-5/6
        width: "100%",
        ...(colorScheme === "light" ? shadowBox : {}),
        ...(theme === "light"
          ? { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
          : { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }),
      }}
      onPress={async () => {
        setColorScheme(theme as "light" | "dark" | "system");
      }}
    >
      <View className="flex flex-row items-center justify-center" style={{ gap: 15 }}>
        <MaterialIcons
          name={theme === "dark" ? "dark-mode" : "light-mode"}
          size={20}
          color={colorScheme === "dark" ? "white" : "black"}
        />
        <Text className="italic text-dark dark:text-white">{capitalizeFirstLetter(theme)}</Text>
      </View>
      <View
        style={{
          alignItems: "center",
          borderColor: colorScheme === "light" ? "black" : "white",
          borderRadius: 12,
          borderWidth: 2,
          height: 24,
          justifyContent: "center",
          width: 24,
        }}
      >
        {colorScheme === theme && (
          <View
            style={{
              backgroundColor: colorScheme === "light" ? "black" : "white",
              borderRadius: 6,
              height: 10,
              width: 10,
            }}
          />
        )}
      </View>
    </Pressable>
  );
}
