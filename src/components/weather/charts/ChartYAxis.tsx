import React, { memo } from 'react';
import { VictoryAxis, VictoryLabel } from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import { calculateTemperatureTickCount, chartYLabelText } from '@utils/chart';
import { useTranslation } from 'react-i18next';
import { ChartDomain, ChartMinMax, ChartType } from './types';
import { UnitMap } from '@store/settings/types';
import { Config } from '@config';
import { useWindowDimensions } from 'react-native';

type ChartYAxisProps = {
  chartType: ChartType;
  chartDimensions: {
    y: number;
    x: number;
  };
  chartDomain: ChartDomain;
  chartMinMax?: ChartMinMax;
  observation: boolean;
  right?: boolean;
  units?: UnitMap;
  secondaryParameterMissing?: boolean;
};

const ChartYAxis: React.FC<ChartYAxisProps> = ({
  chartType,
  chartDimensions,
  chartDomain,
  chartMinMax,
  observation,
  right,
  units,
  secondaryParameterMissing,
}) => {
  const { fontScale } = useWindowDimensions();
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const { t: unitTranslate } = useTranslation('unitAbbreviations');

  const defaultUnits = Config.get('settings').units;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  if (
    right &&
    ((observation && !['visCloud', 'daily', 'weather'].includes(chartType)) ||
      (!observation && chartType !== 'precipitation') ||
      secondaryParameterMissing)
  ) {
    return null;
  }

  let labelText: any = chartYLabelText(chartType, units, unitTranslate)[right ? 1 : 0];
  labelText =
    labelText.indexOf(':') > 0
      ? t(labelText).toLocaleLowerCase().split(' ')
      : labelText;
  let axisTickValues: number[] | undefined;
  let maxTick: number = 5;

  if (chartType === 'precipitation') {
    if (precipitationUnit === 'in') {
      axisTickValues = [0, 0.05, 0.1, 0.15, 0.2, 0.25];
      maxTick = 0.25;
    } else {
      axisTickValues = [0, 0.2, 0.4, 0.6, 0.8, 1];
      maxTick =
        precipitationUnit === 'in'
          ? 1
          : Math.ceil(
              (Math.max(
                ...[...(chartMinMax || []), maxTick - 1].filter(
                  (v): v is number => v !== undefined && v !== null
                )
              ) +
                1) /
                5
            ) * 5;
    }
  }

  if (chartType === 'visCloud') {
    axisTickValues = [0, 0.25, 0.5, 0.75, 1];
  }

  const labelStyles = {
    textAnchor: right ? 'start' : 'end',
    angle: 0,
    fill: colors.hourListText,
    fontSize: Math.min(fontScale * 12, 20),
    fontFamily: 'Roboto',
  };

  const tickFormat = (tick: any) => {
    if (chartType === 'precipitation') {
      if (precipitationUnit === 'in') {
        return right ? tick * 400 : tick;
      }
      return right ? tick * 100 : tick * maxTick;
    }
    if (chartType === 'visCloud') {
      return right ? `${tick * 8}/8` : tick * 60;
    }
    if (chartType === 'daily') {
      return right
        ? tick -
            Math.min(
              (chartDomain.y && chartDomain?.y[0]) ?? 0,
              (chartDomain.y && chartDomain?.y[1]) ?? 0
            )
        : tick;
    }
    return tick;
  };

  const tickCount =
    chartType === 'weather' && !right
      ? calculateTemperatureTickCount(chartDomain)
      : undefined;

  return (
    <VictoryAxis
      width={45}
      height={chartDimensions.y}
      dependentAxis
      orientation={right ? 'right' : 'left'}
      domain={chartDomain}
      tickValues={axisTickValues}
      tickCount={tickCount}
      tickFormat={tickFormat}
      label={labelText}
      style={{
        tickLabels: {
          fontSize: Math.min(14 * fontScale, 20),
          fontFamily: 'Roboto',
          fill: colors.hourListText,
        },
      }}
      axisLabelComponent={
        <VictoryLabel
          x={right ? 0 : 45}
          y={35}
          verticalAnchor="end"
          style={labelStyles}
        />
      }
    />
  );
};

export default memo(ChartYAxis);
