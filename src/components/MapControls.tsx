import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import MapButton from './MapButton';

import { PRIMARY_BLUE, WHITE } from '../utils/colors';

const MapControls: React.FC = () => {
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
        onPress={() => console.log('layers button pressed')}
        icon="layers-outline"
        iconColor={PRIMARY_BLUE}
        iconSize={26}
      />
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
    top: 82,
    right: 12,
  },
  infoButton: {
    right: 12,
    bottom: 180,
  },
  layersButton: {
    right: 12,
    bottom: 120,
  },
});

export default MapControls;
