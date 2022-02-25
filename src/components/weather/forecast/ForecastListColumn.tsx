import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';

import Icon from '@components/common/Icon';

import { TimeStepData } from '@store/forecast/types';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@utils/colors';
import * as constants from '@store/forecast/constants';

import { isOdd } from '@utils/helpers';
import { Config } from '@config';

type ForecastListColumnProps = {
  data: TimeStepData;
  displayParams: [number, string][];
};

const ForecastListColumn: React.FC<ForecastListColumnProps> = ({
  data,
  displayParams,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const time = moment.unix(data.epochtime).format('HH:mm');
  const tempPrefix = (data.temperature || 0) > 0 ? '+' : '';
  const feelsLikePrefix = (data.feelsLike || 0) > 0 ? '+' : '';
  const dewPointPrefix = (data.dewPoint || 0) > 0 ? '+' : '';
  const smartSymbol = weatherSymbolGetter(
    (data.smartSymbol || 0).toString(),
    dark
  );

  return (
    <View
      key={data.epochtime}
      style={[styles.hourColumn, { borderColor: colors.border }]}>
      <View style={[styles.hourBlock, { backgroundColor: colors.listTint }]}>
        <Text
          style={[
            styles.hourText,
            styles.medium,
            { color: colors.hourListText },
          ]}>
          {time}
        </Text>
      </View>
      {displayParams.map(([i, param], index) => {
        if (param === constants.SMART_SYMBOL) {
          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              {smartSymbol?.({
                width: 40,
                height: 40,
              })}
            </View>
          );
        }
        if (param === constants.WIND_SPEED_AND_DIRECTION) {
          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              {activeParameters.includes('windDirection') && (
                <Icon
                  name={dark ? 'wind-dark' : 'wind-light'}
                  width={20}
                  height={20}
                  style={{
                    transform: [
                      {
                        rotate: `${(data.windDirection || 0) + 45 - 180}deg`,
                      },
                    ],
                  }}
                />
              )}
              {activeParameters.includes('windSpeedMS') && (
                <Text
                  style={[
                    styles.hourText,
                    styles.withMarginTop,
                    { color: colors.hourListText },
                  ]}>
                  {data.windSpeedMS}
                </Text>
              )}
            </View>
          );
        }
        if (param === constants.TEMPERATURE) {
          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text
                style={[
                  styles.hourText,
                  { color: colors.hourListText },
                ]}>{`${tempPrefix}${data.temperature}°`}</Text>
            </View>
          );
        }
        if (param === constants.FEELS_LIKE) {
          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text
                style={[
                  styles.hourText,
                  { color: colors.hourListText },
                ]}>{`${feelsLikePrefix}${data.feelsLike}°`}</Text>
            </View>
          );
        }

        if (param === constants.DEW_POINT) {
          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text
                style={[
                  styles.hourText,
                  { color: colors.hourListText },
                ]}>{`${dewPointPrefix}${data.dewPoint}°`}</Text>
            </View>
          );
        }

        const toDisplay =
          data[param] !== null && data[param] !== undefined ? data[param] : '-';
        return (
          <View
            key={`${param}-${i}`}
            style={[
              styles.hourBlock,
              { backgroundColor: isOdd(index) ? colors.listTint : undefined },
            ]}>
            <Text style={[styles.hourText, { color: colors.hourListText }]}>
              {param === constants.PRECIPITATION_1H &&
              typeof toDisplay === 'number' &&
              toDisplay >= 0
                ? `${toDisplay.toFixed(1)}`.replace('.', ',')
                : toDisplay}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  withMarginTop: {
    marginTop: 2,
  },
  hourText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  hourColumn: {
    width: 52,
    borderRightWidth: 1,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  hourBlock: {
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(ForecastListColumn);
