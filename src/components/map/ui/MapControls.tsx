import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '@utils/hooks';

import MapButton from './MapButton';
import RelocateButton from './RelocateButton';
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
  const { t } = useTranslation();
  const isLandscape = useOrientation();
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {showRelocateButton && (
        <RelocateButton
          onPress={relocate}
          style={[styles.mapButton, styles.center, styles.topFirst]}
        />
      )}
      <MapButton
        style={[
          styles.mapButton,
          styles.right,
          styles.topFirst,
          isLandscape && styles.left,
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
        ]}
        accessibilityLabel={t('map:minusButtonAccessibilityLabel')}
        onPress={onZoomOut}
        icon="minus"
        iconSize={26}
      />
      <MapButton
        style={[
          styles.mapButton,
          styles.right,
          isLandscape ? styles.topFirst : styles.bottomSecond,
        ]}
        accessibilityLabel={t('map:infoButtonAccessibilityLabel')}
        onPress={onInfoPressed}
        icon="info"
        iconSize={26}
      />
      <MapButton
        style={[
          styles.mapButton,
          styles.right,
          isLandscape ? styles.topSecond : styles.bottomFirst,
        ]}
        accessibilityLabel={t('map:layersButtonAccessibilityLabel')}
        onPress={onLayersPressed}
        icon="layers"
        iconSize={26}
      />
      <TimeSlider />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    zIndex: 0,
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
    bottom: 30 + 150,
  },
  bottomFirst: {
    right: 12,
    bottom: 30 + 90,
  },
});

export default MapControls;
