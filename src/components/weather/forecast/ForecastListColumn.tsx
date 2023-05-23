import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import Icon from '@components/common/Icon';

import { DisplayParameters, TimeStepData } from '@store/forecast/types';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@utils/colors';
import * as constants from '@store/forecast/constants';

import { isOdd } from '@utils/helpers';
import { Config } from '@config';
import {
  converter,
  getForecastParameterUnitTranslationKey,
  toPrecision,
} from '@utils/units';
import { ClockType } from '@store/settings/types';

type ForecastListColumnProps = {
  clockType: ClockType;
  data: TimeStepData;
  displayParams: [number, DisplayParameters][];
};

const ForecastListColumn: React.FC<ForecastListColumnProps> = ({
  clockType,
  data,
  displayParams,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const { colors, dark } = useTheme() as CustomTheme;
  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const time = moment
    .unix(data.epochtime)
    .format(clockType === 12 ? 'h a' : 'HH');
  const smartSymbol = weatherSymbolGetter(
    (data.smartSymbol || 0).toString(),
    dark
  );

  return (
    <View
      accessible
      key={data.epochtime}
      style={[
        styles.hourColumn,
        ...(time === '00' || time === '12 am'
          ? [
              styles.dayChangeBorder,
              {
                borderLeftColor: colors.chartGridDay,
                borderColor: colors.border,
              },
            ]
          : [{ borderColor: colors.border }]),
      ]}>
      <View style={[styles.hourBlock, { backgroundColor: colors.listTint }]}>
        <Text
          accessibilityLabel={`${t('forecast:at')} ${time}.`}
          style={[styles.hourText, { color: colors.hourListText }]}>
          {time}
        </Text>
      </View>
      {displayParams
        .filter((displayParam) => displayParam[1] !== constants.DAY_LENGTH)
        .map(([i, param], index) => {
          if (param === constants.SMART_SYMBOL) {
            return (
              <View
                key={`${param}-${i}`}
                accessibilityLabel={`${t(`symbols:${data.smartSymbol}`)}.`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                {smartSymbol?.({
                  width: 40,
                  height: 40,
                })}
              </View>
            );
          }
          if (param === constants.WIND_SPEED_AND_DIRECTION) {
            const windSpeedUnit = Config.get('settings').units.wind;
            const convertedWindSpeed =
              data.windSpeedMS || data.windSpeedMS === 0
                ? toPrecision(
                    'wind',
                    windSpeedUnit,
                    converter(windSpeedUnit, data.windSpeedMS)
                  )
                : '-';
            const windSpeedUnitTranslation = t(
              `forecast:${getForecastParameterUnitTranslationKey(
                windSpeedUnit
              )}`
            );

            // wind direction can be with either one degree accuracy or uses cardinals (N,NE,E,...)
            const useCardinals =
              Config.get('weather').forecast.useCardinalsForWindDirection;
            let direction = 0;
            if (useCardinals) {
              const tempDir = data.windDirection || 0;
              if (
                (tempDir >= 338 && tempDir <= 360) ||
                (tempDir >= 0 && tempDir <= 22)
              ) {
                direction = 0; // N
              } else if (tempDir >= 23 && tempDir <= 67) {
                direction = 45; // NE
              } else if (tempDir >= 68 && tempDir <= 112) {
                direction = 90; // E
              } else if (tempDir >= 113 && tempDir <= 157) {
                direction = 135; // SE
              } else if (tempDir >= 158 && tempDir <= 202) {
                direction = 180; // S
              } else if (tempDir >= 203 && tempDir <= 247) {
                direction = 225; // SW
              } else if (tempDir >= 248 && tempDir <= 292) {
                direction = 270; // W
              } else if (tempDir >= 293 && tempDir <= 337) {
                direction = 315; // NW
              }
              // for some reason icon is pointing NW instead of N => +45
              // wind value needs 180 degree switch to show correctly where wind is coming from
              direction = direction + 45 - 180;
            } else {
              direction = (data.windDirection || 0) + 45 - 180;
            }

            return (
              <View
                accessibilityLabel={
                  data.windCompass8
                    ? `${t(
                        `observation:windDirection:${data.windCompass8}`
                      )} ${convertedWindSpeed} ${windSpeedUnitTranslation}
                    `
                    : `${convertedWindSpeed} ${windSpeedUnitTranslation}`
                }
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                {activeParameters.includes('windDirection') && (
                  <Icon
                    name={dark ? 'wind-dark' : 'wind-light'}
                    width={20}
                    height={20}
                    style={{
                      transform: [
                        {
                          rotate: `${direction}deg`,
                        },
                      ],
                    }}
                  />
                )}
                {activeParameters.includes('windSpeedMS') && (
                  <Text
                    style={[
                      styles.regularText,
                      styles.withMarginTop,
                      { color: colors.hourListText },
                    ]}>
                    {convertedWindSpeed}
                  </Text>
                )}
              </View>
            );
          }
          if (param === constants.TEMPERATURE) {
            const temperatureUnit = Config.get('settings').units.temperature;
            const convertedTemperature =
              data.temperature || data.temperature === 0
                ? toPrecision(
                    'temperature',
                    temperatureUnit,
                    converter(temperatureUnit, data.temperature)
                  )
                : '-';
            return (
              <View
                key={`${param}-${i}`}
                accessibilityLabel={t('forecast:params:temperature', {
                  value: convertedTemperature,
                  unit: t(
                    `forecast:${getForecastParameterUnitTranslationKey(
                      temperatureUnit
                    )}`
                  ),
                })}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  style={[styles.regularText, { color: colors.hourListText }]}>
                  {`${convertedTemperature}°`}
                </Text>
              </View>
            );
          }
          if (param === constants.FEELS_LIKE) {
            const temperatureUnit = Config.get('settings').units.temperature;
            const convertedFeelsLike =
              data.feelsLike || data.feelsLike === 0
                ? toPrecision(
                    'temperature',
                    temperatureUnit,
                    converter(temperatureUnit, data.feelsLike)
                  )
                : '-';
            return (
              <View
                key={`${param}-${i}`}
                accessibilityLabel={t('forecast:params:feelsLike', {
                  value: convertedFeelsLike,
                  unit: t(
                    `forecast:${getForecastParameterUnitTranslationKey(
                      temperatureUnit
                    )}`
                  ),
                })}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  style={[
                    styles.regularText,
                    { color: colors.hourListText },
                  ]}>{`${convertedFeelsLike}°`}</Text>
              </View>
            );
          }

          if (param === constants.DEW_POINT) {
            const temperatureUnit = Config.get('settings').units.temperature;
            const convertedDewPoint =
              data.dewPoint || data.dewPoint === 0
                ? toPrecision(
                    'temperature',
                    temperatureUnit,
                    converter(temperatureUnit, data.dewPoint)
                  )
                : '-';
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  accessibilityLabel={t('forecast:params:dewpoint', {
                    value: convertedDewPoint,
                    unit: t(
                      `forecast:${getForecastParameterUnitTranslationKey(
                        temperatureUnit
                      )}`
                    ),
                  })}
                  style={[
                    styles.regularText,
                    { color: colors.hourListText },
                  ]}>{`${convertedDewPoint}°`}</Text>
              </View>
            );
          }

          if (param === constants.PRESSURE) {
            const pressureUnit = Config.get('settings').units.pressure;
            const convertedPressure =
              data.pressure || data.pressure === 0
                ? toPrecision(
                    'pressure',
                    pressureUnit,
                    converter(pressureUnit, data.pressure)
                  )
                : '-';
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  accessibilityLabel={t('forecast:params:pressure', {
                    value: convertedPressure,
                    unit: t(
                      `forecast:${getForecastParameterUnitTranslationKey(
                        pressureUnit
                      )}`
                    ),
                  })}
                  style={[
                    styles.regularText,
                    { color: colors.hourListText },
                  ]}>{`${convertedPressure}`}</Text>
              </View>
            );
          }

          const toDisplay =
            data[String(param)] !== null && data[String(param)] !== undefined
              ? data[String(param)]
              : '-';

          const precipitationUnit = Config.get('settings').units.precipitation;
          const windSpeedUnit = Config.get('settings').units.wind;

          const precipitation1hValue =
            typeof toDisplay === 'number' &&
            `${converter(precipitationUnit, toDisplay).toFixed(1)}`.replace(
              '.',
              decimalSeparator
            );

          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text
                accessibilityLabel={t(`forecast:params:${param}`, {
                  value:
                    param === constants.PRECIPITATION_1H
                      ? precipitation1hValue ?? toDisplay
                      : toDisplay,
                  unit:
                    [constants.PRECIPITATION_1H, constants.WIND_GUST].includes(
                      param
                    ) &&
                    t(
                      `forecast:${getForecastParameterUnitTranslationKey(
                        param === constants.PRECIPITATION_1H
                          ? precipitationUnit
                          : windSpeedUnit
                      )}`
                    ),
                })}
                style={[styles.regularText, { color: colors.hourListText }]}>
                {param === constants.PRECIPITATION_1H &&
                precipitation1hValue &&
                toDisplay >= 0
                  ? precipitation1hValue
                  : toDisplay}
              </Text>
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  withMarginTop: {
    marginTop: 2,
  },
  hourText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  hourColumn: {
    width: 52,
    borderRightWidth: 1,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  dayChangeBorder: {
    borderLeftWidth: 1,
  },
  hourBlock: {
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  regularText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
});

export default memo(ForecastListColumn);
