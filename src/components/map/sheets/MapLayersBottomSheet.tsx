import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import AccessibleSwitch from '@components/common/AccessibleSwitch';
import CloseButton from '@components/common/CloseButton';
import SpeedSelector from '@components/map/ui/SpeedSelector';
import LayerSelector from '@components/map/ui/LayerSelector';

import { State } from '@store/types';
import { selectMapLayers, selectActiveOverlay, selectAnimationSpeed } from '@store/map/selectors';
import {
  updateMapLayers as updateMapLayersAction,
  updateActiveOverlay as updateActiveOverlayAction,
  updateAnimationSpeed as updateAnimationSpeedAction,
} from '@store/map/actions';

import { CustomTheme } from '@assets/colors';
import { trackMatomoEvent } from '@utils/matomo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOLD_FONT } from '@assets/constants';

const mapStateToProps = (state: State) => ({
  activeOverlay: selectActiveOverlay(state),
  mapLayers: selectMapLayers(state),
  animationSpeed: selectAnimationSpeed(state)
});

const mapDispatchToProps = {
  updateMapLayers: updateMapLayersAction,
  updateActiveOverlay: updateActiveOverlayAction,
  updateAnimationSpeed: updateAnimationSpeedAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapLayersBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const MapLayersBottomSheet: React.FC<MapLayersBottomSheetProps> = ({
  onClose,
  mapLayers,
  updateMapLayers,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme() as CustomTheme;

  const isWideDisplay = () => width > 500;
  const columnWidth = isWideDisplay() ? '48%' : '100%';
  const columnMargin = isWideDisplay() ? 8 : 0;
  const paddingTop = isWideDisplay() ? insets.top : 8;

  return (
    <ScrollView
      testID="map_layers_bottom_sheet"
      style={[styles.wrapper, { paddingLeft: insets.left, paddingRight: insets.right, paddingTop }]}
    >
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            maxScaleFactor={1.5}
            testID="layers_bottom_sheet_close_button"
            onPress={onClose}
            accessibilityLabel={t(
              'map:layersBottomSheet:closeAccessibilityLabel'
            )}
          />
        </View>

        <View style={styles.flexRowWithWrap}>
          <View style={{ width: columnWidth, marginRight: columnMargin }}>
            <View style={[styles.sheetTitle, styles.topTitle]}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[styles.title, { color: colors.text }]}
              >
                {t('map:layersBottomSheet:locationTitle')}
              </Text>
            </View>
            <View
              style={[
                styles.withMarginBottom,
                styles.withBorderBottom,
                { borderBottomColor: colors.border },
              ]}>
              <AccessibleSwitch
                label={t('map:layersBottomSheet:locationHint')}
                value={mapLayers.location}
                style={styles.locationSwitch}
                accessibilityHint={
                  mapLayers.location
                    ? t('map:layersBottomSheet:hideLocationAccessibilityHint')
                    : t('map:layersBottomSheet:showLocationAccessibilityHint')
                }
                onValueChange={(value) => {
                  trackMatomoEvent('User action', 'Map', `Show own location - ${value}`);
                  updateMapLayers({ ...mapLayers, location: value });
                }}
              />
            </View>

            <View style={styles.sheetTitle}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[styles.title, { color: colors.text }]}
              >
                {t('map:layersBottomSheet:animationSpeedTitle')}
              </Text>
            </View>
            <SpeedSelector />
          </View>

          <View style={[styles.withMarginBottom, { width: columnWidth, marginLeft: columnMargin }]}>
            <View style={[styles.sheetTitle, isWideDisplay() && styles.topTitle]}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[styles.title, { color: colors.text }]}
              >
                {t('map:layersBottomSheet:mapLayersTitle')}
              </Text>
            </View>
            <LayerSelector onClose={onClose} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 8,
  },
  sheetListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // Keep the close button's full hit area above the first controls for Android Tab order.
  topTitle: {
    minHeight: 44,
    paddingRight: 44,
  },
  withMarginBottom: {
    marginBottom: 14,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  flexRowWithWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  locationSwitch: {
    marginBottom: 8,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
  },
});

export default connector(MapLayersBottomSheet);
