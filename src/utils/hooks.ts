import { useCallback, useEffect, useRef } from 'react';
import {
  findNodeHandle,
  NativeModules,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, ViewProps } from 'react-native';

export const useOrientation = () => {
  const { width, height } = useWindowDimensions();

  return width > height;
};

export const useAccessibilityHintLanguage = (
  hint: string | undefined,
  onLayout: ViewProps['onLayout']
): ViewProps['onLayout'] => {
  const viewTag = useRef<number | null>(null);
  const localized = useRef(false);

  const localizeHint = useCallback(() => {
    if (
      Platform.OS === 'android' &&
      (hint || localized.current) &&
      viewTag.current !== null
    ) {
      NativeModules.AppLanguage?.localizeAccessibilityHint?.(viewTag.current);
      localized.current = true;
    }
  }, [hint]);

  useEffect(localizeHint, [localizeHint]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // findNodeHandle accepts host instances, but its legacy TypeScript signature omits them.
      viewTag.current = findNodeHandle(
        event.currentTarget as unknown as Parameters<typeof findNodeHandle>[0]
      );
      localizeHint();
      onLayout?.(event);
    },
    [localizeHint, onLayout]
  );

  return Platform.OS === 'android' ? handleLayout : onLayout;
};

export default useOrientation;
