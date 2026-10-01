import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import ChartYAxis from '@components/weather/charts-xl/ChartYAxis';

jest.mock('@config', () => ({
  Config: { get: () => ({ units: { precipitation: 'mm', pressure: 'hPa' } }) },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { hourListText: '#111' } }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@components/common/MacContentSizeContext', () => ({
  useIsRunningOnMac: () => false,
}));

jest.mock('@utils/chart', () => ({
  chartYLabelText: () => ['°C', ''],
}));

test('positions temperature labels at the actual Victory scale coordinates', () => {
  const scale = { domain: [-6, 16], range: [248, 20] } as {
    domain: [number, number]; range: [number, number];
  };
  const { getByText } = render(
    <ChartYAxis
      chartType="temperature"
      domain={{ y: [-5, 15] }}
      yScale={scale}
      observation={false}
      precipitationMaximum={5}
    />
  );

  const tickFontSize = StyleSheet.flatten(getByText('15').props.style).fontSize;
  const titleFontSize = StyleSheet.flatten(getByText('°C').props.style).fontSize;
  expect(tickFontSize).toBeGreaterThan(titleFontSize);

  [15, 10, 5, 0, -5].forEach((tick) => {
    const style = StyleSheet.flatten(getByText(String(tick)).props.style);
    const actualCenter = style.top + style.fontSize / 2;
    const expectedCenter = scale.range[0] +
      (tick - scale.domain[0]) / (scale.domain[1] - scale.domain[0]) *
      (scale.range[1] - scale.range[0]);
    expect(actualCenter).toBeCloseTo(expectedCenter);
  });
});

test('shows five-hPa labels for a narrow pressure observation range', () => {
  const { getByText, queryByText } = render(
    <ChartYAxis
      chartType="pressure"
      domain={{ y: [1005, 1015] }}
      yScale={{ domain: [1004, 1016], range: [248, 20] }}
      observation
      precipitationMaximum={5}
    />
  );

  expect(getByText('1005')).toBeTruthy();
  expect(getByText('1010')).toBeTruthy();
  expect(getByText('1015')).toBeTruthy();
  expect(queryByText('1000')).toBeNull();
});
