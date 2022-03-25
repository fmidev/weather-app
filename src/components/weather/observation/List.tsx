import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { ObservationParameters, TimeStepData } from '@store/observation/types';
import { GRAY_1_OPACITY, CustomTheme } from '@utils/colors';
import { capitalize } from '@utils/chart';
import { getObservationCellValue } from '@utils/helpers';
import { Config } from '@config';
import { ChartType } from '../charts/types';

type ListProps = {
  data: TimeStepData[];
  parameter: ChartType;
};

const List: React.FC<ListProps> = ({ data, parameter }) => {
  const { t, i18n } = useTranslation('observation');
  const { colors } = useTheme() as CustomTheme;
  const { parameters } = Config.get('weather').observation;

  const locale = i18n.language;

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

  const activeParameters = listParameters[parameter].parameters.filter(
    (param) => parameters?.includes(param)
  );

  const getHeaderLabels = () => (
    <View style={styles.row}>
      {activeParameters.map((param) => (
        <Text
          key={param}
          style={[
            styles.rowItem,
            styles.listText,
            styles.bold,
            { color: colors.hourListText },
          ]}>
          {t(`measurements.${param}`)}
        </Text>
      ))}
    </View>
  );

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
              .format(`dddd D.M.`)}
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
          .map((timeStep, i) => {
            const time = moment(timeStep.epochtime * 1000).locale(locale);
            const timeToDisplay =
              time.hour() === 0
                ? time.format(`dd DD.MM. [${t('forecast:at')}] HH:mm`)
                : time.format(`[${t('forecast:at')}] HH:mm`);

            return (
              <View key={timeStep.epochtime} style={[styles.row]}>
                <View
                  style={[
                    styles.row,
                    styles.observationRow,
                    {
                      backgroundColor: i % 2 !== 0 ? GRAY_1_OPACITY : undefined,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.rowItem,
                      styles.listText,
                      styles.bold,
                      { color: colors.hourListText },
                    ]}>
                    {capitalize(timeToDisplay)}
                  </Text>
                  {parameter === 'temperature' && (
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.listText,
                          styles.rowItem,
                          { color: colors.hourListText },
                        ]}>
                        {getObservationCellValue(
                          timeStep,
                          'temperature',
                          '°C',
                          1
                        )}
                      </Text>
                      {activeParameters.includes('dewPoint') && (
                        <Text
                          style={[
                            styles.listText,
                            styles.rowItem,
                            { color: colors.hourListText },
                          ]}>
                          {getObservationCellValue(
                            timeStep,
                            'dewPoint',
                            '°C',
                            1
                          )}
                        </Text>
                      )}
                    </View>
                  )}
                  {parameter === 'precipitation' && (
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.listText,
                          styles.rowItem,
                          { color: colors.hourListText },
                        ]}>
                        {getObservationCellValue(
                          timeStep,
                          'precipitation1h',
                          'mm',
                          1
                        )}
                      </Text>
                    </View>
                  )}
                  {parameter === 'wind' && (
                    <View style={styles.row}>
                      {activeParameters.includes('windSpeedMS') && (
                        <Text
                          style={[
                            styles.listText,
                            styles.rowItem,
                            { color: colors.hourListText },
                          ]}>
                          {getObservationCellValue(
                            timeStep,
                            'windSpeedMS',
                            'm/s'
                          )}
                        </Text>
                      )}
                      {activeParameters.includes('windGust') && (
                        <Text
                          style={[
                            styles.listText,
                            styles.rowItem,
                            { color: colors.hourListText },
                          ]}>
                          {getObservationCellValue(timeStep, 'windGust', 'm/s')}
                        </Text>
                      )}
                      {activeParameters.includes('windDirection') && (
                        <View style={styles.rowItem}>
                          {timeStep.windDirection ? (
                            <Icon
                              name="wind-arrow"
                              style={{
                                color: colors.hourListText,
                                transform: [
                                  {
                                    rotate: `${
                                      timeStep.windDirection + 45 - 180
                                    }deg`,
                                  },
                                ],
                              }}
                            />
                          ) : (
                            <Text style={[styles.listText, styles.rowItem]}>
                              -
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  {parameter === 'pressure' && (
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.listText,
                          styles.rowItem,
                          { color: colors.hourListText },
                        ]}>
                        {getObservationCellValue(timeStep, 'pressure', 'hPa')}
                      </Text>
                    </View>
                  )}
                  {parameter === 'humidity' && (
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.listText,
                          styles.rowItem,
                          { color: colors.hourListText },
                        ]}>
                        {getObservationCellValue(timeStep, 'humidity', '%')}
                      </Text>
                    </View>
                  )}
                  {parameter === 'visCloud' && (
                    <View style={styles.row}>
                      {activeParameters.includes('visibility') && (
                        <Text
                          style={[
                            styles.listText,
                            styles.rowItem,
                            { color: colors.hourListText },
                          ]}>
                          {getObservationCellValue(
                            timeStep,
                            'visibility',
                            'km',
                            0,
                            1000
                          )}
                        </Text>
                      )}
                      {activeParameters.includes('totalCloudCover') && (
                        <Text
                          style={[
                            styles.listText,
                            styles.rowItem,
                            { color: colors.hourListText },
                          ]}>
                          {timeStep.totalCloudCover !== undefined &&
                          timeStep.totalCloudCover !== null
                            ? `${timeStep.totalCloudCover}/8`
                            : '-'}
                        </Text>
                      )}
                    </View>
                  )}
                  {parameter === 'cloud' && (
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.listText,
                          styles.rowItem,
                          { color: colors.hourListText },
                        ]}>
                        {getObservationCellValue(
                          timeStep,
                          'cloudHeight',
                          'km',
                          1,
                          1000
                        )}
                      </Text>
                    </View>
                  )}
                  {parameter === 'snowDepth' && (
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.listText,
                          styles.rowItem,
                          { color: colors.hourListText },
                        ]}>
                        {getObservationCellValue(timeStep, 'snowDepth', 'cm')}
                      </Text>
                    </View>
                  )}
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
    fontSize: 14,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  observationRow: {
    padding: 8,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
});

export default List;
