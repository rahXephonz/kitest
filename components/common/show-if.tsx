interface ShowIfProps<T> {
  condition: T;
  fallback?: React.ReactNode;
  children: React.ReactNode | ((conditionValue: NonNullable<T>) => React.ReactNode);
}

/**
 * The ShowIf component renders its children if a given condition is `true`, otherwise it renders a
 * fallback component.
 * @param {ShowIfProps}  - `fallback`: This is a default value that will be returned if the
 * `condition` prop is `false`.
 * @returns If the condition is `true`, the children of the `ShowIf` component are being returned.
 * Otherwise, the fallback value is being returned.
 */
const ShowIf = <T,>({ fallback = null, ...props }: ShowIfProps<T>) => {
  if (props.condition) {
    if (typeof props.children === "function" && props.children instanceof Function) {
      return props.children(props.condition);
    }

    return props.children;
  }

  return fallback;
};

export { ShowIf, type ShowIfProps };
