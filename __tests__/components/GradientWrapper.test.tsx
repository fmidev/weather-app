import React from 'react';
import { render } from '@testing-library/react-native';

import GradientWrapper from '../../src/components/weather/GradientWrapper';
import { HOT, WHITE } from '../../src/assets/colors';

const mockConfigGet = jest.fn();
let mockTheme = {
  colors: {
    background: '#101010',
    screenBackground: '#eeeeee',
  },
  dark: false,
};

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectLoading: jest.fn(),
  selectNextHourForecast: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: ({ children, colors, start, end, style }: any) => {
    const { View } = require('react-native');
    return (
      <View
        testID="linear-gradient"
        data-colors={colors}
        data-start={start}
        data-end={end}
        style={style}>
        {children}
      </View>
    );
  },
}));

describe('GradientWrapper', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockTheme = {
      colors: {
        background: '#101010',
        screenBackground: '#eeeeee',
      },
      dark: false,
    };
    mockConfigGet.mockReturnValue({ layout: 'default' });
  });

  it('renders children inside temperature based light gradient', () => {
    const view = render(
      <GradientWrapper nextHourForecast={{ temperature: 26 } as any}>
        <GradientWrapperChild />
      </GradientWrapper>
    );

    const gradient = view.getByTestId('linear-gradient');
    expect(view.getByText('content')).toBeTruthy();
    expect(gradient.props['data-colors']).toEqual([HOT, WHITE]);
    expect(gradient.props['data-start']).toEqual({ x: 0.5, y: 0 });
    expect(gradient.props['data-end']).toEqual({ x: 0.5, y: 1 });
  });

  it('uses dark theme background colors in dark mode', () => {
    mockTheme = {
      colors: {
        background: '#000000',
        screenBackground: '#eeeeee',
      },
      dark: true,
    };

    const view = render(
      <GradientWrapper nextHourForecast={{ temperature: 26 } as any}>
        <GradientWrapperChild />
      </GradientWrapper>
    );

    expect(view.getByTestId('linear-gradient').props['data-colors']).toEqual([
      '#000000',
      '#000000',
    ]);
  });

  it('renders children without gradient in legacy layout', () => {
    mockConfigGet.mockReturnValue({ layout: 'legacyWithoutBackgroundColor' });

    const view = render(
      <GradientWrapper nextHourForecast={{ temperature: 26 } as any}>
        <GradientWrapperChild />
      </GradientWrapper>
    );

    expect(view.getByText('content')).toBeTruthy();
    expect(view.queryByTestId('linear-gradient')).toBeNull();
  });

  it('falls back to screen background when temperature is missing', () => {
    const view = render(
      <GradientWrapper nextHourForecast={{} as any}>
        <GradientWrapperChild />
      </GradientWrapper>
    );

    expect(view.getByTestId('linear-gradient').props['data-colors']).toEqual([
      '#eeeeee',
      WHITE,
    ]);
  });
});

const GradientWrapperChild = () => {
  const { Text } = require('react-native');
  return <Text>content</Text>;
};
