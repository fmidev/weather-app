import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  CustomTheme,
  RAIN_1,
  RAIN_2,
  RAIN_3,
  RAIN_4,
  RAIN_5,
  RAIN_6,
  RAIN_7,
  TRANSPARENT,
} from '@utils/colors';

import Icon from '@components/common/Icon';
import { ChartType } from './types';

type ChartLegendProps = {
  chartType: ChartType;
  observation: boolean | undefined;
};

const ChartLegend: React.FC<ChartLegendProps> = ({
  chartType,
  observation,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  const Line = () => (
    <View
      style={[
        styles.legendLine,
        {
          backgroundColor: colors.primaryText,
        },
      ]}
    />
  );

  const DashLine = () => (
    <View style={styles.legendRowNoMargin}>
      <View
        style={[
          styles.legendLineBlock,
          styles.withMarginRight,
          { backgroundColor: colors.chartSecondaryLine },
        ]}
      />
      <View
        style={[
          styles.legendLineBlock,
          styles.withMarginRight,
          { backgroundColor: colors.chartSecondaryLine },
        ]}
      />
      <View
        style={[
          styles.legendLineBlock,
          { backgroundColor: colors.chartSecondaryLine },
        ]}
      />
    </View>
  );

  const Bar = ({ color }: { color: string }) => (
    <View
      style={[
        styles.legendBlock,
        {
          backgroundColor: color,
        },
      ]}
    />
  );

  const Arrow = () => (
    <Icon
      name="wind-arrow"
      width={20}
      height={20}
      style={[
        styles.iconMargin,
        {
          color: colors.primaryText,
        },
      ]}
    />
  );

  return (
    <View style={styles.legendContainer}>
      {chartType === 'temperature' && (
        <>
          <View style={styles.legendRow}>
            <Line />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:temperature')} (°C)
            </Text>
          </View>
          <View style={styles.legendRow}>
            <DashLine />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t(`weather:charts:${observation ? 'dewpoint' : 'feelsLike'}`)}{' '}
              (°C)
            </Text>
          </View>
        </>
      )}
      {chartType === 'precipitation' && (
        <>
          <View style={styles.legendRow}>
            <Bar color={RAIN_1} />
            <Bar color={RAIN_2} />
            <Bar color={TRANSPARENT} />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:precipitationLight')}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Bar color={RAIN_3} />
            <Bar color={RAIN_4} />
            <Bar color={RAIN_5} />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:precipitationModerate')}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Bar color={RAIN_6} />
            <Bar color={RAIN_7} />
            <Bar color={TRANSPARENT} />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:precipitationHeavy')}
            </Text>
          </View>
        </>
      )}
      {chartType === 'wind' && (
        <>
          <View style={styles.legendRow}>
            <Line />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:windSpeed')} (m/s)
            </Text>
          </View>
          <View style={styles.legendRow}>
            <DashLine />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:windGust')} (m/s)
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Arrow />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:windDirection')}
            </Text>
          </View>
        </>
      )}
      {chartType === 'cloud' && (
        <>
          <View style={styles.legendRow}>
            <Line />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloud')} (m)
            </Text>
          </View>
        </>
      )}
      {chartType === 'pressure' && (
        <>
          <View style={styles.legendRow}>
            <Line />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:pressure')} (hpa)
            </Text>
          </View>
        </>
      )}
      {chartType === 'humidity' && (
        <>
          <View style={styles.legendRow}>
            <Line />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:humidity')} (%)
            </Text>
          </View>
        </>
      )}
      {chartType === 'visCloud' && (
        <>
          <View style={styles.legendRow}>
            <View style={styles.rowFirstHalf}>
              <DashLine />
            </View>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:visibility')} (m)
            </Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.rowFirstHalf}>
              <Bar color={colors.primaryText} />
            </View>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:totalcloudcover')}
            </Text>
          </View>
          <View style={styles.legendRowNoMargin}>
            <Text
              style={[styles.rowFirstHalfText, { color: colors.primaryText }]}>
              0/8 - 1/8
            </Text>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloudCover01')}
            </Text>
          </View>
          <View style={styles.legendRowNoMargin}>
            <Text
              style={[styles.rowFirstHalfText, { color: colors.primaryText }]}>
              2/8 - 4/8
            </Text>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloudCover24')}
            </Text>
          </View>
          <View style={styles.legendRowNoMargin}>
            <Text
              style={[styles.rowFirstHalfText, { color: colors.primaryText }]}>
              3/8 - 6/8
            </Text>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloudCover36')}
            </Text>
          </View>
          <View style={styles.legendRowNoMargin}>
            <Text
              style={[styles.rowFirstHalfText, { color: colors.primaryText }]}>
              5/8 - 7/8
            </Text>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloudCover57')}
            </Text>
          </View>
          <View style={styles.legendRowNoMargin}>
            <Text
              style={[styles.rowFirstHalfText, { color: colors.primaryText }]}>
              7/8 - 8/8
            </Text>
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloudCover78')}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    flex: 1,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  rowFirstHalf: {
    width: 60,
  },
  rowFirstHalfText: {
    width: 65,
  },
  legendRowNoMargin: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendLine: {
    width: 16,
    height: 3,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginLeft: 16,
  },
  legendLineBlock: {
    width: 4,
    height: 3,
  },
  withMarginRight: {
    marginRight: 2,
  },
  legendBlock: {
    width: 8,
    height: 4,
    marginRight: 2,
  },
  iconMargin: {
    marginLeft: -4,
  },
});

export default ChartLegend;
