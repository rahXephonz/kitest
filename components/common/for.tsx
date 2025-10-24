import React, { JSX } from "react";

interface ForProps<TData = any> {
  each: TData[];
  children: (eachItem: TData, index: number) => JSX.Element;
}

/**
 * The `For` component is a TypeScript React component that iterates over an array of data and renders
 * child components for each item in the array.
 * @param props - The `props` parameter is an object that contains the properties passed to the `For`
 * component.
 * @returns The For component is returning the result of mapping over the `props.each` array and
 * calling the `props.children` function for each item in the array. The result is an array of React
 * elements.
 */
const For = <TData,>(props: ForProps<TData>) => {
  return React.Children.toArray(props?.each?.map((item, itemIdx) => props.children(item, itemIdx)));
};

export default For;
export { For, type ForProps };
