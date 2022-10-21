import {
  ChartData,
  ChartDomain,
  ChartMinMax,
  ChartType,
} from '@components/weather/charts/types';
import { Config } from '@config';
import { ClockType } from '@store/settings/types';
import moment from 'moment';

export const chartXDomain = (tickValues: number[]): ChartDomain => ({
  x: [tickValues[0], tickValues[tickValues.length - 1]],
});

export const chartYDomain = (
  minMax: ChartMinMax,
  chartType: ChartType
): ChartDomain => {
  if (chartType === 'visCloud' || chartType === 'precipitation') {
    return { y: [0, 1] };
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

export const capitalize = ([first, ...rest]: string) =>
  first.toUpperCase() + rest.join('');

export const tickFormat = (
  tick: any,
  locale: string,
  clockType: ClockType
): string | number => {
  const time = moment(tick);
  const hour = time.hour();
  const minutes = time.minutes();

  if (hour % 3 !== 0 || minutes !== 0) {
    return '';
  }
  if (hour === 0) {
    return `${capitalize(time.format(locale === 'en' ? 'ddd' : 'dd'))}
${time.format(locale === 'en' ? 'D MMM' : 'D.M.')}`;
  }
  return time.format(clockType === 12 ? 'h' : 'HH');
};

export const getTickFormat =
  (locale: string, clockType: ClockType) => (tick: any) =>
    tickFormat(tick, locale, clockType);

export const chartYLabelText = (chartType: ChartType) => {
  const { units } = Config.get('settings');
  switch (chartType) {
    case 'humidity':
      return ['%'];
    case 'temperature':
      return [`°${units.temperature}`];
    case 'pressure':
      return [units.pressure];
    case 'visCloud':
      return ['km', 'weather:charts:totalCloudCover'];
    case 'precipitation':
      return [units.precipitation, '%'];
    case 'wind':
      return [units.wind];
    case 'uv':
      return ['UV'];
    case 'snowDepth':
      return ['cm'];
    case 'cloud':
      return ['m'];
    default:
      return [''];
  }
};
