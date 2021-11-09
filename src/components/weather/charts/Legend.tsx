import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme } from '@utils/colors';

import Icon from '@components/common/Icon';
import { ChartType } from './types';

type ChartLegendProps = {
  chartType: ChartType;
};

const ChartLegend: React.FC<ChartLegendProps> = ({ chartType }) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  return (
    <View style={styles.legendContainer}>
      {(chartType === 'temperature' || chartType === 'temperatureFeels') && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLine,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:temperature')} (°C)
            </Text>
          </View>
        </>
      )}
      {chartType === 'temperatureFeels' && (
        <>
          <View style={styles.legendRow}>
            <View style={styles.legendRow}>
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
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:feelsLike')} (°C)
            </Text>
          </View>
        </>
      )}
      {chartType === 'precipitation' && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendBlock,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:precipitation')} (mm)
            </Text>
          </View>
        </>
      )}
      {chartType === 'wind' && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLine,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:windSpeed')} (m/s)
            </Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendRow}>
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
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:windGust')} (m/s)
            </Text>
          </View>
          <View style={styles.legendRow}>
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
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:windDirection')}
            </Text>
          </View>
        </>
      )}
      {chartType === 'cloud' && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLine,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:cloud')} (m)
            </Text>
          </View>
        </>
      )}
      {chartType === 'pressure' && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLine,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:pressure')} (hpa)
            </Text>
          </View>
        </>
      )}
      {chartType === 'humidity' && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLine,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:humidity')} (hpa)
            </Text>
          </View>
        </>
      )}
      {chartType === 'visCloud' && (
        <>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLine,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:visibility')} (m)
            </Text>
          </View>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendBlock,
                {
                  backgroundColor: colors.primaryText,
                },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.primaryText }]}>
              {t('weather:charts:totalcloudcover')}
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
    width: 12,
    height: 12,
  },
  iconMargin: {
    marginLeft: -4,
  },
});

export default ChartLegend;
