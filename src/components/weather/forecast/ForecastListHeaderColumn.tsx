import React, { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import { CustomTheme } from '@assets/colors';
import * as constants from '@store/forecast/constants';
import { isOdd } from '@utils/helpers';
import { DisplayParameters } from '@store/forecast/types';
import { Config } from '@config';
import { UnitMap } from '@store/settings/types';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

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
  const { fontScale } = useWindowDimensions();
  const { colors, dark } = useTheme() as CustomTheme;
  const defaultUnits = Config.get('settings').units;
  const { t } = useTranslation('unitAbbreviations');

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

  const height = Math.min(fontScale * 52, 78);
  const width = Math.min(fontScale * 52, 78);
  const modalWidth = Math.min(fontScale * 38, 64);

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      style={[
        modal ? styles.modalColumn : styles.iconColumn,
        {
          borderColor: colors.border,
          width: modal ? modalWidth : width,
        },
      ]}>
      <LinearGradient
        colors={ dark ? darkGradient : lightGradient }
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={[styles.gradient, { width: modal ? modalWidth : width }]}
      >
      <View style={[styles.hourBlock, { height }, modal !== true && { backgroundColor: colors.listTint }]}>
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
                    height,
                  },
                ]}>
                <Icon name="wind" color={colors.hourListText} />
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {t(units?.wind.unitAbb ?? defaultUnits.wind)}
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
                    height,
                  },
                ]}>
                <Icon name="gust" color={colors.hourListText} />
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {t(units?.wind.unitAbb ?? defaultUnits.wind)}
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
                    height,
                  },
                ]}>
                <Icon name="precipitation" color={colors.hourListText} />
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {t(units?.precipitation.unitAbb ?? defaultUnits.precipitation)}
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
                    height,
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
                    height,
                  },
                ]}>
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {t('RH%')}
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
                    height,
                  },
                ]}>
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {t(units?.pressure.unitAbb ?? defaultUnits.pressure)}
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
                    height,
                  },
                ]}>
                <Text
                  style={[styles.panelText, { color: colors.hourListText }]}>
                  {t('UV')}
                </Text>
              </View>
            );
          }

          return (
            <View
              key={`${param}-${i}`}
              style={[
                styles.hourBlock,
                {
                  backgroundColor: isOdd(index) && modal !== true ? colors.listTint : undefined,
                  height,
                },
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
