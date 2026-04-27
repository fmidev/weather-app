import React from 'react';
import { ScrollView } from 'react-native';
import { render } from '@testing-library/react-native';

import NextHoursForecast from '../../src/components/weather/NextHoursForecast';

const mockHourForecast = jest.fn();
let mockWindowDimensions = {
  width: 390,
  height: 800,
  fontScale: 1,
  scale: 1,
};
let mockInsets = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectLoading: jest.fn(),
  selectNextHoursForecast: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets,
}));

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return Object.create(ReactNative, {
    useWindowDimensions: {
      value: () => mockWindowDimensions,
      configurable: true,
    },
  });
});

jest.mock('../../src/components/weather/forecast/HourForecast', () => ({
  __esModule: true,
  default: (props: any) => {
    mockHourForecast(props);
    const { Text } = require('react-native');
    return (
      <Text testID={`hour-forecast-${props.timeStep.epochtime}`}>
        {props.timeStep.epochtime}
      </Text>
    );
  },
}));

const makeForecast = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ epochtime: index + 1 }));

describe('NextHoursForecast', () => {
  beforeEach(() => {
    mockHourForecast.mockClear();
    mockWindowDimensions = {
      width: 390,
      height: 800,
      fontScale: 1,
      scale: 1,
    };
    mockInsets = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
  });

  it('renders loading indicator without forecast data', () => {
    const view = render(
      <NextHoursForecast
        loading
        forecast={undefined as any}
        currentHour={12}
      />
    );

    expect(view.getByA11yLabel('weather:loading')).toBeTruthy();
  });

  it('renders phone layout inside horizontal scroll and skips current hour', () => {
    const view = render(
      <NextHoursForecast
        loading={false}
        forecast={makeForecast(15) as any}
        currentHour={12}
      />
    );

    expect(view.UNSAFE_getByType(ScrollView)).toBeTruthy();
    expect(view.queryByTestId('hour-forecast-1')).toBeNull();
    expect(view.getByTestId('hour-forecast-2')).toBeTruthy();
    expect(view.getByTestId('hour-forecast-13')).toBeTruthy();
    expect(view.queryByTestId('hour-forecast-14')).toBeNull();
    expect(mockHourForecast).toHaveBeenCalledTimes(12);
  });

  it('renders wide layout count based on safe area width', () => {
    mockWindowDimensions = {
      width: 700,
      height: 900,
      fontScale: 1,
      scale: 1,
    };
    mockInsets = {
      left: 20,
      right: 50,
      top: 0,
      bottom: 0,
    };

    const view = render(
      <NextHoursForecast
        loading={false}
        forecast={makeForecast(20) as any}
        currentHour={12}
      />
    );

    expect(view.UNSAFE_queryByType(ScrollView)).toBeNull();
    expect(mockHourForecast).toHaveBeenCalledTimes(9);
    expect(view.getByTestId('hour-forecast-10')).toBeTruthy();
    expect(view.queryByTestId('hour-forecast-11')).toBeNull();
  });
});
