import React, { memo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from '@components/common/Icon';

import { State } from '@store/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { CustomTheme } from '@utils/colors';
import * as constants from '@store/forecast/constants';

const mapStateToProps = (state: State) => ({
  displayParams: selectDisplayParams(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastListHeaderColumnProps = PropsFromRedux & {};

const ForecastListHeaderColumn: React.FC<ForecastListHeaderColumnProps> = ({
  displayParams,
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <View
      style={[
        styles.iconColumn,
        {
          borderColor: colors.border,
        },
      ]}>
      <View style={styles.hourBlock}>
        <Icon name="clock" color={colors.hourListText} />
      </View>
      {displayParams.map(([i, param]) => {
        if (param === constants.WIND_SPEED_AND_DIRECTION) {
          return (
            <View key={i} style={styles.windBlock}>
              <Icon name="wind" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                m/s
              </Text>
            </View>
          );
        }
        if (param === constants.WIND_GUST) {
          return (
            <View key={i} style={styles.windBlock}>
              <Icon name="gust" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                m/s
              </Text>
            </View>
          );
        }
        if (param === constants.PRECIPITATION_1H) {
          return (
            <View key={i} style={styles.windBlock}>
              <Icon name="precipitation" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                mm
              </Text>
            </View>
          );
        }

        if (param === constants.PRECIPITATION_PROBABILITY) {
          return (
            <View key={i} style={[styles.hourBlock, styles.row]}>
              <Icon name="precipitation" color={colors.hourListText} />
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                %
              </Text>
            </View>
          );
        }

        if (param === constants.RELATIVE_HUMIDITY) {
          return (
            <View key={i} style={styles.hourBlock}>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                RH%
              </Text>
            </View>
          );
        }

        if (param === constants.PRESSURE) {
          return (
            <View key={i} style={styles.hourBlock}>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                hPa
              </Text>
            </View>
          );
        }
        return (
          <View key={i} style={styles.hourBlock}>
            <Icon
              name={constants.PARAMS_TO_ICONS[param]}
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
  hourBlock: { height: 40, justifyContent: 'center', alignItems: 'center' },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  windBlock: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconColumn: {
    width: 48,
    borderWidth: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
});

export default memo(connector(ForecastListHeaderColumn));
