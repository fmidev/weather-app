import { Config } from '@config';
import { ChartData } from '@components/weather/charts/types';
import { limitUvForecast, prepareChartData } from '@components/weather/charts/data';

jest.mock('@config', () => ({
  Config: {
    get: jest.fn(),
  },
}));

const configGet = Config.get as jest.Mock;

beforeEach(() => {
  configGet.mockReturnValue({
    units: { temperature: 'C', precipitation: 'mm', wind: 'm/s', pressure: 'hPa' },
  });
});

test('precipitation and probability use the same y scale while missing values stay missing', () => {
  const data = [
    { epochtime: 100, precipitation1h: 4, pop: 50 },
    { epochtime: 200, precipitation1h: null, pop: null },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'precipitation', false);

  expect(result.domain.y).toEqual([0, 1]);
  expect(result.precipitationMaximum).toBe(5);
  expect(result.precipitationValues).toEqual([4, null]);
  expect(result.points[0]).toMatchObject({ x: 100000, precipitation1h: 0.8, pop: 0.5 });
  expect(result.points[1]).toMatchObject({ precipitation1h: null, pop: null });
});

test('keeps precipitation amounts aligned with newest-first observation points', () => {
  const data = [
    { epochtime: 300, precipitation1h: 10 },
    { epochtime: 200, precipitation1h: 0.2 },
    { epochtime: 100, precipitation1h: 4 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'precipitation', true);

  expect(result.points.map((point) => point.x)).toEqual([100000, 200000, 300000]);
  expect(result.precipitationValues).toEqual([4, 0.2, 10]);
  expect(result.points.map((point) => point.precipitation1h)).toEqual([
    4 / result.precipitationMaximum,
    0.2 / result.precipitationMaximum,
    10 / result.precipitationMaximum,
  ]);
  expect(data.map((step) => step.epochtime)).toEqual([300, 200, 100]);
});

test.each([0, 0.5, 5])('weather axes start at zero when the minimum temperature is %s', (minimum) => {
  const data = [
    { epochtime: 100, temperature: 12, dewPoint: minimum, precipitation1h: 0 },
    { epochtime: 200, temperature: 16, dewPoint: 10, precipitation1h: 25.5 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'weather', true);

  expect(result.domain.y).toEqual([0, 20]);
  expect(result.secondaryDomain?.y?.[0]).toBe(0);
  expect(result.points[0].precipitation1h).toBe(0);
});

test('weather precipitation starts at zero while negative temperatures remain visible', () => {
  const data = [
    { epochtime: 100, temperature: -2, dewPoint: -3, precipitation1h: 2 },
    { epochtime: 200, temperature: -1, dewPoint: -2, precipitation1h: 0 },
    { epochtime: 300, temperature: -3, dewPoint: -4, precipitation1h: null },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'weather', true);
  const maximum = result.domain.y?.[1] ?? 0;
  const rainMaximum = result.secondaryDomain?.y?.[1] ?? 1;

  expect(result.points[0].temperature).toBe(-2);
  expect(result.points[0].precipitation1h).toBeCloseTo(
    (2 / rainMaximum) * maximum
  );
  expect(result.points[1].precipitation1h).toBe(0);
  expect(result.points[2].precipitation1h).toBeNull();
  expect(result.domain.y?.[0]).toBeLessThan(0);
  expect(maximum).toBeGreaterThan(0);
});

test('temperature data keeps a domain aligned to five degree ticks', () => {
  const data = [
    { epochtime: 100, temperature: -2 },
    { epochtime: 200, temperature: 12 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'temperature', false);

  expect(result.domain.y).toEqual([-5, 15]);
});

test('wind data uses a maximum of 15 when both speed and gust are below 15', () => {
  const data = [
    { epochtime: 100, windSpeedMS: 4, windGust: 10 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'wind', false);

  expect(result.domain.y).toEqual([0, 15]);
});

test('wind gusts at the limit keep the larger domain', () => {
  const data = [
    { epochtime: 100, windSpeedMS: 4, windGust: 15 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'wind', true);

  expect(result.domain.y).toEqual([0, 20]);
});

test('forecast gusts also determine the wind axis maximum', () => {
  const data = [
    { epochtime: 100, windSpeedMS: 4, hourlymaximumgust: 16 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'wind', false);

  expect(result.domain.y).toEqual([0, 20]);
});

test('pressure data aligns its domain to ten hPa ticks', () => {
  const data = [
    { epochtime: 100, pressure: 1002 },
    { epochtime: 200, pressure: 1014 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'pressure', false);

  expect(result.domain.y).toEqual([1000, 1020]);
});

test('pressure observations use five-hPa ticks when their values fit', () => {
  const data = [
    { epochtime: 100, pressure: 1007 },
    { epochtime: 200, pressure: 1013 },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'pressure', true);

  expect(result.domain.y).toEqual([1005, 1015]);
});

test('UV forecast ends at the last available value while preserving gaps and zero', () => {
  const data = [
    { epochtime: 100, uvCumulated: 3 },
    { epochtime: 200, uvCumulated: null },
    { epochtime: 300, uvCumulated: 0 },
    { epochtime: 400, uvCumulated: null },
    { epochtime: 500 },
  ] as unknown as ChartData;

  expect(limitUvForecast(data, 'uv', false)).toEqual(data.slice(0, 3));
  expect(limitUvForecast(data, 'pressure', false)).toBe(data);
  expect(limitUvForecast(data, 'uv', true)).toBe(data);
});

test('UV forecast has no chart data when every value is unavailable', () => {
  const data = [
    { epochtime: 100, uvCumulated: null },
    { epochtime: 200 },
  ] as unknown as ChartData;

  expect(limitUvForecast(data, 'uv', false)).toEqual([]);
});

test('daily values keep a gap for a missing temperature', () => {
  const data = [
    {
      epochtime: 100,
      rrday: 3,
      maximumTemperature: 5,
      minimumTemperature: null,
      minimumGroundTemperature06: 1,
    },
  ] as unknown as ChartData;

  const result = prepareChartData(data, 'daily', true);

  expect(result.points[0].minimumTemperature).toBeNull();
  expect(result.points[0].rrday).toBe((result.domain.y?.[0] ?? 0) + 3);
});
