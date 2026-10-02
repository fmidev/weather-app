import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { CHART_HEIGHT, CHART_TOP_PADDING } from './layout';

const TICK_FONT_SIZE = 14;
const TITLE_FONT_SIZE = 13;
const MAX_TICK_FONT_SIZE = 20;
const MAX_TITLE_FONT_SIZE = 18;

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
  height?: number;
  onTopPaddingChange?: (padding: number) => void;
};

const ChartYAxis: React.FC<Props> = ({
  chartType, domain, yScale, secondaryDomain, observation, right,
  units, secondaryParameterMissing, precipitationMaximum,
  height = CHART_HEIGHT, onTopPaddingChange,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const { t: unitTranslate } = useTranslation('unitAbbreviations');
  const isRunningOnMac = useIsRunningOnMac();
  const precipitationUnit = units?.precipitation.unitAbb ?? Config.get('settings').units.precipitation;
  const [tickHeight, setTickHeight] = useState<number>();
  const [titleHeight, setTitleHeight] = useState(0);
  // AppText applies the Mac multiplier; account for it only in the native scaling limits.
  const platformFontMultiplier = isRunningOnMac ? MAC_CONTENT_SIZE_MULTIPLIER : 1;
  const tickBaseHeight = TICK_FONT_SIZE * platformFontMultiplier;
  const tickMaxFontSizeMultiplier = MAX_TICK_FONT_SIZE / tickBaseHeight;
  const titleMaxFontSizeMultiplier = MAX_TITLE_FONT_SIZE / (TITLE_FONT_SIZE * platformFontMultiplier);

  const hidden = right && (
    (observation && !['visCloud', 'daily', 'weather'].includes(chartType)) ||
    (!observation && chartType !== 'precipitation') ||
    secondaryParameterMissing
  );

  useEffect(() => {
    // Leave room above the top tick for the full title and a visible gap.
    onTopPaddingChange?.(hidden ? 0 : Math.max(
      CHART_TOP_PADDING, titleHeight + (tickHeight ?? MAX_TICK_FONT_SIZE) / 2 + 8
    ));
  }, [hidden, onTopPaddingChange, tickHeight, titleHeight]);

  if (hidden) return null;

  const rawTitle = chartYLabelText(chartType, units, unitTranslate)[right ? 1 : 0] ?? '';
  const title = rawTitle.includes(':') ? t(rawTitle).toLocaleLowerCase() : rawTitle;
  const range = domain.y ?? [0, 10];
  const ticks = getChartYTicks(
    domain,
    chartType,
    units?.pressure.unitAbb ?? Config.get('settings').units.pressure,
    observation
  ).filter((tick) => chartType !== 'weather' || !right || tick >= 0).reverse();
  const format = (value: number) => {
    if (chartType === 'precipitation') {
      return right
        ? value * (precipitationUnit === 'in' ? 400 : 100)
        : value * (precipitationUnit === 'in' ? 1 : precipitationMaximum);
    }
    if (chartType === 'visCloud') return right ? `${Math.round(value * 8)}/8` : value * 60;
    if (chartType === 'weather' && right) {
      const secondary = secondaryDomain?.y ?? [0, 10];
      return value / range[1] * (secondary[1] - secondary[0]);
    }
    if (chartType === 'daily' && right) return value - range[0];
    return value;
  };
  return (
    <View style={[styles.axis, { height }]}>
      <Text
        maxFontSizeMultiplier={titleMaxFontSizeMultiplier}
        onLayout={({ nativeEvent }) => setTitleHeight(nativeEvent.layout.height)}
        style={[styles.title, right ? styles.rightTick : styles.leftTick, {
          color: colors.hourListText, fontSize: TITLE_FONT_SIZE,
        }]}>
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
              maxFontSizeMultiplier={tickMaxFontSizeMultiplier}
              onLayout={index === 0 ? ({ nativeEvent }) => {
                const measuredHeight = nativeEvent.layout.height;
                setTickHeight((previous) => previous === measuredHeight ? previous : measuredHeight);
              } : undefined}
              style={[styles.tick, right ? styles.rightTick : styles.leftTick, {
                color: colors.hourListText,
                fontSize: TICK_FONT_SIZE,
                top: y - (tickHeight ?? tickBaseHeight) / 2,
              }]}>
              {label}
            </Text>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  axis: { width: 45 },
  title: { fontFamily: REGULAR_FONT, top: 0, width: '100%', position: 'absolute' },
  tick: { fontFamily: REGULAR_FONT, position: 'absolute', left: 0, right: 0 },
  leftTick: { textAlign: 'right' },
  rightTick: { textAlign: 'left' },
});

export default ChartYAxis;
