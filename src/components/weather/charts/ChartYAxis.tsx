import React, { memo } from 'react';
import { VictoryAxis, VictoryLabel } from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import { calculateTemperatureTickCount, chartYLabelText } from '@utils/chart';
import { useTranslation } from 'react-i18next';
import { ChartDomain, ChartMinMax, ChartType } from './types';
import { UnitMap } from '@store/settings/types';

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
};

const ChartYAxis: React.FC<ChartYAxisProps> = ({
  chartType,
  chartDimensions,
  chartDomain,
  chartMinMax,
  observation,
  right,
  units,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  if (
    right &&
    ((observation && !['visCloud', 'daily', 'weather'].includes(chartType)) ||
      (!observation && chartType !== 'precipitation'))
  ) {
    return null;
  }

  let labelText: any = chartYLabelText(chartType, units)[right ? 1 : 0];
  labelText =
    labelText.indexOf(':') > 0
      ? t(labelText).toLocaleLowerCase().split(' ')
      : labelText;
  let axisTickValues: number[] | undefined;
  let maxTick: number = 5;

  if (chartType === 'precipitation') {
    axisTickValues = [0, 0.2, 0.4, 0.6, 0.8, 1];
    maxTick =
      Math.ceil(
        (Math.max(
          ...[...(chartMinMax || []), maxTick - 1].filter(
            (v): v is number => v !== undefined && v !== null
          )
        ) +
          1) /
          5
      ) * 5;
  }

  if (chartType === 'visCloud') {
    axisTickValues = [0, 0.25, 0.5, 0.75, 1];
  }

  const labelStyles = {
    textAnchor: right ? 'start' : 'end',
    angle: 0,
    fill: colors.hourListText,
    fontSize: 12,
    fontFamily: 'Roboto',
  };

  const tickFormat = (tick: any) => {
    if (chartType === 'precipitation') {
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
          fontSize: 14,
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
