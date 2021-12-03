import {
  ChartData,
  ChartDomain,
  ChartMinMax,
  ChartType,
} from '@components/weather/charts/types';
import moment from 'moment';

export const chartXDomain = (tickValues: number[]): ChartDomain => ({
  x: [tickValues[0], tickValues[tickValues.length - 1]],
});

export const chartYDomain = (
  minMax: ChartMinMax,
  chartType: ChartType
): ChartDomain => {
  if (chartType === 'visCloud') {
    return { y: [0, 60000] };
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

  return {
    y: [
      chartType !== 'precipitation' ? Math.floor((min - 1) / 5) * 5 : 0,
      Math.ceil((max + 1) / 5) * 5,
    ],
  };
};

export const chartTickValues = (
  data: ChartData,
  observation: boolean | undefined,
  tickInterval: number
) => {
  const unfiltered = data.map(({ epochtime }, index) => {
    const time = moment.unix(epochtime);
    return index === 0 ||
      index === data.length - 1 ||
      (time.hour() % tickInterval === 0 && time.minutes() === 0)
      ? epochtime * 1000
      : false;
  });
  const tickValues: number[] = unfiltered.filter(
    <(t: number | false) => t is number>((t) => typeof t === 'number')
  );

  return tickValues;
};

export const capitalize = ([first, ...rest]: string) =>
  first.toUpperCase() + rest.join('');

export const tickFormat = (tick: any): string | number => {
  const time = moment(tick);
  const hour = time.hour();
  const minutes = time.minutes();

  if (hour % 3 !== 0 || minutes !== 0) {
    return '';
  }
  if (hour === 0) {
    return `${capitalize(time.format('dd'))}
${time.format('DD.MM.')}`;
  }
  return time.format('HH');
};

export const chartYLabelText = (chartType: ChartType) => {
  if (['temperatureFeels', 'temperature'].includes(chartType)) {
    return '°C';
  }
  if (['cloud'].includes(chartType)) {
    return 'm';
  }
  if (['humidity'].includes(chartType)) {
    return '%';
  }
  if (['precipitation'].includes(chartType)) {
    return 'mm';
  }
  if (['pressure'].includes(chartType)) {
    return 'hPa';
  }
  if (['visCloud'].includes(chartType)) {
    return 'km';
  }
  if (['wind'].includes(chartType)) {
    return 'm/s';
  }
  return '';
};
