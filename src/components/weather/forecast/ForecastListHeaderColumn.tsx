import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';
import * as constants from '@store/forecast/constants';

import { isOdd } from '@utils/helpers';
import { DisplayParameters } from '@store/forecast/types';
import { Config } from '@config';

type ForecastListHeaderColumnProps = {
  displayParams: [number, DisplayParameters][];
};

const ForecastListHeaderColumn: React.FC<ForecastListHeaderColumnProps> = ({
  displayParams,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { units } = Config.get('settings');

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      style={[
        styles.iconColumn,
        {
          borderColor: colors.border,
        },
      ]}>
      <View style={[styles.hourBlock, { backgroundColor: colors.listTint }]}>
        <Icon name="clock" color={colors.hourListText} />
      </View>
      {displayParams
        .filter((displayParam) => displayParam[1] !== constants.DAY_LENGTH)
        .map(([i, param], index) => {
          if (param === constants.WIND_SPEED_AND_DIRECTION) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="wind" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units.wind}
                </Text>
              </View>
            );
          }
          if (param === constants.WIND_GUST) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="gust" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units.wind}
                </Text>
              </View>
            );
          }
          if (param === constants.PRECIPITATION_1H) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="precipitation" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units.precipitation}
                </Text>
              </View>
            );
          }

          if (param === constants.PRECIPITATION_PROBABILITY) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  styles.row,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="precipitation" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  %
                </Text>
              </View>
            );
          }

          if (param === constants.RELATIVE_HUMIDITY) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  RH%
                </Text>
              </View>
            );
          }

          if (param === constants.PRESSURE) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units.pressure}
                </Text>
              </View>
            );
          }

          if (param === constants.UV_CUMULATED) {
            return (
              <View
                key={`${param}-${i}`}
                style={[
                  styles.hourBlock,
                  {
                    backgroundColor: isOdd(index) ? colors.listTint : undefined,
                  },
                ]}>
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  UV
                </Text>
              </View>
            );
          }

          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Icon
                name={constants.PARAMS_TO_ICONS[String(param)]}
                color={colors.hourListText}
              />
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  hourBlock: {
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  iconColumn: {
    width: 52,
    borderWidth: 1,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
});

export default memo(ForecastListHeaderColumn);
