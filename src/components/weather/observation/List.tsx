import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { ObservationParameters, TimeStepData } from '@store/observation/types';
import { GRAY_1_OPACITY, CustomTheme } from '@utils/colors';
import { capitalize } from '@utils/chart';
import {
  getObservationCellValue,
  getParameterUnit,
  getWindDirection,
} from '@utils/helpers';
import { Config } from '@config';
import { ClockType } from '@store/settings/types';
import { getForecastParameterUnitTranslationKey } from '@utils/units';
import { ChartType } from '../charts/types';

type ListProps = {
  clockType: ClockType;
  data: TimeStepData[];
  parameter: ChartType;
};

const List: React.FC<ListProps> = ({ clockType, data, parameter }) => {
  const { t, i18n } = useTranslation('observation');
  const { colors } = useTheme() as CustomTheme;
  const { parameters } = Config.get('weather').observation;

  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';

  const listParameters: {
    [key in ChartType]: {
      parameters: (keyof Partial<ObservationParameters>)[];
    };
  } = {
    temperature: {
      parameters: ['temperature', 'dewPoint'],
    },
    precipitation: {
      parameters: ['precipitation1h'],
    },
    wind: {
      parameters: ['windSpeedMS', 'windGust', 'windDirection'],
    },
    pressure: {
      parameters: ['pressure'],
    },
    humidity: {
      parameters: ['humidity'],
    },
    visCloud: {
      parameters: ['visibility', 'totalCloudCover'],
    },
    cloud: {
      parameters: ['cloudHeight'],
    },
    snowDepth: {
      parameters: ['snowDepth'],
    },
    uv: {
      parameters: [],
    },
  };

  const { wind: windSpeedUnit } = Config.get('settings').units;

  const activeParameters = listParameters[parameter].parameters.filter(
    (param) => parameters?.includes(param)
  );

  const getHeaderLabels = () => (
    <View style={styles.row}>
      {activeParameters.map((param) => {
        if (param === 'windDirection') {
          return null;
        }
        return (
          <Text
            key={param}
            style={[
              styles.rowItem,
              styles.listText,
              styles.bold,
              ['pressure', 'humidity', 'cloudHeight', 'snow'].includes(param)
                ? styles.singleParameter
                : styles.centerAlign,
              { color: colors.hourListText },
            ]}>
            {`${t(`measurements.${param}`)}`}
          </Text>
        );
      })}
    </View>
  );

  const getRowValues = (timeStep: TimeStepData) => {
    if (parameter === 'wind') {
      const windSpeedObservationCellValue = getObservationCellValue(
        timeStep,
        'windSpeedMS',
        getParameterUnit('windSpeedMS'),
        undefined,
        undefined,
        true
      );

      const windGustObservationCellValue = getObservationCellValue(
        timeStep,
        'windGust',
        getParameterUnit('windGust'),
        undefined,
        undefined,
        true
      );

      return (
        <View style={styles.row}>
          <View style={[styles.rowItem]}>
            <View style={[styles.windColumn, styles.centerAlign]}>
              {activeParameters.includes('windDirection') &&
                typeof timeStep.windDirection !== 'number' && (
                  <Text
                    style={[
                      styles.listText,
                      styles.wdPadding,
                      { color: colors.hourListText },
                    ]}>
                    -
                  </Text>
                )}
              {activeParameters.includes('windDirection') &&
                typeof timeStep.windDirection === 'number' && (
                  <Icon
                    accessibilityLabel={
                      timeStep.windCompass8
                        ? `${t(`windDirection.${timeStep.windCompass8}`)}.`
                        : `${t(
                            'measurements.windDirection'
                          )} ${getWindDirection(timeStep.windDirection)} ${t(
                            'paramUnits.°'
                          )}.`
                    }
                    name="wind-arrow"
                    style={[
                      styles.wdPadding,
                      {
                        color: colors.hourListText,
                        transform: [
                          {
                            rotate: `${getWindDirection(
                              timeStep.windDirection
                            )}deg`,
                          },
                        ],
                      },
                    ]}
                  />
                )}
              {activeParameters.includes('windSpeedMS') && (
                <Text
                  style={[
                    styles.listText,
                    styles.windText,
                    { color: colors.hourListText },
                  ]}
                  accessibilityLabel={`${t(
                    'measurements.windSpeedMS'
                  )} ${windSpeedObservationCellValue}
                               ${t(
                                 `forecast:${getForecastParameterUnitTranslationKey(
                                   windSpeedUnit
                                 )}`
                               )}`}>
                  {windSpeedObservationCellValue}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.windColumn]}>
            {activeParameters.includes('windGust') && (
              <Text
                style={[
                  styles.listText,
                  styles.rowItem,
                  styles.centerAlign,
                  { color: colors.hourListText },
                ]}
                accessibilityLabel={`${t(
                  'measurements.windGust'
                )} ${windGustObservationCellValue} ${t(
                  `paramUnits.${getParameterUnit('windGust')}`
                )}`}>
                {windGustObservationCellValue}
              </Text>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {activeParameters.map((param) => {
          const parameterUnit = getParameterUnit(param);
          const cellValue = getObservationCellValue(
            timeStep,
            param,
            parameterUnit,
            [
              'pressure',
              'humidity',
              'visibility',
              'snow',
              'totalCloudCover',
            ].includes(param)
              ? 0
              : 1,
            ['visibility', 'cloudHeight'].includes(param) ? 1000 : 0,
            true,
            decimalSeparator
          );

          const accessibilityLabel =
            param === 'totalCloudCover'
              ? `${t(`measurements.${param}`)}: ${
                  timeStep.totalCloudCover !== null &&
                  timeStep.totalCloudCover !== undefined
                    ? t(`cloudcover.${timeStep.totalCloudCover}`)
                    : t('paramUnits.na')
                }`
              : `${t(`measurements.${param}`)}: ${cellValue.replace(
                  ',',
                  '.'
                )} ${
                  cellValue === '-'
                    ? t('paramUnits.na')
                    : t(`paramUnits.${parameterUnit}`)
                }`;
          return (
            <Text
              key={`${param}-${timeStep.epochtime}`}
              style={[
                styles.listText,
                styles.rowItem,
                ['pressure', 'humidity', 'cloudHeight', 'snow'].includes(param)
                  ? styles.singleParameter
                  : styles.centerAlign,
                { color: colors.hourListText },
              ]}
              accessibilityLabel={accessibilityLabel}>
              {param === 'totalCloudCover'
                ? `${cellValue === '-' ? cellValue : `${cellValue}/8`}`
                : cellValue}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.observationListContainer}>
      <View>
        {data && data.length > 0 && (
          <Text
            style={[
              styles.currentDay,
              styles.bold,
              styles.marginBottom,
              styles.capitalize,
              { color: colors.hourListText },
            ]}>
            {moment(data[0].epochtime * 1000)
              .locale(locale)
              .format(locale === 'en' ? `dddd D MMMM` : `dddd D.M.`)}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.row,
          styles.observationRow,
          styles.headerRow,
          {
            borderBottomColor: colors.border,
          },
        ]}>
        <Text
          style={[
            styles.timeCol,
            styles.rowItem,
            styles.listText,
            styles.bold,
            { color: colors.hourListText },
          ]}>
          {t('time')}
        </Text>
        {getHeaderLabels()}
      </View>

      {data &&
        data
          .filter((ob) => ob.epochtime % 3600 === 0)
          .map((timeStep, i, arr) => {
            const time = moment(timeStep.epochtime * 1000).locale(locale);
            const previousTime = moment(arr?.[i - 1]?.epochtime * 1000);
            const timeToDisplay = time.format(
              clockType === 12 ? 'h.mm a' : 'HH:mm'
            );

            return (
              <View key={timeStep.epochtime}>
                {i > 0 && time.day() !== previousTime.day() && (
                  <View
                    style={[
                      styles.row,
                      styles.observationRow,
                      { backgroundColor: colors.timeStepBackground },
                    ]}>
                    <Text
                      style={[
                        styles.listText,
                        styles.rowItem,
                        styles.bold,
                        styles.capitalize,
                        { color: colors.hourListText },
                      ]}>
                      {time.format(
                        locale === 'en' ? 'dddd D MMMM' : `dddd D.M.`
                      )}
                    </Text>
                  </View>
                )}
                <View style={[styles.row]} accessible>
                  <View
                    style={[
                      styles.row,
                      styles.observationRow,
                      {
                        backgroundColor:
                          i % 2 !== 0 ? GRAY_1_OPACITY : undefined,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.timeCol,
                        styles.rowItem,
                        styles.listText,
                        styles.bold,
                        { color: colors.hourListText },
                      ]}
                      accessibilityLabel={`${t(
                        'forecast:at'
                      )} ${timeToDisplay}`}>
                      {capitalize(timeToDisplay)}
                    </Text>
                    {getRowValues(timeStep)}
                  </View>
                </View>
              </View>
            );
          })}
    </View>
  );
};
const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Roboto-Regular',
  },
  timeCol: {
    maxWidth: 80,
  },
  currentDay: {
    paddingLeft: 8,
    fontSize: 16,
  },
  listText: {
    fontSize: 16,
    fontFamily: 'Roboto-Light',
  },
  marginBottom: {
    marginBottom: 20,
  },
  observationListContainer: {
    marginTop: 20,
  },
  singleParameter: {
    maxWidth: 150,
    textAlign: 'center',
  },
  centerAlign: {
    textAlign: 'center',
  },
  rowItem: {
    flex: 1,
    flexWrap: 'wrap',
  },
  headerRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  row: {
    flex: 2,
    flexDirection: 'row',
  },
  windColumn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  windText: {
    minWidth: 30,
  },
  wdPadding: {
    paddingLeft: 5,
  },
  observationRow: {
    padding: 8,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
});

export default List;
