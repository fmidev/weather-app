import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { CustomTheme } from '@utils/colors';
import { ObservationParameters, TimeStepData } from '@store/observation/types';
import { getObservationCellValue, getParameterUnit } from '@utils/helpers';

import { capitalize } from '@utils/chart';
import { Config } from '@config';
import { selectClockType, selectUnits } from '@store/settings/selectors';
import { State } from '@store/types';
import { connect, ConnectedProps } from 'react-redux';
import InfoMessage from '../InfoMessage';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type LatestProps = PropsFromRedux & {
  data: TimeStepData[];
  dailyData: TimeStepData[];
};

const Latest: React.FC<LatestProps> = ({
  clockType,
  data,
  dailyData,
  units,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('observation');
  const locale = i18n.language;
  const { parameters } = Config.get('weather').observation;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  const dateFormat =
    clockType === 12
      ? `${locale === 'en' ? 'D MMM' : 'D.M.'} [${t('at')}] h.mm a`
      : `D.M. [${t('at')}] HH.mm`;

  const [latestObservation] = data || [];
  const latestObservationTime =
    latestObservation &&
    moment(latestObservation.epochtime * 1000)
      .locale(locale)
      .format(`${weekdayAbbreviationFormat} ${dateFormat}`);

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

        const unit = getParameterUnit(parameter, units);
        let value = getObservationCellValue(
          latestObservation,
          altParameter && parameters?.includes(altParameter)
            ? altParameter
            : parameter,
          unit,
          decimals,
          divider || 1,
          false,
          decimalSeparator
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

        if (value === '-') return null;

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
              <Text
                style={[styles.panelValue, { color: colors.hourListText }]}
                accessibilityLabel={`${value} ${
                  unit ? t(`paramUnits.${unit}`) : ''
                }`}>
                {value} {unit}
              </Text>
            </View>
          </View>
        );
      }
    );

  return (
    <>
      {hoursSinceLatestObservation > 2 && dailyData.length === 0 && (
        <InfoMessage translationKey="tooOld" />
      )}
      {data.length <= 2 && dailyData.length > 0 && (
        <InfoMessage translationKey="onlyDailyValues" />
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
});
export default connector(Latest);
