import moment from 'moment';

import {
  calculateTemperatureTickCount,
  capitalize,
  chartTickValues,
  chartXDomain,
  chartYDomain,
  chartYLabelText,
  dailyChartTickValues,
  getTickFormat,
  secondaryYDomainForWeatherChart,
  tickFormat,
} from '../../src/utils/chart';
import { UnitMap } from '../../src/store/settings/types';

jest.mock('@config', () => ({
  Config: {
    get: jest.fn(() => ({
      units: {
        temperature: 'C',
        wind: 'm/s',
        precipitation: 'mm',
        pressure: 'hPa',
      },
    })),
  },
}));

const makeUnits = (overrides: Record<string, string> = {}): UnitMap => ({
  temperature: {
    unitId: 0,
    unitAbb: overrides.temperature ?? 'F',
    unit: 'temperature',
    unitPrecision: 0,
  },
  wind: {
    unitId: 1,
    unitAbb: overrides.wind ?? 'km/h',
    unit: 'wind',
    unitPrecision: 0,
  },
  precipitation: {
    unitId: 2,
    unitAbb: overrides.precipitation ?? 'in',
    unit: 'precipitation',
    unitPrecision: 2,
  },
  pressure: {
    unitId: 3,
    unitAbb: overrides.pressure ?? 'inHg',
    unit: 'pressure',
    unitPrecision: 1,
  },
});

const epochSeconds = (value: string) => moment(value).unix();

