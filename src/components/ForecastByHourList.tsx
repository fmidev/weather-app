import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';

import Icon from './Icon';

import { TimestepData } from '../store/forecast/types';

import { weatherSymbolGetter } from '../assets/images';
import { CustomTheme } from '../utils/colors';

type ForecastByHourListProps = {
  dayForecast: TimestepData[];
  isOpen: boolean;
};

const ForecastByHourList: React.FC<ForecastByHourListProps> = ({
  dayForecast,
  isOpen,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  console.log('ForecastByHourList rendering');
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
            Aurinko nousee{' '}
            <Text style={styles.bold}>{sunrise.format('HH:mm')}</Text> Laskee{' '}
            <Text style={styles.bold}>{sunset.format('HH:mm')}</Text>
          </Text>
          <Text style={[styles.panelText, { color: colors.text }]}>
            Päivän pituus <Text style={styles.bold}>{dayLength}</Text>
          </Text>
        </View>
      </View>
    );
  };

  const rowRenderer = (item: TimestepData) => {
    const dayStepMoment = moment.unix(item.epochtime);
    const dayTempPrefix = item.temperature > 0 && '+';
    const hourSmartSymbol = weatherSymbolGetter(
      item.smartSymbol.toString(),
      dark
    );

    return (
      <View
        key={item.epochtime}
        style={{
          backgroundColor: colors.background,
        }}>
        <View
          key={item.epochtime}
          style={[
            styles.row,
            styles.hourContainer,
            styles.alignStart,
            {
              borderBottomColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.timeContainer,
              {
                borderRightColor: colors.border,
              },
            ]}>
            <Text
              style={[
                styles.forecastText,
                styles.medium,
                { color: colors.primaryText },
              ]}>
              {dayStepMoment.format('HH:mm')}
            </Text>
          </View>
          <View style={[styles.row, styles.alignStart, styles.withPaddingLeft]}>
            <View style={styles.hourColumn}>
              <View style={[styles.row, styles.alignStart]}>
                <View style={styles.withMarginRight}>
                  {hourSmartSymbol?.({
                    width: 40,
                    height: 40,
                  })}
                </View>
                <Text
                  style={[
                    styles.hourTemperature,
                    { color: colors.primaryText },
                  ]}>{`${dayTempPrefix}${item.temperature}°`}</Text>
              </View>
              <View style={[styles.row, styles.alignStart]}>
                <View>
                  <Icon
                    name={dark ? 'rain-dark' : 'rain-light'}
                    width={24}
                    height={24}
                  />
                </View>
                <Text style={[styles.hourText, { color: colors.text }]}>
                  <Text style={styles.bold}>{item.pop}</Text> %{' '}
                  <Text style={styles.bold}>{item.precipitation1h}</Text> mm
                </Text>
              </View>
            </View>
            <View style={[styles.withPaddingLeft, styles.hourColumn]}>
              <View style={[styles.row, styles.alignStart]}>
                <View>
                  <Icon size={22} name="person" color={colors.text} />
                </View>
                <Text style={[styles.hourText, { color: colors.primaryText }]}>
                  Tuntuu{' '}
                  <Text
                    style={
                      styles.bold
                    }>{`${dayTempPrefix}${item.feelsLike}°`}</Text>
                </Text>
              </View>
              <View style={[styles.row, styles.alignStart]}>
                <View>
                  <Icon
                    name={dark ? 'wind-dark' : 'wind-light'}
                    width={24}
                    height={24}
                    style={{
                      transform: [
                        {
                          rotate: `${item.winddirection + 45 - 180}deg`,
                        },
                      ],
                    }}
                  />
                </View>
                <Text style={[styles.hourText, { color: colors.text }]}>
                  <Text style={styles.bold}>{item.windspeedms}</Text> m/s
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[!isOpen && styles.displayNone]}>
      <DayDurationRow />
      {dayForecast.map(rowRenderer)}
    </View>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
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
  withPaddingLeft: {
    paddingLeft: 8,
  },
  forecastHeader: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  hourContainer: {
    height: 80,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
  },
  forecastText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  hourTemperature: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
  },
  hourText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  hourColumn: {
    flex: 1,
  },
  timeContainer: {
    height: '100%',
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  displayNone: {
    display: 'none',
  },
});

export default memo(ForecastByHourList);
