import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewInstance,
  ViewInstance,
  ViewProps,
} from 'react-native';
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

export type DragAutoScroll = {
  getOffset: () => number;
  start: (
    pageY: number,
    onScroll: (offset: number) => void,
    rowsView?: ViewInstance | null
  ) => void;
  move: (pageY: number) => void;
  stop: () => void;
};

type Drag = {
  pageY: number;
  onScroll: (offset: number) => void;
  measured: boolean;
  rowsView?: ViewInstance | null;
  rowsTop?: number;
  rowsBottom?: number;
  lastTime?: number;
};

const EDGE_SIZE = 64;
const MAX_SPEED = 0.6; // Points per millisecond.

export const useDragAutoScroll = () => {
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const bounds = useRef({ top: 0, height: 0, contentHeight: 0, offset: 0 });
  const drag = useRef<Drag | null>(null);
  const frame = useRef<number | null>(null);

  const stop = useCallback(() => {
    drag.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const tick = useCallback((time: number) => {
    frame.current = null;
    const current = drag.current;
    if (!current?.measured) return;
    const { top, height, contentHeight, offset } = bounds.current;
    const edge = Math.min(EDGE_SIZE, height / 4);
    if (edge <= 0) return;
    const y = current.pageY - top;
    let speed = 0;
    if (y < edge) speed = -MAX_SPEED * Math.min(1, (edge - y) / edge);
    else if (y > height - edge)
      speed = MAX_SPEED * Math.min(1, (y - height + edge) / edge);
    const elapsed =
      current.lastTime === undefined
        ? 16
        : Math.min(32, time - current.lastTime);
    current.lastTime = time;
    const minOffset = Math.max(0, current.rowsTop ?? 0);
    const maxOffset = Math.min(
      Math.max(0, contentHeight - height),
      (current.rowsBottom ?? contentHeight) - height
    );
    // A short list can already fit between both edges. Never jump to a bound
    // in the opposite direction when the pointer requests further scrolling.
    const next =
      speed > 0
        ? Math.max(offset, Math.min(maxOffset, offset + speed * elapsed))
        : Math.min(offset, Math.max(minOffset, offset + speed * elapsed));
    if (speed === 0 || next === offset) {
      current.lastTime = undefined;
      return;
    }
    // Position updates use the actual native offset from onScroll, rather than
    // the requested offset, so clamping and delayed scroll events stay in sync.
    scrollViewRef.current?.scrollTo({ y: next, animated: false });
    frame.current = requestAnimationFrame(tick);
  }, []);

  const schedule = useCallback(() => {
    if (drag.current && frame.current === null)
      frame.current = requestAnimationFrame(tick);
  }, [tick]);

  const measureViewport = useCallback(() => {
    const current = drag.current;
    if (!current) return;
    current.measured = false;
    scrollViewRef.current?.measureInWindow((_x, top, _width, height) => {
      if (drag.current !== current) return;
      bounds.current.top = top;
      bounds.current.height = height;
      if (current.rowsView) {
        current.rowsView.measureInWindow(
          (_rowsX, rowsTop, _rowsWidth, rowsHeight) => {
            if (drag.current !== current) return;
            // Convert the row container's window position to content coordinates.
            current.rowsTop = rowsTop - top + bounds.current.offset;
            current.rowsBottom = current.rowsTop + rowsHeight;
            current.measured = true;
            schedule();
          }
        );
      } else {
        current.measured = true;
        schedule();
      }
    });
  }, [schedule]);

  const start = useCallback(
    (
      pageY: number,
      onScroll: (offset: number) => void,
      rowsView?: ViewInstance | null
    ) => {
      stop();
      drag.current = { pageY, onScroll, rowsView, measured: false };
      measureViewport();
    },
    [measureViewport, stop]
  );

  const move = useCallback(
    (pageY: number) => {
      if (!drag.current) return;
      drag.current.pageY = pageY;
      schedule();
    },
    [schedule]
  );

  const onScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      bounds.current.offset = nativeEvent.contentOffset.y;
      drag.current?.onScroll(nativeEvent.contentOffset.y);
    },
    []
  );

  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      bounds.current.height = nativeEvent.layout.height;
      if (drag.current) measureViewport();
    },
    [measureViewport]
  );

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      bounds.current.contentHeight = height;
      if (drag.current) measureViewport();
    },
    [measureViewport]
  );

  useEffect(() => stop, [stop]);

  const autoScroll = useMemo<DragAutoScroll>(
    () => ({
      getOffset: () => bounds.current.offset,
      start,
      move,
      stop,
    }),
    [start, move, stop]
  );

  return { scrollViewRef, onScroll, onLayout, onContentSizeChange, autoScroll };
};
