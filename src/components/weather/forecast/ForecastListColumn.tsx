import React, { memo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';

import Icon from '@components/common/Icon';

import { State } from '@store/types';
import { TimestepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@utils/colors';
import * as constants from '@store/forecast/constants';

const mapStateToProps = (state: State) => ({
  displayParams: selectDisplayParams(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastListColumnProps = PropsFromRedux & {
  data: TimestepData;
};

const ForecastListColumn: React.FC<ForecastListColumnProps> = ({
  data,
  displayParams,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;

  const time = moment.unix(data.epochtime).format('HH:mm');
  const tempPrefix = data.temperature > 0 ? '+' : '';
  const feelsLikePrefix = data.feelsLike > 0 ? '+' : '';
  const smartSymbol = weatherSymbolGetter(data.smartSymbol.toString(), dark);

  return (
    <View style={[styles.hourColumn, { borderColor: colors.border }]}>
      <View style={styles.hourBlock}>
        <Text
          style={[
            styles.panelText,
            styles.medium,
            { color: colors.hourListText },
          ]}>
          {time}
        </Text>
      </View>
      {displayParams.map(([i, param]) => {
        if (param === constants.SMART_SYMBOL) {
          return (
            <View key={i}>
              {smartSymbol?.({
                width: 40,
                height: 40,
              })}
            </View>
          );
        }
        if (param === constants.WIND_SPEED_AND_DIRECTION) {
          return (
            <View key={i} style={styles.windBlock}>
              <Icon
                name={dark ? 'wind-dark' : 'wind-light'}
                width={20}
                height={20}
                style={{
                  transform: [
                    {
                      rotate: `${data.winddirection + 45 - 180}deg`,
                    },
                  ],
                }}
              />
              <Text
                style={[
                  styles.hourText,
                  styles.withMarginTop,
                  { color: colors.hourListText },
                ]}>
                {data.windspeedms}
              </Text>
            </View>
          );
        }
        if (param === constants.TEMPERATURE) {
          return (
            <View key={i} style={styles.hourBlock}>
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
            <View key={i} style={styles.hourBlock}>
              <Text
                style={[
                  styles.hourText,
                  { color: colors.hourListText },
                ]}>{`${feelsLikePrefix}${data.feelsLike}°`}</Text>
            </View>
          );
        }

        const toDisplay =
          data[param] !== null && data[param] !== undefined ? data[param] : '-';
        return (
          <View
            key={i}
            style={
              param === constants.PRECIPITATION_1H ||
              param === constants.WIND_GUST
                ? styles.windBlock
                : styles.hourBlock
            }>
            <Text style={[styles.hourText, { color: colors.hourListText }]}>
              {param === constants.PRECIPITATION_1H &&
              toDisplay >= 0 &&
              typeof toDisplay === 'number'
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
  panelText: {
    fontSize: 14,
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
    width: 48,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  hourBlock: { height: 40, justifyContent: 'center', alignItems: 'center' },
  windBlock: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(connector(ForecastListColumn));
