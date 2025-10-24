import { responsiveFontSize } from "@/lib/font";

export const Typography = {
  fontFamily: {
    bold: "aeonik-bold",
    regular: "aeonik-regular",
  },
  lineHeight: {
    large: responsiveFontSize(30),
    medium: responsiveFontSize(24),
    small: responsiveFontSize(21),
  },
  size: {
    large: responsiveFontSize(20),
    medium: responsiveFontSize(16),
    small: responsiveFontSize(14),
  },
};

export type FontWeight = keyof typeof Typography.fontFamily;
export type TextSize = keyof typeof Typography.size;
