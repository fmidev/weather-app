import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';

import { Marker, LatLng } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@assets/colors';
import { converter, toPrecision } from '@utils/units';

import { State } from '@store/types';

import Icon from '@assets/Icon';
import { selectSelectedCallout } from '@store/map/selectors';
import { updateSelectedCallout as updateSelectedCalloutAction } from '@store/map/actions';

import { Config } from '@config';
import { selectUnits } from '@store/settings/selectors';

const mapStateToProps = (state: State) => ({
  selectedCallout: selectSelectedCallout(state),
  units: selectUnits(state),
});

const mapDispatchToProps = {
  updateSelectedCallout: updateSelectedCalloutAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type TimeseriesMarkerProps = PropsFromRedux & {
  name: string;
  coordinate: LatLng;
  smartSymbol: number;
  temperature: number;
  windDirection: number;
  windSpeedMS: number;
};

const TimeseriesMarker: React.FC<TimeseriesMarkerProps> = ({
  name,
  coordinate,
  smartSymbol,
  temperature,
  windDirection,
  windSpeedMS,
  selectedCallout,
  updateSelectedCallout,
  units,
}) => {
  const { t } = useTranslation();
  const { colors, dark } = useTheme() as CustomTheme;

  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;

  const convertValue = (
    unit: string,
    unitAbb: string,
    val: number | undefined | null
  ) => {
    const result =
      val || val === 0
        ? toPrecision(unit, unitAbb, converter(unitAbb, val))
        : null;
    return result;
  };

  const temperatureValue = convertValue(
    'temperature',
    temperatureUnit,
    temperature
  );

  const windSpeedValue = convertValue('wind', windUnit, windSpeedMS);

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={false}
      onPress={() => {
        updateSelectedCallout(name === selectedCallout ? undefined : name);
      }}>
      <View
        style={[
          styles.markerContainer,
          {
            backgroundColor: colors.mapButtonBackground,
            borderColor: colors.mapButtonBorder,
          },
        ]}>
        <View style={styles.mainRow}>
          {weatherSymbolGetter(
            smartSymbol.toString(),
            false
          )?.({
            width: 40,
            height: 40,
          })}
          <Text
            accessibilityLabel={`${temperatureValue} ${t(
              `observation:paramUnits:°${temperatureUnit}`
            )}`}
            style={[styles.tempText, { color: colors.text }]}>
            {`${temperatureValue}°${temperatureUnit}`}
          </Text>
        </View>
        {selectedCallout && selectedCallout === name && (
          <View style={styles.calloutContainer}>
            <Text style={[styles.calloutTitle, { color: colors.text }]}>
              {name}
            </Text>
            <Text style={[styles.calloutText, { color: colors.text }]}>
              {`${t(`symbols:${smartSymbol}`)}`}
            </Text>
            <View style={styles.windSpeedRow}>
              <Icon
                name={dark ? 'wind-dark' : 'wind-light-map'}
                width={24}
                height={24}
                style={{
                  transform: [
                    {
                      rotate: `${(windDirection || 0) + 45 - 180}deg`,
                    },
                  ],
                }}
              />
              <Text
                style={[styles.calloutText, { color: colors.text }]}
                accessibilityLabel={`${windSpeedValue} ${t(
                  `observation:paramUnits:${windUnit}`
                )}`}>
                {`${windSpeedValue} ${windUnit}`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    marginLeft: 4,
  },
  calloutContainer: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  calloutTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
  calloutText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
  windSpeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default connector(TimeseriesMarker);
