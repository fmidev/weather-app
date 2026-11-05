import React, { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import AccessibleView from '@components/common/AccessibleView';
import Text from '@components/common/AppText';
import Icon from '@assets/Icon';

import { DisplayParameters, TimeStepData } from '@store/forecast/types';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@assets/colors';
import * as constants from '@store/forecast/constants';
import { isOdd, getWindDirection } from '@utils/helpers';
import { formatAccessibleTemperature } from '@utils/accessibility';
import { roundToNearestTen } from '@utils/number';
import { Config } from '@config';
import {
  converter,
  getForecastParameterUnitTranslationKey,
  toPrecision,
} from '@utils/units';
import { ClockType, UnitMap } from '@store/settings/types';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';

type ForecastListColumnProps = {
  clockType: ClockType;
  data: TimeStepData;
  displayParams: [number, DisplayParameters][];
  units?: UnitMap;
  compact?: boolean;
};

const ForecastListColumn: React.FC<ForecastListColumnProps> = ({
  clockType,
  data,
  displayParams,
  units,
  compact,
}) => {
  const { fontScale } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const { colors, dark } = useTheme() as CustomTheme;
  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );
  const defaultUnits = Config.get('settings').units;

  const time = moment
    .unix(data.epochtime)
    .format(clockType === 12 ? 'h a' : 'HH');
  const SmartSymbol = weatherSymbolGetter(
    (data.smartSymbol || 0).toString(),
    dark
  );

  const height = Math.min(fontScale * 52, 78);
  const timeRowHeight = Math.min(fontScale * 52, 52);
  const width = Math.min(fontScale * 52, 62);
  const compactWidth = Math.min(fontScale * 48, 62);
  const windIconSize = Math.min(fontScale * 20, 30);
  const symbolSize = Math.min(fontScale * 40, 50);

  const rows = displayParams
    .filter(([, param]) => param !== constants.DAY_LENGTH)
    .map(([i, param]) => {
      const key = `${param}-${i}`;
      if (param === constants.SMART_SYMBOL) {
        return {
          key,
          label: t(`symbols:${data.smartSymbol}`),
          content: SmartSymbol ? (
            <SmartSymbol width={symbolSize} height={symbolSize} />
          ) : null,
        };
      }
      if (param === constants.WIND_SPEED_AND_DIRECTION) {
        const windSpeedUnit = units?.wind.unitAbb ?? defaultUnits.wind;
        const convertedWindSpeed =
          data.windSpeedMS || data.windSpeedMS === 0
            ? toPrecision(
                'wind',
                windSpeedUnit,
                converter(windSpeedUnit, data.windSpeedMS)
              )
            : '-';
        const windSpeedUnitTranslation = t(
          `forecast:${getForecastParameterUnitTranslationKey(windSpeedUnit)}`
        );
        return {
          key,
          label: [
            activeParameters.includes('windDirection') && data.windCompass8
              ? t(`observation:windDirection:${data.windCompass8}`)
              : '',
            activeParameters.includes('windSpeedMS')
              ? `${convertedWindSpeed} ${windSpeedUnitTranslation}`
              : '',
          ]
            .filter(Boolean)
            .join(' '),
          content: (
            <>
              {activeParameters.includes('windDirection') && (
                <Icon
                  name={dark ? 'wind-dark' : 'wind-light'}
                  width={windIconSize}
                  height={windIconSize}
                  style={{
                    transform: [
                      { rotate: `${getWindDirection(data.windDirection)}deg` },
                    ],
                  }}
                />
              )}
              {activeParameters.includes('windSpeedMS') && (
                <Text
                  accessible={false}
                  style={[
                    styles.regularText,
                    styles.withMarginTop,
                    { color: colors.hourListText },
                  ]}>
                  {convertedWindSpeed}
                </Text>
              )}
            </>
          ),
        };
      }
      if (
        param === constants.TEMPERATURE ||
        param === constants.FEELS_LIKE ||
        param === constants.DEW_POINT
      ) {
        const temperatureUnit =
          units?.temperature.unitAbb ?? defaultUnits.temperature;
        const value = data[param];
        const convertedTemperature =
          value || value === 0
            ? toPrecision(
                'temperature',
                temperatureUnit,
                converter(temperatureUnit, value)
              )
            : '-';
        const translationKey =
          param === constants.DEW_POINT ? 'dewpoint' : param;
        return {
          key,
          label: t(`forecast:params:${translationKey}`, {
            value: formatAccessibleTemperature(convertedTemperature, t),
            unit: t(
              `forecast:${getForecastParameterUnitTranslationKey(temperatureUnit)}`
            ),
          }),
          content: (
            <Text
              accessible={false}
              style={[styles.regularText, { color: colors.hourListText }]}>
              {`${convertedTemperature}°`}
            </Text>
          ),
        };
      }
      if (param === constants.PRECIPITATION_PROBABILITY) {
        let formattedValue = '-';
        if (data.pop !== null && data.pop !== undefined) {
          if (data.pop < 10) formattedValue = '<10';
          else if (data.pop > 90) formattedValue = '>90';
          else formattedValue = roundToNearestTen(data.pop).toString();
        }
        return {
          key,
          label:
            formattedValue === '-'
              ? t('forecast:popMissing')
              : t('forecast:params:pop', { value: formattedValue, unit: '%' }),
          content: (
            <Text
              accessible={false}
              style={[styles.regularText, { color: colors.hourListText }]}>
              {formattedValue}
            </Text>
          ),
        };
      }
      const precipitationUnit =
        units?.precipitation.unitAbb ?? defaultUnits.precipitation;
      const precipitationPrecision = units?.precipitation.unitPrecision ?? 1;
      const windSpeedUnit = units?.wind.unitAbb ?? defaultUnits.wind;
      const pressureUnit = units?.pressure.unitAbb ?? defaultUnits.pressure;
      if (param === constants.PRESSURE) {
        const convertedPressure =
          data.pressure || data.pressure === 0
            ? toPrecision(
                'pressure',
                pressureUnit,
                converter(pressureUnit, data.pressure)
              )
            : '-';
        return {
          key,
          label: t('forecast:params:pressure', {
            value: convertedPressure,
            unit: t(
              `forecast:${getForecastParameterUnitTranslationKey(pressureUnit)}`
            ),
          }),
          content: (
            <Text
              accessible={false}
              maxFontSizeMultiplier={1.5}
              style={[styles.regularText, { color: colors.hourListText }]}>
              {convertedPressure}
            </Text>
          ),
        };
      }
      const toDisplay =
        data[String(param)] !== null && data[String(param)] !== undefined
          ? data[String(param)]
          : '-';
      const precipitation1hValue =
        typeof toDisplay === 'number' &&
        `${converter(precipitationUnit, toDisplay).toFixed(
          precipitationPrecision
        )}`.replace('.', decimalSeparator);
      const windGustValue =
        typeof toDisplay === 'number' &&
        `${converter(windSpeedUnit, toDisplay).toFixed(0)}`;
      const values: { [key: string]: string | false } = {
        [constants.PRECIPITATION_1H]: precipitation1hValue,
        [constants.WIND_GUST]: windGustValue,
      };
      const value = values[param] || toDisplay;
      return {
        key,
        label: t(`forecast:params:${param}`, {
          value,
          unit:
            [constants.PRECIPITATION_1H, constants.WIND_GUST].includes(param) &&
            t(
              `forecast:${getForecastParameterUnitTranslationKey(
                param === constants.PRECIPITATION_1H
                  ? precipitationUnit
                  : windSpeedUnit
              )}`
            ),
        }),
        content: (
          <Text
            accessible={false}
            style={[styles.regularText, { color: colors.hourListText }]}>
            {value}
          </Text>
        ),
      };
    });
  const accessibilityLabel = [
    `${t('forecast:at')} ${time}`,
    ...rows.map(({ label }) => label.trim().replace(/\.$/, '')),
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <AccessibleView
      accessible
      focusable
      accessibilityRole="text"
      importantForAccessibility="yes"
      accessibilityLabel={accessibilityLabel}
      key={data.epochtime}
      style={[
        compact ? styles.compactHourColumn : styles.hourColumn,
        ...(!compact && (time === '00' || time === '12 am')
          ? [
              styles.dayChangeBorder,
              {
                borderLeftColor: colors.chartGridDay,
                borderColor: colors.border,
              },
            ]
          : [{ borderColor: colors.border }]),
        { width: compact ? compactWidth : width },
      ]}>
      <View
        accessible={false}
        focusable={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.columnContent}>
        <View
          testID="forecast-time-row"
          style={[
            styles.hourBlock,
            {
              height: timeRowHeight,
              backgroundColor: colors.listTint,
            },
          ]}>
          <Text
            accessible={false}
            style={[styles.hourText, { color: colors.hourListText }]}>
            {time}
          </Text>
        </View>
        {rows.map(({ key, content }, index) => (
          <View
            key={key}
            style={[
              styles.hourBlock,
              {
                backgroundColor: isOdd(index) ? colors.listTint : undefined,
                height,
              },
            ]}>
            {content}
          </View>
        ))}
      </View>
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  withMarginTop: {
    marginTop: 2,
  },
  hourText: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
  },
  hourColumn: {
    width: 52,
    borderRightWidth: 1,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  compactHourColumn: {
    width: 48,
    borderRightWidth: 0,
    borderTopWidth: 0,
    alignItems: 'center',
  },
  dayChangeBorder: {
    borderLeftWidth: 1,
  },
  columnContent: {
    width: '100%',
  },
  hourBlock: {
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  regularText: {
    fontFamily: REGULAR_FONT,
    fontSize: 16,
  },
});

export default memo(ForecastListColumn);
