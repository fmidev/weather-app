import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

import Icon from './Icon';
import CloseButton from './CloseButton';

import { State } from '../store/types';
import { selectMapLayers } from '../store/map/selectors';
import { updateMapLayers as updateMapLayersAction } from '../store/map/actions';

import {
  VERY_LIGHT_BLUE,
  PRIMARY_BLUE,
  WHITE,
  SECONDARY_BLUE,
  GRAYISH_BLUE,
  GRAY,
} from '../utils/colors';

const mapStateToProps = (state: State) => ({
  mapLayers: selectMapLayers(state),
});

const mapDispatchToProps = {
  updateMapLayers: updateMapLayersAction,
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
  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t(
            'map:layersBottomSheet:closeAccessibilityLabel'
          )}
        />
      </View>

      <View style={styles.sheetTitle}>
        <Text style={styles.title}>
          {t('map:layersBottomSheet:locationTitle')}
        </Text>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <View style={styles.row}>
          <Text style={styles.text}>
            {t('map:layersBottomSheet:locationHint')}
          </Text>
          <Switch
            trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
            thumbColor={WHITE}
            ios_backgroundColor={GRAYISH_BLUE}
            value={mapLayers.userLocation}
            onValueChange={() =>
              updateMapLayers({
                ...mapLayers,
                userLocation: !mapLayers.userLocation,
              })
            }
          />
        </View>
      </View>

      <View style={styles.sheetTitle}>
        <Text style={styles.title}>
          {t('map:layersBottomSheet:localWeatherTitle')}
        </Text>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <View style={styles.row}>
          <Text style={styles.text}>
            {t('map:layersBottomSheet:showOnMap')}
          </Text>
          <Switch
            trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
            thumbColor={WHITE}
            ios_backgroundColor={GRAYISH_BLUE}
            value={mapLayers.weather}
            onValueChange={() =>
              updateMapLayers({ ...mapLayers, weather: !mapLayers.weather })
            }
          />
        </View>
        <View style={[styles.row, styles.innerRow]}>
          <Text style={styles.text}>
            {t('map:layersBottomSheet:temperatureAndWeather')}
          </Text>
          <Icon
            name="radio-button-on"
            width={22}
            height={22}
            style={{ color: SECONDARY_BLUE }}
          />
        </View>
        <View style={[styles.row, styles.innerRow]}>
          <Text style={styles.text}>
            {t('map:layersBottomSheet:precipitationAndPropability')}
          </Text>
          <Icon
            name="radio-button-off"
            width={22}
            height={22}
            style={{ color: GRAY }}
          />
        </View>
      </View>

      <View style={styles.sheetTitle}>
        <Text style={styles.title}>
          {t('map:layersBottomSheet:mapLayersTitle')}
        </Text>
      </View>
      <View style={styles.rowWrapper}>
        <View style={styles.row}>
          <Text style={styles.text}>
            {t('map:layersBottomSheet:rainRadar')}
          </Text>
          <Switch
            trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
            thumbColor={WHITE}
            ios_backgroundColor={GRAYISH_BLUE}
            value={mapLayers.radar}
            onValueChange={() =>
              updateMapLayers({ ...mapLayers, radar: !mapLayers.radar })
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderColor: VERY_LIGHT_BLUE,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  innerRow: {
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
  },
  text: {
    fontSize: 16,
    color: PRIMARY_BLUE,
  },
});

export default connector(MapLayersBottomSheet);
