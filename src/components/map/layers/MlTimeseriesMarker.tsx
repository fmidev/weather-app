/* eslint-disable react-native/no-color-literals */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { MarkerView } from '@maplibre/maplibre-react-native';
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
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

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
  coordinate: [number, number];
  zoom: number;
  smartSymbol: number;
  temperature: number;
  windDirection: number;
  windSpeedMS: number;
};

const MlTimeseriesMarker: React.FC<TimeseriesMarkerProps> = ({
  name,
  coordinate,
  zoom,
  smartSymbol,
  temperature,
  windDirection,
  windSpeedMS,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedCallout,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateSelectedCallout,
  units,
}) => {
  const { t } = useTranslation();
  const { colors, dark } = useTheme() as CustomTheme;

  const [open, setOpen] = useState(false);

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
  const WeatherSymbol = weatherSymbolGetter(smartSymbol.toString(), false)
  const key= `marker-${coordinate[0]}-${coordinate[1]}-${zoom}`

  //console.log('MlTimeseriesMarker render', coordinate, name, temperatureValue);

  return (
      <MarkerView key={key} coordinate={coordinate} anchor={{ x: 0.5, y: 1 }}>
        <AccessibleTouchableOpacity
          onPress={() => setOpen((v) => !v)}
        >
          <View
            collapsable={false}
            style={[
              styles.markerContainer,
              {
                backgroundColor: colors.mapButtonBackground,
                borderColor: colors.mapButtonBorder,
              },
            ]}
          >
            <View style={styles.mainRow}>
              {WeatherSymbol ? <WeatherSymbol width={40} height={40} /> : null}
              <Text
                style={[styles.tempText, { color: colors.text }]}
                accessibilityLabel={`${temperatureValue} ${t(`observation:paramUnits:°${temperatureUnit}`)}`}
              >
                {`${temperatureValue}°${temperatureUnit}`}
              </Text>
            </View>
            { open && (
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
                      transform: [{ rotate: `${(windDirection || 0) + 45 - 180}deg` }],
                    }}
                  />
                  <Text
                    style={[styles.calloutText, { color: colors.text }]}
                    accessibilityLabel={`${windSpeedValue} ${t(
                      `observation:paramUnits:${windUnit}`
                    )}`}
                  >
                    {`${windSpeedValue} ${windUnit}`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </AccessibleTouchableOpacity>
      </MarkerView>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
    minWidth: 80,
    minHeight: 50,
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
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

export default connector(MlTimeseriesMarker);
