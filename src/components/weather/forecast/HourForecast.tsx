import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { State } from '@store/types';

import { CustomTheme, WHITE } from '@assets/colors';
import { selectClockType, selectUnits } from '@store/settings/selectors';
import { TimeStepData } from '@store/forecast/types';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { converter, getForecastParameterUnitTranslationKey, toPrecision } from '@utils/units';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHoursForecastProps = PropsFromRedux & {
  timeStep: TimeStepData;
  forceDark?: boolean;
};

const HourForecast: React.FC<NextHoursForecastProps> = ({
  clockType, units, timeStep, forceDark
}) => {
  const { t } = useTranslation('forecast');
  const { colors, dark } = useTheme() as CustomTheme;

  const temperatureUnit = units?.temperature.unitAbb ?? Config.get('settings').units.temperature;
  const convertedTemperature =
    timeStep.temperature || timeStep.temperature === 0
      ? toPrecision(
          'temperature',
          temperatureUnit,
          converter(temperatureUnit, timeStep.temperature)
        )
      : '-';

  const time = moment
    .unix(timeStep.epochtime)
    .format(clockType === 12 ? 'h a' : 'HH');
  const smartSymbol = weatherSymbolGetter(
    (timeStep.smartSymbol || 0).toString(),
    dark
  );

  const textColor = forceDark === true ? WHITE : colors.primaryText;
  const accessibilityLabel = `${t('forecast:at')} ${time}, ${t(`symbols:${timeStep.smartSymbol}`)}, ${t('forecast:params:temperature', {
        value: convertedTemperature,
        unit: t(
          `forecast:${getForecastParameterUnitTranslationKey(
            temperatureUnit
          )}`
        ),
      })}`

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.timeText, { color: textColor }]}>
        { time }
      </Text>
      <View>
        {smartSymbol?.({
          width: 36,
          height: 36,
        })}
      </View>
      <View>
        <Text
          style={[styles.temperatureText, { color: colors.hourListText }]}>
          {`${convertedTemperature}°${temperatureUnit}`}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 70,
    alignItems: 'center',
  },
  timeText: {
    fontFamily: 'Roboto-SemiBold',
    fontSize: 16,
  },
  temperatureText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});

export default connector(HourForecast);