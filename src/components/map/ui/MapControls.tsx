import React, { useContext, useLayoutEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useOrientation, usesVerticalBarLayout } from '@utils/hooks';
import { ScreenHeaderItemsContext } from '@navigators/ScreenHeaderItemsContext';

import MapButton from './MapButton';
import RelocateButton from './RelocateButton';
import LayerTimeStepSelector from './LayerTimeStepSelector';
import TimeSlider from './TimeSlider';

type MapControlsProps = {
  onLayersPressed: () => void;
  onInfoPressed: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  relocate: () => void;
  showRelocateButton: boolean;
};

const MapControls: React.FC<MapControlsProps> = ({
  onLayersPressed,
  onInfoPressed,
  onZoomIn,
  onZoomOut,
  showRelocateButton,
  relocate,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isLandscape = useOrientation();
  const verticalBarLayout = usesVerticalBarLayout();
  const setHeaderItems = useContext(ScreenHeaderItemsContext);

  useLayoutEffect(() => {
    if (Platform.OS !== 'ios' || !setHeaderItems) return;

    setHeaderItems(
      verticalBarLayout
        ? [
            {
              type: 'button',
              label: t('map:plusButtonAccessibilityLabel'),
              accessibilityLabel: t('map:plusButtonAccessibilityLabel'),
              icon: { type: 'sfSymbol', name: 'plus' },
              onPress: onZoomIn,
            },
            {
              type: 'button',
              label: t('map:minusButtonAccessibilityLabel'),
              accessibilityLabel: t('map:minusButtonAccessibilityLabel'),
              icon: { type: 'sfSymbol', name: 'minus' },
              onPress: onZoomOut,
            },
            {
              type: 'button',
              label: t('map:infoButtonAccessibilityLabel'),
              accessibilityLabel: t('map:infoButtonAccessibilityLabel'),
              icon: { type: 'sfSymbol', name: 'info.circle' },
              onPress: onInfoPressed,
            },
            {
              type: 'button',
              label: t('map:layersButtonAccessibilityLabel'),
              accessibilityLabel: t('map:layersButtonAccessibilityLabel'),
              icon: { type: 'sfSymbol', name: 'square.3.layers.3d' },
              onPress: onLayersPressed,
            },
          ]
        : []
    );

    return () => setHeaderItems([]);
  }, [
    setHeaderItems,
    onInfoPressed,
    onLayersPressed,
    onZoomIn,
    onZoomOut,
    t,
    verticalBarLayout,
  ]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {showRelocateButton && (
        <RelocateButton
          onPress={relocate}
          style={[styles.mapButton, styles.center, styles.topFirst]}
        />
      )}
      {!verticalBarLayout && (
        <>
          <MapButton
            style={[
              styles.mapButton,
              styles.right,
              styles.topFirst,
              isLandscape && styles.left,
              isLandscape
                ? { left: insets.left + 12 }
                : { right: insets.right + 12 },
            ]}
            accessibilityLabel={t('map:plusButtonAccessibilityLabel')}
            onPress={onZoomIn}
            icon="plus"
            iconSize={26}
          />
          <MapButton
            style={[
              styles.mapButton,
              styles.right,
              styles.topSecond,
              isLandscape && styles.left,
              isLandscape
                ? { left: insets.left + 12 }
                : { right: insets.right + 12 },
            ]}
            accessibilityLabel={t('map:minusButtonAccessibilityLabel')}
            onPress={onZoomOut}
            icon="minus"
            iconSize={26}
          />
          <MapButton
            testID="map_info_button"
            style={[
              styles.mapButton,
              styles.right,
              isLandscape ? styles.topFirst : styles.bottomSecond,
              { right: insets.right + 12 },
            ]}
            accessibilityLabel={t('map:infoButtonAccessibilityLabel')}
            onPress={onInfoPressed}
            icon="info"
            iconSize={26}
          />
          <MapButton
            testID="map_layers_button"
            style={[
              styles.mapButton,
              styles.right,
              isLandscape ? styles.topSecond : styles.bottomFirst,
              { right: insets.right + 12 },
            ]}
            accessibilityLabel={t('map:layersButtonAccessibilityLabel')}
            onPress={onLayersPressed}
            icon="layers"
            iconSize={26}
          />
        </>
      )}
      <LayerTimeStepSelector />
      <TimeSlider />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapButton: {
    position: 'absolute',
    borderRadius: 8,
    height: 44,
    width: 44,
  },
  center: {
    alignSelf: 'center',
  },
  right: {
    right: 12,
  },
  left: {
    left: 12,
  },
  topFirst: {
    top: 42,
  },
  topSecond: {
    top: 104,
  },
  bottomSecond: {
    right: 12,
    bottom: 185,
  },
  bottomFirst: {
    right: 12,
    bottom: 125,
  },
});

export default MapControls;
