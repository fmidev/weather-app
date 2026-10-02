import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Text from '@components/common/AppText';
import { CustomTheme } from '@assets/colors';
import { MAC_CONTENT_SIZE_MULTIPLIER, REGULAR_FONT } from '@assets/constants';
import { useIsRunningOnMac } from '@components/common/MacContentSizeContext';
import { UnitMap } from '@store/settings/types';
import { chartYLabelText } from '@utils/chart';
import { Config } from '@config';
import { ChartDomain, ChartType } from './types';
import { getChartYTicks } from './ticks';

type Props = {
  chartType: ChartType;
  domain: ChartDomain;
  yScale?: { domain: [number, number]; range: [number, number] };
  secondaryDomain?: ChartDomain;
  observation: boolean;
  right?: boolean;
  units?: UnitMap;
  secondaryParameterMissing?: boolean;
  precipitationMaximum: number;
};

const ChartYAxis: React.FC<Props> = ({
  chartType, domain, yScale, secondaryDomain, observation, right,
  units, secondaryParameterMissing, precipitationMaximum,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const { t: unitTranslate } = useTranslation('unitAbbreviations');
  const { fontScale } = useWindowDimensions();
  const isRunningOnMac = useIsRunningOnMac();
  const precipitationUnit = units?.precipitation.unitAbb ?? Config.get('settings').units.precipitation;
  const [tickHeight, setTickHeight] = useState<number>();

  if (right && (
    (observation && !['visCloud', 'daily', 'weather'].includes(chartType)) ||
    (!observation && chartType !== 'precipitation') ||
    secondaryParameterMissing
  )) return null;

  const rawTitle = chartYLabelText(chartType, units, unitTranslate)[right ? 1 : 0] ?? '';
  const title = rawTitle.includes(':') ? t(rawTitle).toLocaleLowerCase() : rawTitle;
  const range = domain.y ?? [0, 10];
  const ticks = getChartYTicks(
    domain,
    chartType,
    units?.pressure.unitAbb ?? Config.get('settings').units.pressure,
    observation
  ).reverse();
  const format = (value: number) => {
    if (chartType === 'precipitation') {
      return right
        ? value * (precipitationUnit === 'in' ? 400 : 100)
        : value * (precipitationUnit === 'in' ? 1 : precipitationMaximum);
    }
    if (chartType === 'visCloud') return right ? `${Math.round(value * 8)}/8` : value * 60;
    if (chartType === 'weather' && right) {
      const secondary = secondaryDomain?.y ?? [0, 10];
      return (value - range[0]) / (range[1] - range[0]) * (secondary[1] - secondary[0]);
    }
    if (chartType === 'daily' && right) return value - range[0];
    return value;
  };
  const scaledFontSize = fontScale * (isRunningOnMac ? MAC_CONTENT_SIZE_MULTIPLIER : 1);
  const tickFontSize = Math.min(scaledFontSize * 14, 20);
  const titleFontSize = Math.min(scaledFontSize * 13, 18);

  return (
    <View style={styles.axis}>
      <Text style={[styles.title, { color: colors.hourListText, fontSize: titleFontSize }]}>
        {title}
      </Text>
      {yScale && ticks.map((tick, index) => {
          const value = format(tick);
          const label = typeof value === 'string'
            ? value
            : Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
          const fraction = yScale.domain[1] === yScale.domain[0]
            ? 0.5
            : (tick - yScale.domain[0]) / (yScale.domain[1] - yScale.domain[0]);
          const y = yScale.range[0] + fraction * (yScale.range[1] - yScale.range[0]);
          return (
            <Text
              key={index}
              onLayout={index === 0 ? ({ nativeEvent }) => {
                const height = nativeEvent.layout.height;
                setTickHeight((previous) => previous === height ? previous : height);
              } : undefined}
              style={[styles.tick, right ? styles.rightTick : styles.leftTick, {
                color: colors.hourListText,
                fontSize: tickFontSize,
                top: y - (tickHeight ?? tickFontSize) / 2,
              }]}>
              {label}
            </Text>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  axis: { width: 45, height: 300 },
  title: { fontFamily: REGULAR_FONT, height: 20, textAlign: 'right', width: '100%', position: 'absolute' },
  tick: { fontFamily: REGULAR_FONT, position: 'absolute', left: 0, right: 0 },
  leftTick: { textAlign: 'right' },
  rightTick: { textAlign: 'left' },
});

export default ChartYAxis;
