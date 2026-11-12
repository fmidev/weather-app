import React, {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  ModalBottomSheet,
  type ScrollableNegotiation,
} from '@swmansion/react-native-bottom-sheet';
import { GRAY_1, WHITE } from '@assets/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetProps {
  ref?: React.Ref<BottomSheetRef>;
  children: React.ReactNode;
  height: number;
  backgroundStyle?: StyleProp<ViewStyle>;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
  scrollableNegotiation?: ScrollableNegotiation;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  ref,
  children,
  height,
  backgroundStyle,
  handleIndicatorStyle,
  scrollableNegotiation,
}) => {
  const { bottom } = useSafeAreaInsets();
  const [index, setIndex] = useState<0 | 1 | null>(null);
  const targetIndex = useRef<0 | 1 | null>(null);
  const presented = useRef(false);

  useLayoutEffect(() => {
    presented.current = index !== null;
  }, [index]);

  const close = () => {
    if (targetIndex.current === null || targetIndex.current === 0) return;
    const nextIndex = presented.current ? 0 : null;
    targetIndex.current = nextIndex;
    setIndex(nextIndex);
  };

  useImperativeHandle(ref, () => ({
    open: () => {
      targetIndex.current = 1;
      setIndex(1);
    },
    close,
  }));

  if (index === null) return null;

  return (
    <ModalBottomSheet
      nativeOverlay
      index={index}
      detents={[0, height]}
      scrimColor="rgba(0, 0, 0, 0.47)"
      scrollableNegotiation={scrollableNegotiation}
      onCloseRequest={close}
      onIndexChange={(nextIndex) => {
        if (nextIndex === 0) close();
      }}
      onSettle={(settledIndex) => {
        if (settledIndex === 0 && targetIndex.current === 0) {
          targetIndex.current = null;
          setIndex(null);
        }
      }}
      surface={
        <View
          style={[StyleSheet.absoluteFill, styles.surface, backgroundStyle]}
          pointerEvents="none"
          accessible={false}
          focusable={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      }>
      <View
        style={styles.content}
        accessible={false}
        focusable={false}
        accessibilityViewIsModal
        onAccessibilityEscape={close}>
        <View
          testID="bottom_sheet_handle"
          style={styles.handle}
          accessible={false}
          focusable={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <View style={[styles.indicator, handleIndicatorStyle]} />
        </View>
        <View style={[styles.content, { paddingBottom: bottom }]}>
          {children}
        </View>
      </View>
    </ModalBottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  surface: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  indicator: {
    width: 35,
    height: 5,
    borderRadius: 3,
    backgroundColor: GRAY_1,
  },
});

export default BottomSheet;
