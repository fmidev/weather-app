import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { CustomTheme, GRAY_1_OPACITY_15, GRAY_4, WHITE } from '@utils/colors';
import { ObservationParameters, TimeStepData } from '@store/observation/types';
import { getObservationCellValue, getParameterUnit } from '@utils/helpers';

import { capitalize } from '@utils/chart';
import { Config } from '@config';

type LatestProps = {
  data: TimeStepData[];
};

const Latest: React.FC<LatestProps> = ({ data }) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('observation');
  const locale = i18n.language;
  const { parameters } = Config.get('weather').observation;

  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';

  const [latestObservation] = data || [];
  const latestObservationTime =
    latestObservation &&
    moment(latestObservation.epochtime * 1000)
      .locale(locale)
      .format(`${weekdayAbbreviationFormat} D.M. [${t('at')}] HH:mm`);

  const hoursSinceLatestObservation =
    latestObservation?.epochtime &&
    moment.duration(Date.now() - latestObservation.epochtime * 1000).asHours();

  const latestParameters: {
    [key in keyof Partial<ObservationParameters>]: {
      decimals: number;
      divider?: number;
      altParameter?: keyof ObservationParameters;
    };
  } = {
    temperature: {
      decimals: 1,
    },
    dewPoint: {
      decimals: 1,
    },
    precipitation1h: {
      decimals: 1,
      altParameter: 'ri_10min',
    },
    windSpeedMS: {
      decimals: 0,
    },
    windGust: {
      decimals: 0,
    },
    windDirection: {
      decimals: 0,
    },
    pressure: {
      decimals: 0,
    },
    humidity: {
      decimals: 0,
    },
    visibility: {
      decimals: 0,
      divider: 1000,
    },
    totalCloudCover: {
      decimals: 0,
    },
    snowDepth: {
      decimals: 0,
    },
  };

  const renderRow = () =>
    Object.entries(latestParameters).map(
      ([key, { decimals, divider, altParameter }]) => {
        const parameter = key as keyof ObservationParameters;
        if (
          !parameters?.includes(parameter) ||
          (altParameter &&
            !parameters?.includes(altParameter) &&
            !parameters?.includes(parameter))
        ) {
          return null;
        }

        const unit = getParameterUnit(parameter);
        let value = getObservationCellValue(
          latestObservation,
          altParameter && parameters?.includes(altParameter)
            ? altParameter
            : parameter,
          unit,
          decimals,
          divider || 1,
          true
        );

        if (parameter === 'totalCloudCover' && value !== '-') {
          value = `${t(
            `cloudcover.${value.toString()}`
          )} (${value.toString()}/8)`;
        } else if (parameter === 'windDirection' && value !== '-') {
          value = `${
            latestObservation.windCompass8
              ? t(`windDirection.${latestObservation.windCompass8}`)
              : '-'
          } (${value})`;
        }

        return (
          <View key={parameter} style={styles.observationRow} accessible>
            <View style={styles.flex}>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t(`measurements.${parameter}`)}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={[styles.panelValue, { color: colors.hourListText }]}>
                {value}
              </Text>
            </View>
          </View>
        );
      }
    );

  return (
    <>
      {hoursSinceLatestObservation > 2 && (
        <View style={[styles.tooOldView]}>
          <Text style={[styles.tooOldText, { color: dark ? WHITE : GRAY_4 }]}>
            {t('tooOld')}
          </Text>
        </View>
      )}
      {!!latestObservation && hoursSinceLatestObservation <= 2 && (
        <View>
          <View style={[styles.row]}>
            <View style={[styles.latestObservation]} accessible>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                {t('latestObservation')}
              </Text>
              <Text
                style={[
                  styles.bold,
                  styles.justifyStart,
                  { color: colors.hourListText },
                ]}>
                {latestObservationTime
                  ? capitalize(latestObservationTime)
                  : '-'}
              </Text>
            </View>
          </View>
          <View>{renderRow()}</View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  latestObservation: {
    flexDirection: 'column',
    height: 40,
    marginBottom: 16,
  },
  observationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  panelMeasurement: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
  },
  panelValue: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 8,
  },
  panelText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  tooOldText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  tooOldView: {
    backgroundColor: GRAY_1_OPACITY_15,
    padding: 14,
    marginTop: 8,
    marginHorizontal: -6,
  },
});
export default Latest;
