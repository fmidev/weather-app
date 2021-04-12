import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import MapButton from './MapButton';
import TimeSlider from './TimeSlider';

import { PRIMARY_BLUE, WHITE } from '../utils/colors';

type MapControlsProps = {
  onTimeStepPressed: () => void;
  onLayersPressed: () => void;
};

const MapControls: React.FC<MapControlsProps> = ({
  onTimeStepPressed,
  onLayersPressed,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <MapButton
        style={[styles.mapButton, styles.searchButton]}
        accessibilityLabel={t('map:searchButtonAccessibilityLabel')}
        onPress={() => console.log('search button pressed')}
        icon="search-outline"
        iconColor={PRIMARY_BLUE}
        iconSize={26}
      />
      <MapButton
        style={[styles.mapButton, styles.infoButton]}
        accessibilityLabel={t('map:searchButtonAccessibilityLabel')}
        onPress={() => console.log('info button pressed')}
        icon="information-circle-outline"
        iconColor={PRIMARY_BLUE}
        iconSize={26}
      />
      <MapButton
        style={[styles.mapButton, styles.layersButton]}
        accessibilityLabel={t('map:searchButtonAccessibilityLabel')}
        onPress={onLayersPressed}
        icon="layers-outline"
        iconColor={PRIMARY_BLUE}
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
    backgroundColor: WHITE,
    height: 50,
    width: 50,
  },
  searchButton: {
    ...Platform.select({
      android: {
        top: 30 + 12,
      },
      ios: {
        top: 30 + 52,
      },
    }),
    right: 12,
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
