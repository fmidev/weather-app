import { useCallback, useEffect, useRef, useState } from 'react';
import {
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, ViewProps } from 'react-native';
import { useTranslation } from 'react-i18next';

const ACCESSIBILITY_LOCALES: Record<string, string> = {
  fi: 'fi-FI',
  sv: 'sv-SE',
  en: 'en-GB',
};

export const useAccessibilityLanguage = (): string | undefined => {
  const { i18n } = useTranslation();
  const language = i18n?.resolvedLanguage || i18n?.language;

  // Android uses the native app locale; VoiceOver reads the locale of each element.
  return Platform.OS === 'ios' && language
    ? ACCESSIBILITY_LOCALES[language] || language
    : undefined;
};

export const useOrientation = () => {
  const { width, height } = useWindowDimensions();

  return width > height;
};

export const useAccessibilityHintLanguage = (
  hint: string | undefined,
  onLayout: ViewProps['onLayout']
): ViewProps['onLayout'] => {
  const viewTag = useRef<number | undefined>(undefined);
  const localized = useRef(false);

  const localizeHint = useCallback(() => {
    if (
      Platform.OS === 'android' &&
      (hint || localized.current) &&
      viewTag.current != null
    ) {
      NativeModules.AppLanguage?.localizeAccessibilityHint?.(viewTag.current);
      localized.current = true;
    }
  }, [hint]);

  useEffect(localizeHint, [localizeHint]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewTag.current = findNodeHandle(event.currentTarget);
      localizeHint();
      onLayout?.(event);
    },
    [localizeHint, onLayout]
  );

  return Platform.OS === 'android' ? handleLayout : onLayout;
};

type VerticalBarLayoutModule = {
  getUsesVerticalBarLayout: () => Promise<boolean>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

/** Whether iOS places system controls in a vertical bar in the active window. */
const useVerticalBarLayout = (): boolean => {
  const [vertical, setVertical] = useState(false);
  const nativeModule =
    Platform.OS === 'ios'
      ? (NativeModules.VerticalBarLayout as VerticalBarLayoutModule | undefined)
      : undefined;

  useEffect(() => {
    if (!nativeModule) return;

    let active = true;
    let receivedChange = false;
    const emitter = new NativeEventEmitter(nativeModule);
    const subscription = emitter.addListener(
      'verticalBarLayoutDidChange',
      (value: unknown) => {
        if (!active || typeof value !== 'boolean') return;
        receivedChange = true;
        setVertical(value);
      }
    );

    const readLayout = async () => {
      try {
        const value = await nativeModule.getUsesVerticalBarLayout();
        // A layout change takes precedence over an older initial response.
        if (active && !receivedChange) setVertical(value);
      } catch {
        // Keep the map controls available if the native query fails.
      }
    };
    readLayout();

    return () => {
      active = false;
      subscription.remove();
    };
  }, [nativeModule]);

  return nativeModule ? vertical : false;
};

export { useVerticalBarLayout as usesVerticalBarLayout };

export const useHorizontalScrollEdges = (initialOffset = 0) => {
  const scrollMetrics = useRef({
    width: 0,
    contentWidth: 0,
    offset: initialOffset,
  });
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
  const updateScrollEdges = useCallback(
    (metrics: Partial<typeof scrollMetrics.current>) => {
      scrollMetrics.current = { ...scrollMetrics.current, ...metrics };
      const { width, contentWidth, offset } = scrollMetrics.current;
      const maxOffset = Math.max(0, contentWidth - width);
      const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
      // Allow for fractional layout values and overscroll at either end.
      const left = width > 0 && clampedOffset > 1;
      const right = width > 0 && maxOffset - clampedOffset > 1;
      setScrollEdges((current) =>
        current.left === left && current.right === right
          ? current
          : { left, right }
      );
    },
    []
  );

  return { scrollEdges, updateScrollEdges };
};

