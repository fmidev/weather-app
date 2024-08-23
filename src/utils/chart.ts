import {
  ChartData,
  ChartDomain,
  ChartMinMax,
  ChartType,
} from '@components/weather/charts/types';
import { Config } from '@config';
import { ClockType, UnitMap } from '@store/settings/types';
import moment from 'moment';

export const chartXDomain = (tickValues: number[]): ChartDomain => ({
  x: [tickValues[0], tickValues[tickValues.length - 1]],
});

export const chartYDomain = (
  minMax: ChartMinMax,
  chartType: ChartType,
  units?: UnitMap
): ChartDomain => {
  const defaultUnits = Config.get('settings').units;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  if (
    chartType === 'visCloud' ||
    (chartType === 'precipitation' && precipitationUnit !== 'in')
  ) {
    return { y: [0, 1] };
  }

  if (chartType === 'precipitation' && precipitationUnit === 'in') {
    return { y: [0, 0.25] };
  }

  if (chartType === 'humidity') {
    return { y: [0, 100] };
  }

  const values: number[] = minMax.filter(
    (v): v is number => v !== undefined && v !== null
  );

  if (values.length === 0) {
    return { y: [0, 10] };
  }

  const max = Math.max(...values);
  const min = Math.min(...values);

  if (chartType === 'wind') {
    return { y: [0, max > 15 ? Math.ceil((max + 1) / 5) * 5 : 16] };
  }
  if (chartType === 'cloud') {
    return { y: [0, Math.ceil((max + 1) / 500) * 500] };
  }

  if (chartType === 'snowDepth') {
    return { y: [0, Math.ceil((max + 10) / 10) * 10] };
  }

  return {
    y: [
      ['precipitation', 'uv'].includes(chartType)
        ? 0
        : Math.floor((min - 1) / 5) * 5,
      Math.ceil((max + 1) / 5) * 5,
    ],
  };
};

export const secondaryYDomainForWeatherChart = (
  minMax: ChartMinMax,
  temperatureDomain: ChartDomain
): ChartDomain => {
  if (!temperatureDomain.y) {
    return { y: [0, 10] };
  }

  const tickCount = calculateTemperatureTickCount(temperatureDomain);
  const values: number[] = minMax.filter(
    (v): v is number => v !== undefined && v !== null
  );
  let max = Math.ceil(Math.max(...values));

  while (max < 5 || max % tickCount !== 0) {
    max++;
  }

  return { y: [0, max - 1] };
};

export const calculateTemperatureTickCount = (
  temperatureDomain: ChartDomain
): number => {
  if (!temperatureDomain.y) {
    return 5;
  }

  const diff = Math.abs(temperatureDomain.y[1] - temperatureDomain.y[0]);
  const dividers = [4, 5, 6, 7, 8].filter((value) => diff % value === 0);

  // Prefer pretty number 5 in ticks/scales
  const prettyNumber = dividers.find((divider) => diff / divider === 5);
  return prettyNumber ? prettyNumber + 1 : Math.min(...dividers) + 1;
};

export const chartTickValues = (
  data: ChartData,
  tickInterval: number,
  observation: boolean,
  timePeriod: number
) => {
  const unfiltered =
    data?.map(({ epochtime }, index) => {
      const time = moment.unix(epochtime);
      return index === 0 ||
        index === data.length - 1 ||
        (time.hour() % tickInterval === 0 && time.minutes() === 0)
        ? epochtime * 1000
        : false;
    }) || [];
  const tickValues: number[] = unfiltered.filter(
    <(t: number | false) => t is number>((t) => typeof t === 'number')
  );
  if (observation && tickValues.length < timePeriod / tickInterval - 2) {
    const time = moment().startOf('hour');
    let i = 0;
    while (i < timePeriod) {
      time.subtract(tickInterval, 'hour');
      if (time.hour() % tickInterval === 0) {
        tickValues.push(time.valueOf());
      }
      i += tickInterval;
    }
  }
  return tickValues;
};

export const dailyChartTickValues = (days: number) => {
  const tickValues = [...new Array(days)].map((_, i) =>
    moment()
      .startOf('day')
      .subtract(i, 'days')
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .valueOf()
  );
  tickValues.push(
    moment()
      .startOf('day')
      .add(1, 'days')
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .valueOf()
  );
  return tickValues.sort();
};

export const capitalize = ([first, ...rest]: string) =>
  first.toUpperCase() + rest.join('');

export const tickFormat = (
  tick: any,
  locale: string,
  clockType: ClockType,
  daily?: boolean
): string | number => {
  const time = moment(tick);
  const hour = time.hour();
  const minutes = time.minutes();

  if (!daily && (hour % 3 !== 0 || minutes !== 0)) {
    return '';
  }
  if (daily || hour === 0) {
    return `${capitalize(time.format(locale === 'en' ? 'ddd' : 'dd'))}
${time.format(locale === 'en' ? 'D MMM' : 'D.M.')}`;
  }
  return time.format(clockType === 12 ? 'h a' : 'HH');
};

export const getTickFormat =
  (locale: string, clockType: ClockType, daily?: boolean) => (tick: any) =>
    tickFormat(tick, locale, clockType, daily);

export const chartYLabelText = (chartType: ChartType, units?: UnitMap) => {
  const defaultUnits = Config.get('settings').units;

  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;
  const pressureUnit = units?.pressure.unitAbb ?? defaultUnits.pressure;

  switch (chartType) {
    case 'humidity':
      return ['%'];
    case 'temperature':
      return [`°${temperatureUnit}`];
    case 'pressure':
      return [pressureUnit];
    case 'visCloud':
      return ['km', 'weather:charts:totalCloudCover'];
    case 'precipitation':
      return [precipitationUnit, '%'];
    case 'wind':
      return [windUnit];
    case 'uv':
      return ['UV'];
    case 'snowDepth':
      return ['cm'];
    case 'cloud':
      return ['m'];
    case 'weather':
    case 'daily':
      return [`°${temperatureUnit}`, precipitationUnit];
    default:
      return [''];
  }
};
