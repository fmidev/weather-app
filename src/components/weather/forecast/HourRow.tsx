import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import Icon from '@components/common/Icon';
import { TimestepData } from '@store/forecast/types';
import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@utils/colors';
import { getPrecipitationColorOrTransparent } from '@utils/helpers';

type HourRowProps = {
  item: TimestepData;
};

const HourRow: React.FC<HourRowProps> = React.memo(({ item }) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');

  const dayStepMoment = moment.unix(item.epochtime);
  const dayTempPrefix = item.temperature > 0 && '+';
  const hourSmartSymbol = weatherSymbolGetter(
    item.smartSymbol.toString(),
    dark
  );

  return (
    <View
      // key={item.epochtime}
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
          <View style={styles.symbolColumn}>
            <View>
              {hourSmartSymbol?.({
                width: 40,
                height: 40,
              })}
            </View>
          </View>
          <View style={styles.hourColumn}>
            <View style={[styles.row, styles.alignStart]}>
              <View style={styles.withSmallMarginRight}>
                <Icon
                  name={dark ? 'temperature-dark' : 'temperature-light'}
                  width={16}
                  height={16}
                />
              </View>
              <Text
                style={[
                  styles.hourTemperature,
                  { color: colors.primaryText },
                ]}>{`${dayTempPrefix}${item.temperature}°`}</Text>
            </View>
            <View style={[styles.row, styles.alignStart]}>
              <View style={styles.withSmallMarginRight}>
                <Icon
                  name={dark ? 'wind-dark' : 'wind-light'}
                  width={18}
                  height={18}
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
          <View style={styles.feelsLikeColumn}>
            <View style={[styles.row, styles.alignStart]}>
              <View>
                <Icon size={18} name="person" color={colors.text} />
              </View>
              <Text style={[styles.hourText, { color: colors.primaryText }]}>
                {t('feelsLike')}{' '}
                <Text
                  style={
                    styles.bold
                  }>{`${dayTempPrefix}${item.feelsLike}°`}</Text>
              </Text>
            </View>

            <View style={[styles.row, styles.alignStart]}>
              <View style={styles.withSmallMarginRight}>
                <Icon
                  name={dark ? 'rain-dark' : 'rain-light'}
                  width={18}
                  height={18}
                />
              </View>
              <Text style={[styles.hourText, { color: colors.text }]}>
                <Text style={styles.bold}>{item.pop}</Text> %
              </Text>
              <View
                style={[
                  styles.precipitationColorDot,
                  {
                    backgroundColor: getPrecipitationColorOrTransparent(
                      item.precipitation1h
                    ),
                  },
                ]}
              />
              <Text style={[styles.hourText, { color: colors.text }]}>
                <Text style={styles.bold}>{item.precipitation1h}</Text> mm
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
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
  withSmallMarginRight: {
    marginRight: 4,
  },
  withPaddingLeft: {
    paddingLeft: 8,
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
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  hourText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  hourColumn: {
    flex: 2,
  },
  feelsLikeColumn: {
    flex: 3,
  },
  symbolColumn: {
    flex: 1,
  },
  timeContainer: {
    height: '100%',
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  precipitationColorDot: {
    height: 8,
    width: 8,
    borderRadius: 25,
    marginHorizontal: 4,
  },
});

export default HourRow;
