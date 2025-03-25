import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from '@components/common/Icon';

import { CustomTheme } from '@assets/colors';
import * as constants from '@store/forecast/constants';

import { isOdd } from '@utils/helpers';
import { DisplayParameters } from '@store/forecast/types';
import { Config } from '@config';
import { UnitMap } from '@store/settings/types';
import LinearGradient from 'react-native-linear-gradient';

type ForecastListHeaderColumnProps = {
  displayParams: [number, DisplayParameters][];
  units?: UnitMap;
  modal?: boolean; // Different styling for modal
};

const ForecastListHeaderColumn: React.FC<ForecastListHeaderColumnProps> = ({
  displayParams,
  units,
  modal,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const defaultUnits = Config.get('settings').units;

  const lightGradient = [
    'rgba(238, 239, 241, 0.64)',
    'rgba(244, 245, 247, 0.48)',
    'rgba(255, 255, 255, 0.80)'
  ];

  const darkGradient = [
    'rgba(25, 25, 25, 0.64)',
    'rgba(32, 32, 32, 0.48)',
    'rgba(40, 40, 40, 0.80)'
  ];

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      style={[
        modal ? styles.modalColumn : styles.iconColumn,
        {
          borderColor: colors.border,
        },
      ]}>
      <LinearGradient
        colors={ dark ? darkGradient : lightGradient }
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}
      >
      <View style={[styles.hourBlock, modal !== true && { backgroundColor: colors.listTint }]}>
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
                    backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="wind" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units?.wind.unitAbb ?? defaultUnits.wind}
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
                    backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="gust" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units?.wind.unitAbb ?? defaultUnits.wind}
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
                    backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
                  },
                ]}>
                <Icon name="precipitation" color={colors.hourListText} />
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {units?.precipitation.unitAbb ?? defaultUnits.precipitation}
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
                    backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
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
                    backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
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
                  {units?.pressure.unitAbb ?? defaultUnits.pressure}
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
                    backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
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
                { backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined },
              ]}>
              <Icon
                name={constants.PARAMS_TO_ICONS[String(param)]}
                color={colors.hourListText}
              />
            </View>
          );
        })}
        </LinearGradient>
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
  modalColumn: {
    width: 38,
    borderWidth: 0,
    borderBottomWidth: 0,
    alignItems: 'center',
    marginRight: 4,
  },
  gradient: {
    flex: 1,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(ForecastListHeaderColumn);
