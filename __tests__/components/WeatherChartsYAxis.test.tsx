import React from 'react';
import * as ReactNative from 'react-native';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import ChartYAxis from '@components/weather/charts/ChartYAxis';
import { MacContentSizeProvider } from '@components/common/MacContentSizeContext';

jest.mock('@config', () => ({
  Config: { get: () => ({ units: { precipitation: 'mm', pressure: 'hPa' } }) },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { hourListText: '#111' } }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) =>
    key === 'weather:charts:totalCloudCover' ? 'Total cloud cover' : key }),
}));

jest.mock('@utils/chart', () => ({
  chartYLabelText: (type: string) => type === 'visCloud'
    ? ['km', 'weather:charts:totalCloudCover'] : ['°C', 'mm'],
}));

afterEach(() => jest.restoreAllMocks());

test.each([
  [false, 1], [false, 2], [false, 3],
  [true, 1], [true, 2], [true, 3],
])('scales labels once on Mac=%s at font scale %s', (isRunningOnMac, fontScale) => {
  jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
    width: 390, height: 844, scale: 3, fontScale,
  });
  const view = render(
    <MacContentSizeProvider isRunningOnMac={isRunningOnMac} isPlatformDetectionComplete>
      <ChartYAxis
        chartType="temperature"
        domain={{ y: [-5, 15] }}
        yScale={{ domain: [-5, 15], range: [248, 40] }}
        observation={false}
        precipitationMaximum={5}
      />
    </MacContentSizeProvider>
  );

  const platformMultiplier = isRunningOnMac ? 1.3 : 1;
  const tick = view.getByText('15');
  const title = view.getByText('°C');
  const tickStyle = StyleSheet.flatten(tick.props.style);
  const titleStyle = StyleSheet.flatten(title.props.style);
  expect(tick.props.allowFontScaling).toBe(true);
  expect(title.props.allowFontScaling).toBe(true);
  expect(tickStyle.fontSize).toBeCloseTo(14 * platformMultiplier);
  expect(titleStyle.fontSize).toBeCloseTo(13 * platformMultiplier);
  // These are the inputs to native Text scaling, including AppText's Mac adjustment.
  expect(tickStyle.fontSize * Math.min(fontScale, tick.props.maxFontSizeMultiplier))
    .toBeCloseTo(Math.min(14 * platformMultiplier * fontScale, 20));
  expect(titleStyle.fontSize * Math.min(fontScale, title.props.maxFontSizeMultiplier))
    .toBeCloseTo(Math.min(13 * platformMultiplier * fontScale, 18));

  fireEvent(tick, 'layout', { nativeEvent: { layout: { height: 24 } } });
  const measuredStyle = StyleSheet.flatten(view.getByText('15').props.style);
  expect(measuredStyle.top + 12).toBe(40);
});

test('aligns precipitation zero with temperature zero and hides negative precipitation ticks', () => {
  const props = {
    chartType: 'weather' as const,
    domain: { y: [-5, 20] as [number, number] },
    yScale: { domain: [-5, 20] as [number, number], range: [250, 50] as [number, number] },
    observation: true,
    precipitationMaximum: 5,
  };
  const temperature = render(<ChartYAxis {...props} />);
  const precipitation = render(<ChartYAxis {...props} right secondaryDomain={{ y: [0, 4] }} />);

  const temperatureZero = StyleSheet.flatten(temperature.getByText('0').props.style);
  const precipitationZero = StyleSheet.flatten(precipitation.getByText('0').props.style);
  expect(precipitationZero.top).toBe(temperatureZero.top);
  expect(precipitation.queryByText('-1')).toBeNull();
  [0, 1, 2, 3, 4].forEach((amount) => {
    const rainStyle = StyleSheet.flatten(precipitation.getByText(String(amount)).props.style);
    const temperatureStyle = StyleSheet.flatten(temperature.getByText(String(amount * 5)).props.style);
    expect(rainStyle.top).toBe(temperatureStyle.top);
  });
});

test.each([1, 2])('reserves room for a multiline title at font scale %s', (fontScale) => {
  jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
    width: 390, height: 844, scale: 3, fontScale,
  });
  const onTopPaddingChange = jest.fn();
  const props = {
    chartType: 'visCloud' as const,
    domain: { y: [0, 1] as [number, number] },
    observation: true,
    right: true,
    precipitationMaximum: 5,
    onTopPaddingChange,
  };
  const view = render(
    <ChartYAxis {...props} yScale={{ domain: [0, 1], range: [248, 20] }} />
  );
  const title = view.getByText('total cloud cover');
  expect(StyleSheet.flatten(title.props.style).height).toBeUndefined();
  const titleHeight = 54 * fontScale;
  const tickHeight = 20 * fontScale;
  fireEvent(title, 'layout', { nativeEvent: { layout: { height: titleHeight } } });
  fireEvent(view.getByText('8/8'), 'layout', {
    nativeEvent: { layout: { height: tickHeight } },
  });

  const topPadding = onTopPaddingChange.mock.calls.at(-1)[0];
  view.rerender(
    <ChartYAxis {...props} yScale={{ domain: [0, 1], range: [248, topPadding] }} />
  );
  const topTickStyle = StyleSheet.flatten(view.getByText('8/8').props.style);
  expect(topTickStyle.top).toBeGreaterThanOrEqual(titleHeight + 8);

  // Reclaim the title space when this secondary axis is no longer shown.
  view.rerender(<ChartYAxis {...props} secondaryParameterMissing />);
  expect(onTopPaddingChange).toHaveBeenLastCalledWith(0);
});

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
