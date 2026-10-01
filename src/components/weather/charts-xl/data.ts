import { Config } from '@config';
import { converter, resolveUnitParameterName } from '@utils/units';
import { chartYDomain, secondaryYDomainForWeatherChart } from '@utils/chart';
import { UnitMap } from '@store/settings/types';
import { ChartData, ChartDomain, ChartKey, ChartPoint, ChartType, Parameter } from './types';
import { forecastTypeParameters, observationTypeParameters } from './settings';
import { alignPressureDomain, alignTemperatureDomain, alignWindDomain } from './ticks';

export type PreparedChart = {
  points: ChartPoint[];
  domain: ChartDomain;
  secondaryDomain?: ChartDomain;
  precipitationMaximum: number;
  precipitationValues: Array<number | null>;
};

export const limitUvForecast = (
  data: ChartData,
  chartType: ChartType,
  observation: boolean
): ChartData => {
  if (chartType !== 'uv' || observation) return data;

  let end = data.length;
  while (end > 0) {
    const step = data[end - 1];
    if ('uvCumulated' in step && step.uvCumulated != null) break;
    end--;
  }
  return data.slice(0, end) as ChartData;
};

export const prepareChartData = (
  data: ChartData,
  chartType: ChartType,
  observation: boolean,
  units?: UnitMap
): PreparedChart => {
  const defaultUnits = Config.get('settings').units;
  const parameters = observation
    ? observationTypeParameters[chartType]
    : forecastTypeParameters[chartType];
  const converted: ChartPoint[] = data.map((step) => {
    const point: ChartPoint = { x: step.epochtime * 1000 };
    parameters.forEach((parameter: Parameter) => {
      const unitName = resolveUnitParameterName(String(parameter));
      const defaultUnit = unitName
        ? defaultUnits[unitName as keyof typeof defaultUnits]
        : undefined;
      const unit = unitName ? units?.[unitName]?.unitAbb ?? defaultUnit : undefined;
      const value = (step as unknown as Record<string, number | null | undefined>)[parameter];
      point[parameter as ChartKey] = unit ? converter(unit, value) : value;
    });
    return point;
  });

  const values = converted.flatMap((point) =>
    parameters
      .filter((parameter) => parameter !== 'windDirection' && parameter !== 'pop')
      .map((parameter) => point[parameter as ChartKey] ?? null)
  );
  const maximumWindValue = chartType === 'wind'
    ? values.reduce<number>((maximum, value) =>
      typeof value === 'number' && Number.isFinite(value)
        ? Math.max(maximum, value)
        : maximum, Number.NEGATIVE_INFINITY)
    : undefined;
  const yDomain = alignPressureDomain(
    alignWindDomain(
      alignTemperatureDomain(chartYDomain(values, chartType, units), chartType),
      chartType,
      maximumWindValue
    ),
    chartType,
    units?.pressure.unitAbb ?? defaultUnits.pressure,
    observation
  );
  const precipitationUnit = units?.precipitation.unitAbb ?? defaultUnits.precipitation;
  const precipitationMaximum = precipitationUnit === 'in'
    ? 0.25
    : Math.ceil((Math.max(0, ...converted.map((point) => point.precipitation1h ?? 0)) + 1) / 5) * 5;
  const secondaryDomain = chartType === 'weather'
    ? secondaryYDomainForWeatherChart(
        converted.map((point) => point.precipitation1h ?? 0),
        yDomain
      )
    : undefined;

  const points = converted.map((point) => {
    if (chartType === 'precipitation') {
      return {
        ...point,
        precipitation1h: point.precipitation1h == null
          ? null
          : precipitationUnit === 'in'
            ? point.precipitation1h
            : point.precipitation1h / precipitationMaximum,
        pop: point.pop == null ? null : point.pop / (precipitationUnit === 'in' ? 400 : 100),
      };
    }
    if (chartType === 'visCloud') {
      return {
        ...point,
        visibility: point.visibility == null ? null : point.visibility / 60000,
        totalCloudCover: point.totalCloudCover == null
          ? null
          : Math.min(point.totalCloudCover, 8) / 8,
      };
    }
    if (chartType === 'weather') {
      const minimum = yDomain.y?.[0] ?? 0;
      const range = (yDomain.y?.[1] ?? 1) - minimum;
      const divider = secondaryDomain?.y?.[1] ?? 1;
      return {
        ...point,
        precipitation1h: point.precipitation1h == null
          ? null
          : minimum + (point.precipitation1h / divider) * range,
      };
    }
    if (chartType === 'daily') {
      const minimum = yDomain.y?.[0] ?? 0;
      return {
        ...point,
        rrday: point.rrday == null ? null : minimum + point.rrday,
      };
    }
    return point;
  });

  return {
    points,
    domain: yDomain,
    secondaryDomain,
    precipitationMaximum,
    precipitationValues: converted.map((point) => point.precipitation1h ?? null),
  };
};