describe('chart utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:30:00+02:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('chart domains', () => {
    it('builds x domain from first and last tick value', () => {
      expect(chartXDomain([1000, 2000, 3000])).toEqual({ x: [1000, 3000] });
    });

    it('uses fixed y domains for percentage and precipitation charts', () => {
      expect(chartYDomain([12, 80], 'humidity')).toEqual({ y: [0, 100] });
      expect(chartYDomain([0.2, 0.7], 'visCloud')).toEqual({ y: [0, 1] });
      expect(chartYDomain([0.2, 0.7], 'precipitation')).toEqual({ y: [0, 1] });
      expect(
        chartYDomain([0.1, 0.2], 'precipitation', makeUnits())
      ).toEqual({ y: [0, 0.25] });
    });

    it('rounds y domain by chart type and ignores missing min/max values', () => {
      expect(chartYDomain([2, 15.1, null], 'wind')).toEqual({ y: [0, 20] });
      expect(chartYDomain([2, 7, null], 'wind')).toEqual({ y: [0, 16] });
      expect(chartYDomain([1120, 1800], 'cloud')).toEqual({ y: [0, 2000] });
      expect(chartYDomain([14, 23], 'snowDepth')).toEqual({ y: [0, 40] });
      expect(chartYDomain([null, null], 'temperature')).toEqual({ y: [0, 10] });
    });

    it('rounds regular charts around data min and max', () => {
      expect(chartYDomain([-3, 11], 'temperature')).toEqual({ y: [-5, 15] });
      expect(chartYDomain([2, 8], 'uv')).toEqual({ y: [0, 10] });
    });

    it('aligns secondary weather chart domain to temperature tick count', () => {
      expect(
        secondaryYDomainForWeatherChart([1.2, 6.1], { y: [-10, 20] })
      ).toEqual({ y: [0, 6] });
      expect(secondaryYDomainForWeatherChart([1, 2], { x: [1, 2] })).toEqual({
        y: [0, 10],
      });
    });

    it('calculates temperature tick count from divisible domain range', () => {
      expect(calculateTemperatureTickCount({ y: [-10, 15] })).toBe(6);
      expect(calculateTemperatureTickCount({ y: [-10, 20] })).toBe(7);
      expect(calculateTemperatureTickCount({ x: [1, 2] })).toBe(5);
    });
  });

  describe('tick values', () => {
    it('keeps first, last and interval-aligned chart ticks', () => {
      const data = [
        { epochtime: epochSeconds('2024-01-15T00:00:00+02:00') },
        { epochtime: epochSeconds('2024-01-15T01:00:00+02:00') },
        { epochtime: epochSeconds('2024-01-15T06:00:00+02:00') },
        { epochtime: epochSeconds('2024-01-15T07:00:00+02:00') },
      ] as any;

      expect(chartTickValues(data, 3, false, 12)).toEqual([
        moment('2024-01-15T00:00:00+02:00').valueOf(),
        moment('2024-01-15T06:00:00+02:00').valueOf(),
        moment('2024-01-15T07:00:00+02:00').valueOf(),
      ]);
    });

    it('fills missing observation ticks from the current hour', () => {
      const data = [
        { epochtime: epochSeconds('2024-01-15T09:00:00+02:00') },
      ] as any;

      expect(chartTickValues(data, 3, true, 12)).toEqual([
        moment('2024-01-15T00:00:00+02:00').valueOf(),
        moment('2024-01-15T03:00:00+02:00').valueOf(),
        moment('2024-01-15T06:00:00+02:00').valueOf(),
        moment('2024-01-15T09:00:00+02:00').valueOf(),
      ]);
    });

    it('builds daily tick values for previous days and tomorrow', () => {
      expect(dailyChartTickValues(2)).toEqual([
        moment('2024-01-14T00:00:00+02:00').valueOf(),
        moment('2024-01-15T00:00:00+02:00').valueOf(),
        moment('2024-01-16T00:00:00+02:00').valueOf(),
      ]);
    });
  });

  describe('tick formatting', () => {
    it('capitalizes the first character', () => {
      expect(capitalize('monday')).toBe('Monday');
    });

    it('formats daily and midnight ticks with weekday and date', () => {
      expect(
        tickFormat(moment('2024-01-15T00:00:00+02:00').valueOf(), 'en', 24)
      ).toBe('Mon\n15 Jan');
      expect(
        tickFormat(moment('2024-01-15T12:00:00+02:00').valueOf(), 'en', 24, true)
      ).toBe('Mon\n15 Jan');
    });

    it('formats hourly ticks according to clock type and hides off-divider ticks', () => {
      expect(
        tickFormat(moment('2024-01-15T06:00:00+02:00').valueOf(), 'en', 12)
      ).toBe('6 am');
      expect(
        tickFormat(moment('2024-01-15T03:00:00+02:00').valueOf(), 'en', 24)
      ).toBe('03');
      expect(
        tickFormat(moment('2024-01-15T04:00:00+02:00').valueOf(), 'en', 24)
      ).toBe('');
    });

    it('uses three-hour divider for observation ticks with 12 hour clock', () => {
      expect(
        tickFormat(
          moment('2024-01-15T03:00:00+02:00').valueOf(),
          'en',
          12,
          false,
          true
        )
      ).toBe('3 am');
    });

    it('returns reusable tick formatter', () => {
      const formatter = getTickFormat('en', 24, false);

      expect(formatter(moment('2024-01-15T03:00:00+02:00').valueOf())).toBe(
        '03'
      );
    });
  });

  describe('chart y labels', () => {
    it('returns default unit labels by chart type', () => {
      expect(chartYLabelText('humidity')).toEqual(['%']);
      expect(chartYLabelText('temperature')).toEqual(['°C']);
      expect(chartYLabelText('pressure')).toEqual(['hPa']);
      expect(chartYLabelText('visCloud')).toEqual([
        'km',
        'weather:charts:totalCloudCover',
      ]);
      expect(chartYLabelText('precipitation')).toEqual(['mm', '%']);
      expect(chartYLabelText('wind')).toEqual(['m/s']);
      expect(chartYLabelText('uv')).toEqual(['UV']);
      expect(chartYLabelText('snowDepth')).toEqual(['cm']);
      expect(chartYLabelText('cloud')).toEqual(['m']);
      expect(chartYLabelText('weather')).toEqual(['°C', 'mm']);
      expect(chartYLabelText('daily')).toEqual(['°C', 'mm']);
    });

    it('uses selected units and optional translation function', () => {
      const t = (key: string) => `translated:${key}`;

      expect(chartYLabelText('weather', makeUnits(), t)).toEqual([
        '°translated:F',
        'translated:in',
      ]);
      expect(chartYLabelText('pressure', makeUnits(), t)).toEqual([
        'translated:inHg',
      ]);
      expect(chartYLabelText('wind', makeUnits(), t)).toEqual([
        'translated:km/h',
      ]);
    });

    it('returns an empty label for unknown chart types', () => {
      expect(chartYLabelText('unknown' as any)).toEqual(['']);
    });
  });
});
