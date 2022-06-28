import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';
import * as constants from '@store/forecast/constants';

import { isOdd } from '@utils/helpers';
import { DisplayParameters } from '@store/forecast/types';

type ForecastListHeaderColumnProps = {
  displayParams: [number, DisplayParameters][];
};

const ForecastListHeaderColumn: React.FC<ForecastListHeaderColumnProps> = ({
  displayParams,
}) => {
  const { colors } = useTheme() as CustomTheme;

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
        <Text style={[styles.hourBlockText, { color: colors.hourListText }]}>
          klo
        </Text>
      </View>
      {displayParams.map(([i, param], index) => {
        if (param === constants.WIND_SPEED_AND_DIRECTION) {
          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Icon name="wind" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                m/s
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
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Icon name="gust" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                m/s
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
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Icon name="precipitation" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                mm
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
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Icon name="precipitation" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
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
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
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
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                hPa
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
                { backgroundColor: isOdd(index) ? colors.listTint : undefined },
              ]}>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
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
  hourBlockText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
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
