import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import Icon from '@components/common/Icon';
import { TimestepData } from '@store/forecast/types';
import { CustomTheme } from '@utils/colors';

import HourRow from './HourRow';

type ForecastByHourListProps = {
  dayForecast: TimestepData[] | false;
  isOpen: boolean;
};

const ForecastByHourList: React.FC<ForecastByHourListProps> = ({
  dayForecast,
  isOpen,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');

  if (!dayForecast || !isOpen) return null;

  const DayDurationRow = () => {
    const step = dayForecast[0];
    const sunrise = moment(step.sunrise);
    const sunset = moment(step.sunset);
    const dayDuration = moment.duration(sunset.diff(sunrise));

    const dayLength = moment
      .utc(dayDuration.asMilliseconds())
      .format('HH [h] mm [min]');

    return (
      <View
        style={[
          styles.row,
          styles.forecastHeader,
          styles.alignStart,
          { borderBottomColor: colors.border },
        ]}>
        <View style={styles.withMarginRight}>
          <Icon
            width={24}
            height={24}
            name="sunrise"
            style={[
              styles.withMarginRight,
              {
                color: colors.text,
              },
            ]}
          />
        </View>
        <View>
          <Text style={[styles.panelText, { color: colors.text }]}>
            {t('sunrise')}{' '}
            <Text style={styles.bold}>{sunrise.format('HH:mm')}</Text>{' '}
            {t('sunset')}{' '}
            <Text style={styles.bold}>{sunset.format('HH:mm')}</Text>
          </Text>
          <Text style={[styles.panelText, { color: colors.text }]}>
            {t('dayLength')} <Text style={styles.bold}>{dayLength}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      {dayForecast.map((item) => (
        <HourRow item={item} />
      ))}
      <DayDurationRow />
    </View>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  alignStart: {
    justifyContent: 'flex-start',
  },
  withMarginRight: {
    marginRight: 9,
  },
  forecastHeader: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
});

export default memo(ForecastByHourList);
