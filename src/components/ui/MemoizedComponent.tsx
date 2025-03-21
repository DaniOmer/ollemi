import React, { memo, ComponentType } from "react";

/**
 * A higher-order component that wraps a component with React.memo for performance optimization.
 * This prevents unnecessary re-renders when the component's props haven't changed.
 *
 * @param Component - The component to be memoized
 * @param propsAreEqual - Optional custom comparison function for props
 * @returns A memoized version of the component
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * A wrapper component that applies React.memo to its children.
 * Use this for components that don't need to re-render frequently.
 */
export const MemoizedComponent: React.FC<{
  children: React.ReactNode;
}> = memo(({ children }) => {
  return <>{children}</>;
});

/**
 * A higher-order component that applies React.memo with a custom comparison function
 * that only checks specific props for changes.
 *
 * @param Component - The component to be memoized
 * @param propKeys - Array of prop keys to compare
 * @returns A memoized version of the component that only re-renders when the specified props change
 */
export function withSelectiveMemo<P extends object>(
  Component: ComponentType<P>,
  propKeys: (keyof P)[]
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(Component, (prevProps, nextProps) => {
    return propKeys.every((key) => prevProps[key] === nextProps[key]);
  });
}

export default MemoizedComponent;
