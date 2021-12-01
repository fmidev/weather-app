import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { TimeStepData } from '@store/observation/types';
import { GRAY_1_OPACITY, CustomTheme } from '@utils/colors';
import { capitalize } from '@utils/chart';
import { ChartType } from '../charts/types';

type ListProps = {
  data: TimeStepData[];
  parameter: ChartType;
};
const List: React.FC<ListProps> = ({ data, parameter }) => {
  const { t, i18n } = useTranslation('observation');
  const { colors } = useTheme() as CustomTheme;

  const locale = i18n.language;

  const getHeaderLabels = (param: string) => {
    let labels = [] as string[];
    switch (param) {
      case 'temperature':
        labels = [t('measurements.temperature'), t('measurements.dewPoint')];
        break;
      case 'precipitation':
        labels = [t('measurements.precipitation')];
        break;
      case 'wind':
        labels = [
          t('measurements.windSpeed'),
          t('measurements.windGust'),
          t('measurements.windDirection'),
        ];
        break;
      case 'pressure':
        labels = [t('measurements.pressure')];
        break;
      case 'humidity':
        labels = [t('measurements.humidity')];
        break;
      case 'visCloud':
        labels = [
          t('measurements.visibility'),
          t('measurements.totalCloudCover'),
        ];
        break;
      case 'cloud':
        labels = [t('measurements.cloudBase')];
        break;
      default:
        labels = [];
    }

    return (
      <View style={styles.row}>
        {labels.map((label) => (
          <Text
            key={label}
            style={[
              styles.rowItem,
              styles.listText,
              styles.bold,
              { color: colors.hourListText },
            ]}>
            {label}
          </Text>
        ))}
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
              { color: colors.hourListText },
            ]}>
            {moment(data[0].epochtime * 1000).format(`dddd D.M.`)}
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
        {getHeaderLabels(parameter)}
      </View>

      {data
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
                      {timeStep.temperature
                        ? `${timeStep.temperature.toFixed(1)} °C`
                        : '-'}
                    </Text>
                    <Text
                      style={[
                        styles.listText,
                        styles.rowItem,
                        { color: colors.hourListText },
                      ]}>
                      {timeStep.dewpoint
                        ? `${timeStep.dewpoint.toFixed(1)} °C`
                        : '-'}
                    </Text>
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
                      {timeStep.precipitation1h
                        ? `${timeStep.precipitation1h} mm`
                        : '-'}
                    </Text>
                  </View>
                )}
                {parameter === 'wind' && (
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.listText,
                        styles.rowItem,
                        { color: colors.hourListText },
                      ]}>
                      {timeStep.windspeedms
                        ? `${timeStep.windspeedms.toFixed(0)} m/s`
                        : '-'}
                    </Text>

                    <Text
                      style={[
                        styles.listText,
                        styles.rowItem,
                        { color: colors.hourListText },
                      ]}>
                      {timeStep.windgust
                        ? `${timeStep.windgust.toFixed(0)} m/s`
                        : '-'}
                    </Text>
                    <View style={styles.rowItem}>
                      {timeStep.winddirection ? (
                        <Icon
                          name="wind-arrow"
                          style={{
                            color: colors.hourListText,
                            transform: [
                              {
                                rotate: `${
                                  timeStep.winddirection + 45 - 180
                                }deg`,
                              },
                            ],
                          }}
                        />
                      ) : (
                        <Text style={[styles.listText, styles.rowItem]}>-</Text>
                      )}
                    </View>
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
                      {timeStep.pressure
                        ? `${timeStep.pressure.toFixed(0)} hPa`
                        : '-'}
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
                      {timeStep.humidity
                        ? `${timeStep.humidity.toFixed(0)} %`
                        : '-'}
                    </Text>
                  </View>
                )}
                {parameter === 'visCloud' && (
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.listText,
                        styles.rowItem,
                        { color: colors.hourListText },
                      ]}>
                      {timeStep.visibility
                        ? `${(timeStep.visibility! / 1000)?.toFixed(0)} km`
                        : '-'}
                    </Text>
                    <Text
                      style={[
                        styles.listText,
                        styles.rowItem,
                        { color: colors.hourListText },
                      ]}>
                      {timeStep.totalcloudcover
                        ? `${timeStep.totalcloudcover}/8`
                        : '-'}
                    </Text>
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
                      {timeStep.cloudheight
                        ? `${(timeStep.cloudheight! / 1000)?.toFixed(1)} km`
                        : '-'}
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
});

export default List;
