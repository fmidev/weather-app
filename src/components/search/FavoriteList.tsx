import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  type ViewInstance,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/ScalableIcon';
import { Config } from '@config';
import { CustomTheme } from '@assets/colors';
import type { Location } from '@store/location/types';
import { useAccessibilityLanguage, type DragAutoScroll } from '@utils/hooks';
import AreaList, { AreaListItem, AreaListProps } from './AreaList';

type Props = AreaListProps & {
  renderItem?: never;
  iconName?: never;
  iconNameGetter?: never;
  onReorder: (from: number, to: number) => void;
  onDragStateChange: (dragging: boolean) => void;
  autoScroll?: DragAutoScroll;
};

type Drag = {
  from: number;
  to: number;
  startY: number;
  pageY: number;
  startScrollOffset: number;
  elements: Location[];
};
type RowLayout = { y: number; height: number };

const FavoriteList: React.FC<Props> = ({
  elements,
  onSelect,
  onIconPress,
  onReorder,
  onDragStateChange,
  autoScroll,
  ...props
}) => {
  const { t } = useTranslation('searchScreen');
  const { colors } = useTheme() as CustomTheme;
  const accessibilityLanguage = useAccessibilityLanguage();
  const reorderEnabled =
    Config.get('weather').favoritesPanelEnabled !== false &&
    elements.length > 1;
  const layouts = useRef(new Map<string | number, RowLayout>());
  const rowsRef = useRef<ViewInstance>(null);
  const drag = useRef<Drag | null>(null);
  const dropAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const settling = useRef(false);
  const reduceMotion = useRef(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const [dragState, setDragState] = useState<Drag | null>(null);
  const currentDrag =
    reorderEnabled && dragState?.elements === elements ? dragState : null;

  useEffect(() => {
    const updateMotionPreference = (enabled: boolean) => {
      reduceMotion.current = enabled;
    };
    const readMotionPreference = async () => {
      updateMotionPreference(await AccessibilityInfo.isReduceMotionEnabled());
    };
    readMotionPreference();
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      updateMotionPreference
    );
    return () => subscription.remove();
  }, []);

  const cancelDrag = useCallback(() => {
    if (!drag.current) return;
    autoScroll?.stop();
    drag.current = null;
    settling.current = false;
    dropAnimation.current?.stop();
    dropAnimation.current = null;
    // Keep the animated value until the next drag. Resetting it here moves the
    // native view back before React commits the new order and removes its transform.
    setDragState(null);
    onDragStateChange(false);
  }, [autoScroll, onDragStateChange]);

  // Cancel if the list changes, reordering is disabled, or the component is removed.
  useEffect(() => () => cancelDrag(), [elements, reorderEnabled, cancelDrag]);

  const moveDrag = (
    pageY: number,
    scrollOffset = autoScroll?.getOffset() ?? 0
  ) => {
    const current = drag.current;
    if (!current || settling.current) return;
    current.pageY = pageY;
    const rows = elements.map(({ id }) => layouts.current.get(id)!);
    const source = rows[current.from];
    const last = rows[rows.length - 1];
    const offset = Math.max(
      rows[0].y - source.y,
      Math.min(
        pageY - current.startY + scrollOffset - current.startScrollOffset,
        last.y + last.height - source.y - source.height
      )
    );
    translateY.setValue(offset);
    const center = source.y + source.height / 2 + offset;
    let to = current.from;
    rows.forEach((row, index) => {
      if (index < current.from && center <= row.y + row.height / 2) {
        to = Math.min(to, index);
      } else if (index > current.from && center >= row.y + row.height / 2) {
        to = Math.max(to, index);
      }
    });
    if (to !== current.to) {
      drag.current = { ...current, to };
      setDragState(drag.current);
    }
  };

  const finishDrag = () => {
    const current = drag.current;
    if (!current || settling.current) return;
    autoScroll?.stop();
    const source = layouts.current.get(elements[current.from].id)!;
    const target = layouts.current.get(elements[current.to].id)!;
    const toValue =
      target.y -
      source.y +
      (current.to > current.from ? target.height - source.height : 0);
    settling.current = true;
    dropAnimation.current = Animated.timing(translateY, {
      toValue,
      duration: reduceMotion.current ? 0 : 160,
      easing: Easing.out(Easing.cubic),
      // Keep the transform in the same React commit as the reordered row layout.
      useNativeDriver: false,
    });
    dropAnimation.current.start(({ finished }) => {
      if (!finished || drag.current !== current) return;
      cancelDrag();
      if (current.from !== current.to) {
        onReorder(current.from, current.to);
      }
    });
  };

  return (
    <AreaList
      {...props}
      rowsRef={rowsRef}
      elements={elements}
      onSelect={onSelect}
      onIconPress={onIconPress}
      renderItem={(element, index) => {
        const active = currentDrag?.from === index;
        let offset = 0;
        if (currentDrag) {
          const height =
            layouts.current.get(elements[currentDrag.from].id)?.height ?? 0;
          if (index > currentDrag.from && index <= currentDrag.to)
            offset = -height;
          if (index < currentDrag.from && index >= currentDrag.to)
            offset = height;
        }
        const name =
          element.area && element.area !== element.name
            ? `${element.name}, ${element.area}`
            : element.name;
        return (
          <Animated.View
            testID={`favorite-row-${element.id}`}
            onLayout={({ nativeEvent: { layout } }) => {
              layouts.current.set(element.id, layout);
            }}
            style={[
              active && styles.draggedRow,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: active ? translateY : offset }],
              },
            ]}>
            <AreaListItem
              element={element}
              onSelect={onSelect}
              onIconPress={onIconPress}
              iconName="star-selected"
              leadingAccessory={
                reorderEnabled && (
                  <View
                    testID={`favorite-drag-handle-${element.id}`}
                    style={styles.handle}
                    accessible
                    accessibilityLanguage={accessibilityLanguage}
                    accessibilityRole="adjustable"
                    accessibilityLabel={t('reorderFavorite', {
                      location: name,
                    })}
                    accessibilityHint={t('reorderFavoriteHint')}
                    accessibilityValue={{
                      min: 1,
                      max: elements.length,
                      now: index + 1,
                    }}
                    accessibilityActions={[
                      ...(index > 0
                        ? [{ name: 'decrement', label: t('moveFavoriteUp') }]
                        : []),
                      ...(index < elements.length - 1
                        ? [{ name: 'increment', label: t('moveFavoriteDown') }]
                        : []),
                    ]}
                    onAccessibilityAction={({
                      nativeEvent: { actionName },
                    }) => {
                      if (actionName === 'decrement' && index > 0)
                        onReorder(index, index - 1);
                      if (
                        actionName === 'increment' &&
                        index < elements.length - 1
                      ) {
                        onReorder(index, index + 1);
                      }
                    }}
                    onStartShouldSetResponder={() => reorderEnabled}
                    onResponderTerminationRequest={() => false}
                    onResponderGrant={({ nativeEvent: { pageY } }) => {
                      if (
                        !reorderEnabled ||
                        drag.current ||
                        elements.some(({ id }) => !layouts.current.has(id))
                      )
                        return;
                      translateY.setValue(0);
                      drag.current = {
                        from: index,
                        to: index,
                        startY: pageY,
                        pageY,
                        startScrollOffset: autoScroll?.getOffset() ?? 0,
                        elements,
                      };
                      setDragState(drag.current);
                      onDragStateChange(true);
                      autoScroll?.start(
                        pageY,
                        (scrollOffset) => {
                          if (drag.current)
                            moveDrag(drag.current.pageY, scrollOffset);
                        },
                        rowsRef.current
                      );
                    }}
                    onResponderMove={({ nativeEvent: { pageY } }) => {
                      autoScroll?.move(pageY);
                      moveDrag(pageY);
                    }}
                    onResponderRelease={finishDrag}
                    onResponderTerminate={cancelDrag}>
                    <Icon
                      name="reorder-three-outline"
                      size={24}
                      maxScaleFactor={1.5}
                      accessible={false}
                      style={{ color: colors.text }}
                    />
                  </View>
                )
              }
            />
          </Animated.View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  handle: {
    width: 44,
    minHeight: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggedRow: {
    zIndex: 1,
    elevation: 2,
  },
});

export default FavoriteList;
