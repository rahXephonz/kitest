import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useColorScheme } from "nativewind";
import { Provider as JotaiProvider } from "jotai";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import "react-native-reanimated";

import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { jotaiStore } from "@/state/jotai";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export let unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [loaded, error] = useFonts({
    "aeonik-bold": require("../assets/fonts/aeonik-bold.ttf"),
    "aeonik-regular": require("../assets/fonts/aeonik-regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  let { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <JotaiProvider store={jotaiStore}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </JotaiProvider>
    </ThemeProvider>
  );
}
