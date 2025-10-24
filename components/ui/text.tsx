import cn from "clsx";
import { forwardRef } from "react";
import { Text as DefaultText } from "react-native";

import { Typography, FontWeight, TextSize } from "@/constants/typography";

type RNTextProps = DefaultText["props"];

export interface TextProps extends RNTextProps {
  weight?: FontWeight;
  dimRate?: `${number}%`;
  size?: TextSize | number;
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
}

export const Text = forwardRef<DefaultText, TextProps>((props, ref) => {
  let { children, size = "medium", style, textTransform = "none", weight = "regular", ...otherProps } = props;

  let getFontSize = () => {
    if (typeof size === "number") return size;
    return Typography.size[size] || Typography.size["medium"];
  };

  let getLineHeight = () => {
    if (typeof size === "number") return size * 1.5;
    return Typography.lineHeight[size] || Typography.lineHeight["medium"];
  };

  let getFontFamily = () => {
    return Typography.fontFamily[weight];
  };

  return (
    <DefaultText
      className={cn("text-dark dark:text-white", props.className)}
      style={[
        {
          flexShrink: 1,
          fontFamily: getFontFamily(),
          fontSize: getFontSize(),
          lineHeight: getLineHeight(),
          textTransform,
        },
        style,
      ]}
      ref={ref}
      {...otherProps}
    >
      {children}
    </DefaultText>
  );
});

Text.displayName = "Text";
