import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import {
  ObservationParameters,
  DailyObservationParameters,
  TimeStepData,
} from '@store/observation/types';
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
import DailyObservationRow from './DailyObservationRow';

type ListProps = {
  clockType: ClockType;
  data: TimeStepData[];
  parameter: ChartType;
  preferredDailyParameters: string[];
};

const EXCLUDED_HEADER_PARAMETERS = ['windDirection', 'minimumTemperature'];

const List: React.FC<ListProps> = ({
  clockType,
  data,
  parameter,
  preferredDailyParameters,
}) => {
  const { t, i18n } = useTranslation('observation');
  const { colors } = useTheme() as CustomTheme;
  const { parameters, dailyParameters } = Config.get('weather').observation;

  const isDaily =
    parameter === 'daily' || preferredDailyParameters.includes(parameter);
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';

  const listParameters: {
    [key in ChartType]: {
      parameters: (
        | keyof Partial<ObservationParameters>
        | keyof Partial<DailyObservationParameters>
      )[];
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
      parameters: preferredDailyParameters.includes('snowDepth')
        ? ['snowDepth06']
        : ['snowDepth'],
    },
    uv: {
      parameters: [],
    },
    weather: {
      parameters: ['temperature', 'dewPoint', 'precipitation1h'],
    },
    daily: {
      parameters: [
        'rrday',
        'maximumTemperature',
        'minimumTemperature',
        'minimumGroundTemperature06',
      ],
    },
  };

  const { wind: windSpeedUnit } = Config.get('settings').units;

  const activeParameters = listParameters[parameter].parameters.filter(
    (param) =>
      parameters?.includes(param as keyof ObservationParameters) ||
      dailyParameters?.includes(param as keyof DailyObservationParameters)
  );

  const getHeaderLabels = () => (
    <View style={styles.row}>
      {activeParameters.map((param) => {
        if (EXCLUDED_HEADER_PARAMETERS.includes(param)) {
          return null;
        }

        if (param === 'maximumTemperature') {
          return (
            <Text
              key={param}
              style={[
                styles.rowItem,
                styles.listText,
                styles.bold,
                { color: colors.hourListText },
              ]}>
              {`${t(`measurements.maxAndMinTemperatures`)} ${getParameterUnit(
                param
              )}`}
            </Text>
          );
        }

        return (
          <Text
            key={param}
            style={[
              styles.rowItem,
              styles.listText,
              styles.bold,
              { color: colors.hourListText },
            ]}>
            {`${t(`measurements.${param}`)} ${getParameterUnit(param)}`}
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
        false
      );

      const windGustObservationCellValue = getObservationCellValue(
        timeStep,
        'windGust',
        getParameterUnit('windGust'),
        undefined,
        undefined,
        false
      );

      return (
        <View style={styles.row}>
          <View style={[styles.windColumn]}>
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
            {activeParameters.includes('windDirection') &&
              typeof timeStep.windDirection !== 'number' && (
                <Text
                  style={[
                    styles.listText,
                    styles.rowItem,
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
                      : `${t('measurements.windDirection')} ${getWindDirection(
                          timeStep.windDirection
                        )} ${t('paramUnits.°')}.`
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
          </View>
          {activeParameters.includes('windGust') && (
            <Text
              style={[
                styles.listText,
                styles.rowItem,
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
      );
    }

    return (
      <View style={styles.row}>
        {activeParameters.map((param) => {
          if (param === 'minimumTemperature') return null;
          const parameterUnit = getParameterUnit(param);
          let cellValue = getObservationCellValue(
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
            undefined,
            decimalSeparator
          );

          if (param === 'maximumTemperature') {
            cellValue = `${getObservationCellValue(
              timeStep,
              'minimumTemperature',
              parameterUnit,
              1,
              0,
              undefined,
              decimalSeparator
            )} ... ${cellValue}`;
          }

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
                parameter === 'daily' &&
                  activeParameters.length > 1 &&
                  styles.centeredText,
                {
                  color: colors.hourListText,
                },
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
              .format(locale === 'en' ? `dddd D MMM` : `dddd D.M.`)}
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
        {!isDaily && (
          <Text
            style={[
              styles.rowItem,
              styles.listText,
              styles.bold,
              { color: colors.hourListText },
            ]}>
            {t('time')}
          </Text>
        )}
        {getHeaderLabels()}
      </View>

      {data &&
        data
          .filter((ob) => ob.epochtime % 3600 === 0)
          .flatMap((timeStep, i, arr) => {
            if (
              isDaily &&
              i > 0 &&
              moment(timeStep.epochtime * 1000).day() ===
                moment(arr[i - 1].epochtime * 1000).day()
            ) {
              return [];
            }

            const time = moment(timeStep.epochtime * 1000).locale(locale);
            const previousTime = moment(arr?.[i - 1]?.epochtime * 1000);

            const timeToDisplay = time.format(
              clockType === 12 ? 'h.mm a' : 'HH.mm'
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
                        locale === 'en' ? 'dddd D MMM' : `dddd D.M.`
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
                          !isDaily && i % 2 !== 0 ? GRAY_1_OPACITY : undefined,
                      },
                    ]}>
                    {!isDaily && (
                      <>
                        <Text
                          style={[
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
                      </>
                    )}
                    {isDaily && (
                      <DailyObservationRow
                        // @ts-ignore
                        parameter={parameter}
                        epochtime={timeStep.epochtime}
                        data={data}
                      />
                    )}
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
    fontFamily: 'Roboto-Medium',
  },
  currentDay: {
    paddingLeft: 8,
    fontSize: 16,
  },
  listText: {
    fontSize: 16,
  },
  marginBottom: {
    marginBottom: 20,
  },
  observationListContainer: {
    marginTop: 20,
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
  centeredText: {
    textAlign: 'center',
  },
});

export default List;
