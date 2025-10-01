import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, Switch, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import { selectMapLayers, selectActiveOverlay } from '@store/map/selectors';
import {
  updateMapLayers as updateMapLayersAction,
  updateActiveOverlay as updateActiveOverlayAction,
} from '@store/map/actions';

import {
  WHITE,
  SECONDARY_BLUE,
  GRAYISH_BLUE,
  GRAY_1,
  CustomTheme,
} from '@assets/colors';
import { Config } from '@config';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  activeOverlay: selectActiveOverlay(state),
  mapLayers: selectMapLayers(state),
});

const mapDispatchToProps = {
  updateMapLayers: updateMapLayersAction,
  updateActiveOverlay: updateActiveOverlayAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapLayersBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const MapLayersBottomSheet: React.FC<MapLayersBottomSheetProps> = ({
  activeOverlay,
  onClose,
  mapLayers,
  updateMapLayers,
  updateActiveOverlay,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { layers } = Config.get('map');

  const { colors } = useTheme() as CustomTheme;
  return (
    <View testID="map_layers_bottom_sheet" style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            testID="layers_bottom_sheet_close_button"
            onPress={onClose}
            accessibilityLabel={t(
              'map:layersBottomSheet:closeAccessibilityLabel'
            )}
          />
        </View>

        <View style={styles.sheetTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('map:layersBottomSheet:locationTitle')}
          </Text>
        </View>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <View
            style={styles.row}
            accessible
            accessibilityState={{ selected: mapLayers.location }}
            accessibilityHint={
              mapLayers.location
                ? t('map:layersBottomSheet:hideLocationAccessibilityHint')
                : t('map:layersBottomSheet:showLocationAccessibilityHint')
            }
            onAccessibilityTap={() =>
              updateMapLayers({
                ...mapLayers,
                location: !mapLayers.location,
              })
            }>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('map:layersBottomSheet:locationHint')}
            </Text>
            <Switch
              style={Platform.OS === 'ios' && Number(Platform.Version) >= 26 ? styles.wideSwitch : null }
              trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
              thumbColor={WHITE}
              ios_backgroundColor={WHITE}
              value={mapLayers.location}
              onValueChange={() => {
                trackMatomoEvent('User action', 'Map', 'Show own location - '+!mapLayers.location);
                updateMapLayers({
                  ...mapLayers,
                  location: !mapLayers.location,
                });
              }}
            />
          </View>
        </View>

        <View style={styles.sheetTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('map:layersBottomSheet:mapLayersTitle')}
          </Text>
        </View>
        {layers.length > 0 &&
          layers.map((layer) => (
            <AccessibleTouchableOpacity
              key={layer.id}
              accessibilityRole="button"
              accessibilityLabel={
                layer.id === activeOverlay
                  ? `${layer?.name && layer?.name[locale]}`
                  : `${layer?.name && layer?.name[locale]}, ${t(
                      'map:layersBottomSheet:notSelected'
                    )}`
              }
              accessibilityState={{ selected: layer.id === activeOverlay }}
              accessibilityHint={
                layer.id === activeOverlay
                  ? ''
                  : t('map:layersBottomSheet:selectLayerAccessibilityHint')
              }
              onPress={() => {
                if (layer.id === activeOverlay) return;
                trackMatomoEvent('User action', 'Map', 'Layer selected - '+layer?.name[locale]);
                onClose();
                updateActiveOverlay(Number(layer.id));
              }}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {(layer?.name && layer?.name[locale]) || ''}
                </Text>
                <Icon
                  name={
                    activeOverlay === layer.id
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  style={{
                    color: activeOverlay === layer.id ? colors.primary : GRAY_1,
                  }}
                />
              </View>
            </AccessibleTouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rowWrapper: {
    paddingBottom: 28,
    paddingTop: 15,
    marginBottom: 14,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flexShrink: 1,
  },
  wideSwitch: {
    width: 65, // wider switch for iOS 26
  },
});

export default connector(MapLayersBottomSheet);
