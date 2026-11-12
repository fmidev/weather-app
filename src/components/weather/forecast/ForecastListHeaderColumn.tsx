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
import { useTranslation } from 'react-i18next';
import { MEDIUM_FONT } from '@assets/constants';

type ForecastListHeaderColumnProps = {
  displayParams: [number, DisplayParameters][];
  units?: UnitMap;
  compact?: boolean;
};

const ForecastListHeaderColumn: React.FC<ForecastListHeaderColumnProps> = ({
  displayParams,
  units,
  compact,
}) => {
  const { fontScale } = useWindowDimensions();
  const { colors } = useTheme() as CustomTheme;
  const defaultUnits = Config.get('settings').units;
  const { t } = useTranslation('unitAbbreviations');

  const height = Math.min(fontScale * 52, 78);
  const timeRowHeight = Math.min(fontScale * 52, 52);
  const width = Math.min(fontScale * 52, 78);
  const compactWidth = Math.min(fontScale * 38, 64);

  return (
    <View
      testID="forecast-header-column"
      accessible={false}
      accessibilityElementsHidden
      style={[
        compact ? styles.compactColumn : styles.iconColumn,
        {
          borderColor: colors.border,
          backgroundColor: colors.dayForecastBackground,
          width: compact ? compactWidth : width,
        },
      ]}>
      <View
        style={[styles.columnContent, { width: compact ? compactWidth : width }]}>
        <View
          testID="forecast-header-time-row"
          style={[
            styles.hourBlock,
            { height: timeRowHeight },
            !compact && { backgroundColor: colors.listTint },
          ]}>
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
                      backgroundColor:
                        isOdd(index) && !compact ? colors.listTint : undefined,
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
                      backgroundColor:
                        isOdd(index) && !compact ? colors.listTint : undefined,
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
                      backgroundColor:
                        isOdd(index) && !compact ? colors.listTint : undefined,
                      height,
                    },
                  ]}>
                  <Icon name="precipitation" color={colors.hourListText} />
                  <Text
                    maxFontSizeMultiplier={1.5}
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    {t(
                      units?.precipitation.unitAbb ?? defaultUnits.precipitation
                    )}
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
                      backgroundColor:
                        isOdd(index) && !compact ? colors.listTint : undefined,
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

            if (
              param === constants.RELATIVE_HUMIDITY ||
              param === constants.HUMIDITY
            ) {
              return (
                <View
                  key={`${param}-${i}`}
                  style={[
                    styles.hourBlock,
                    {
                      backgroundColor:
                        isOdd(index) && !compact ? colors.listTint : undefined,
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
                      backgroundColor: isOdd(index)
                        ? colors.listTint
                        : undefined,
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
                      backgroundColor:
                        isOdd(index) && !compact ? colors.listTint : undefined,
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
                    backgroundColor:
                      isOdd(index) && !compact ? colors.listTint : undefined,
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
      </View>
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
    fontFamily: MEDIUM_FONT,
  },
  iconColumn: {
    width: 52,
    borderWidth: 1,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  compactColumn: {
    width: 38,
    borderWidth: 0,
    borderBottomWidth: 0,
    alignItems: 'center',
    marginRight: 4,
  },
  columnContent: {
    flex: 1,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(ForecastListHeaderColumn);
