import { Dimensions, PixelRatio } from "react-native";

let { width: SCREEN_WIDTH } = Dimensions.get("window");

// Base width from iPhone 11
let BASE_WIDTH = 375;

let widthScale = SCREEN_WIDTH / BASE_WIDTH;

let moderateScale = (size: number, factor = 0.5) => size + (widthScale * size - size) * factor;

export let responsiveFontSize = (fontSize: number, factor = 0.5) => {
  let newSize = moderateScale(fontSize, factor);

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
