import {
  ChartData,
  ChartDomain,
  ChartMinMax,
  ChartType,
} from '@components/weather/charts/types';
import moment from 'moment';

export const chartXDomain = (
  domain: ChartDomain,
  observation: boolean | undefined,
  tickValues: number[]
): ChartDomain => {
  if (domain.x && domain.x[0] !== 0 && domain.x[1] !== 0) {
    return domain;
  }
  if (observation) {
    return {
      x: [tickValues[0], tickValues[tickValues.length - 1]],
    };
  }
  return {
    x: [tickValues[0], tickValues[9]],
  };
};

export const chartYDomain = (
  minMax: ChartMinMax,
  chartType: ChartType
): ChartDomain => {
  const values: number[] = minMax.filter(
    (v): v is number => v !== undefined && v !== null
  );

  if (values.length === 0) {
    return { y: [0, 10] };
  }

  const max = Math.max(...values);
  const min = Math.min(...values);

  if (chartType === 'wind') {
    return { y: [0, max > 16 ? Math.ceil((max + 1) / 5) * 5 : 16] };
  }

  if (chartType === 'visCloud') {
    return { y: [0, 60000] };
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
    return (!observation && index === 0) ||
      (time.hour() % tickInterval === 0 && time.minutes() === 0)
      ? epochtime * 1000
      : false;
  });
  const tickValues: number[] = unfiltered.filter(
    <(t: number | false) => t is number>((t) => typeof t === 'number')
  );

  if (observation) {
    tickValues.push(
      tickValues[tickValues.length - 1] + tickInterval * 60 * 60 * 1000
    );
  }
  return tickValues;
};

export const tickFormat = (
  tick: any,
  index: number,
  ticks: any[]
): string | number => {
  const time = moment(tick);
  const hour = time.hour();

  if (ticks.length > 30 && ![0].includes(hour)) {
    return '';
  }
  if (ticks.length > 20 && ![0, 12].includes(hour)) {
    return '';
  }
  if (ticks.length > 10 && ![0, 6, 12, 18].includes(hour)) {
    return '';
  }
  if (hour % 3 !== 0) {
    return '';
  }
  if (hour === 0) {
    return `${time.format('dd')}
${time.format('D.M')}`;
  }
  return hour;
};
