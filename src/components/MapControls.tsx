import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import MapButton from './MapButton';
import TimeSlider from './TimeSlider';

type MapControlsProps = {
  onTimeStepPressed: () => void;
  onLayersPressed: () => void;
  onInfoPressed: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  relocate: () => void;
  showRelocateButton: boolean;
};

const MapControls: React.FC<MapControlsProps> = ({
  onTimeStepPressed,
  onLayersPressed,
  onInfoPressed,
  onZoomIn,
  onZoomOut,
  showRelocateButton,
  relocate,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {showRelocateButton && (
        <MapButton
          style={[styles.mapButton, styles.left, styles.layersButton]}
          accessibilityLabel={t('map:relocateButtonAccessibilityLabel')}
          onPress={relocate}
          icon="map-marker"
          iconSize={26}
        />
      )}
      <MapButton
        style={[styles.mapButton, styles.right, styles.plusButton]}
        accessibilityLabel={t('map:plusButtonAccessibilityLabel')}
        onPress={onZoomIn}
        icon="plus"
        iconSize={26}
      />
      <MapButton
        style={[styles.mapButton, styles.right, styles.minusButton]}
        accessibilityLabel={t('map:minusButtonAccessibilityLabel')}
        onPress={onZoomOut}
        icon="minus"
        iconSize={26}
      />
      <MapButton
        style={[styles.mapButton, styles.right, styles.infoButton]}
        accessibilityLabel={t('map:infoButtonAccessibilityLabel')}
        onPress={onInfoPressed}
        icon="info"
        iconSize={26}
      />
      <MapButton
        style={[styles.mapButton, styles.right, styles.layersButton]}
        accessibilityLabel={t('map:layersButtonAccessibilityLabel')}
        onPress={onLayersPressed}
        icon="layers"
        iconSize={26}
      />
      <TimeSlider onTimeStepPressed={onTimeStepPressed} />
    </>
  );
};

const styles = StyleSheet.create({
  mapButton: {
    position: 'absolute',
    borderRadius: 8,
    height: 50,
    width: 50,
  },
  left: {
    left: 12,
  },
  right: {
    right: 12,
  },
  plusButton: {
    top: 42,
  },
  minusButton: {
    top: 104,
  },

  infoButton: {
    right: 12,
    bottom: 30 + 150,
  },
  layersButton: {
    right: 12,
    bottom: 30 + 90,
  },
});

export default MapControls;
