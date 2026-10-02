import {
  alignPressureDomain,
  alignTemperatureDomain,
  alignWindDomain,
  getChartYTicks,
} from '@components/weather/charts/ticks';

test('includes the freezing point in evenly spaced temperature ticks', () => {
  const domain = alignTemperatureDomain({ y: [-5, 15] }, 'temperature');

  expect(domain.y).toEqual([-5, 15]);
  expect(getChartYTicks(domain, 'temperature')).toEqual([-5, 0, 5, 10, 15]);
});

test('expands a wider temperature domain to whole tick intervals', () => {
  const domain = alignTemperatureDomain({ y: [-5, 30] }, 'weather');

  expect(domain.y).toEqual([-10, 30]);
  expect(getChartYTicks(domain, 'weather')).toEqual([-10, 0, 10, 20, 30]);
});

test('retains the existing tick spacing for other chart types', () => {
  expect(getChartYTicks({ y: [0, 100] }, 'humidity')).toEqual([0, 20, 40, 60, 80, 100]);
  expect(getChartYTicks({ y: [0, 1] }, 'visCloud')).toEqual([0, 0.25, 0.5, 0.75, 1]);
});

test('uses five-unit wind ticks and widens the scale for stronger winds', () => {
  const ordinary = alignWindDomain({ y: [0, 16] }, 'wind', 14);
  expect(ordinary.y).toEqual([0, 15]);
  expect(getChartYTicks(ordinary, 'wind')).toEqual([0, 5, 10, 15]);

  const atLimit = alignWindDomain({ y: [0, 16] }, 'wind', 15);
  expect(atLimit.y).toEqual([0, 20]);
  expect(getChartYTicks(atLimit, 'wind')).toEqual([0, 5, 10, 15, 20]);

  const strong = alignWindDomain({ y: [0, 35] }, 'wind', 34);
  expect(strong.y).toEqual([0, 40]);
  expect(getChartYTicks(strong, 'wind')).toEqual([0, 10, 20, 30, 40]);
});

test('uses ten-hPa pressure ticks including for a narrow range', () => {
  const ordinary = alignPressureDomain({ y: [995, 1025] }, 'pressure', 'hPa');
  expect(ordinary.y).toEqual([990, 1030]);
  expect(getChartYTicks(ordinary, 'pressure', 'hPa')).toEqual([990, 1000, 1010, 1020, 1030]);

  const narrow = alignPressureDomain({ y: [1005, 1015] }, 'pressure', 'hPa');
  expect(narrow.y).toEqual([1000, 1020]);
  expect(getChartYTicks(narrow, 'pressure', 'hPa')).toEqual([1000, 1010, 1020]);
});

test('uses five-hPa pressure ticks for observations with a narrow range', () => {
  const narrow = alignPressureDomain({ y: [1005, 1015] }, 'pressure', 'hPa', true);
  expect(narrow.y).toEqual([1005, 1015]);
  expect(getChartYTicks(narrow, 'pressure', 'hPa', true)).toEqual([1005, 1010, 1015]);

  const broad = alignPressureDomain({ y: [990, 1030] }, 'pressure', 'hPa', true);
  expect(getChartYTicks(broad, 'pressure', 'hPa', true)).toEqual([990, 1000, 1010, 1020, 1030]);
});

test('uses a wider pressure step for a broad range and preserves other units', () => {
  const broad = alignPressureDomain({ y: [980, 1060] }, 'pressure', 'mbar');
  expect(getChartYTicks(broad, 'pressure', 'mbar')).toEqual([980, 1000, 1020, 1040, 1060]);
  expect(alignPressureDomain({ y: [29.5, 30.5] }, 'pressure', 'inHg').y).toEqual([29.5, 30.5]);
  expect(getChartYTicks({ y: [29.5, 30.5] }, 'pressure', 'inHg')).toHaveLength(6);
});
