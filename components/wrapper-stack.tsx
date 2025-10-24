import cn from "clsx";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Feather } from "@expo/vector-icons";
import { PropsWithChildren, ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";

import { Text } from "./ui";
import { ShowIf } from "./common";

type WrapperStackPropsT = {
  withBackButton: Booleanish;
  className: string;
  customHeader: Booleanish;
  onBack: () => void;
  title: string;
  isUsingPadding: boolean;
  rightNavigationButton: ReactNode;
  isUsingPaddingInset: boolean;
  disableScrollView: boolean;
};

export function WrapperStack(props: PropsWithChildren<Partial<WrapperStackPropsT>>) {
  let { disableScrollView = true, isUsingPadding = true, isUsingPaddingInset = true } = props;
  let { colorScheme } = useColorScheme();

  let insets = useSafeAreaInsets();
  let router = useRouter();

  let onRouterBack = () => {
    if (typeof props.onBack !== "function") {
      if (router.canGoBack()) return router.back();
      return router.push("/");
    }

    return props.onBack();
  };

  return (
    <View className={cn(props.className, "flex-1 bg-white dark:bg-black")}>
      {isUsingPaddingInset && <View style={{ paddingTop: insets.top }} />}

      <View
        className={cn(
          props.customHeader && "flex-row items-center justify-between px-4",
          Platform.OS === "android" && "mt-2.5",
        )}
      >
        <ShowIf condition={props.withBackButton}>
          <TouchableOpacity onPress={onRouterBack} className={cn(!props.customHeader && "px-4")}>
            <Feather name="arrow-left" size={25} color={colorScheme === "dark" ? "#fff" : "#000"} />
          </TouchableOpacity>
        </ShowIf>
        <ShowIf condition={props.customHeader}>
          <Text>{props.title}</Text>
          <View className="pr-1">{props.rightNavigationButton}</View>
        </ShowIf>
      </View>

      {disableScrollView ? (
        <View
          className={cn(isUsingPaddingInset ? "mt-5" : "mt-4", "flex-1")}
          style={{
            paddingBottom: insets.bottom,
            paddingHorizontal: isUsingPadding ? 20 : 0,
          }}
        >
          {props.children}
        </View>
      ) : (
        <ScrollView
          className={cn(isUsingPaddingInset ? "mt-5" : "mt-4")}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom,
            paddingHorizontal: isUsingPadding ? 20 : 0,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {props.children}
        </ScrollView>
      )}
    </View>
  );
}
