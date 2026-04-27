import React from 'react';
import { FlatList } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import ParameterSelector from '../../src/components/weather/common/ParameterSelector';

const mockTrackMatomoEvent = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      timeStepBackground: '#ddeeff',
      inputButtonBackground: '#ffffff',
      chartSecondaryLine: '#2255aa',
      secondaryBorder: '#cccccc',
      primaryText: '#111111',
      hourListText: '#444444',
    },
    dark: false,
  }),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Pressable } = require('react-native');
    return <Pressable {...props}>{children}</Pressable>;
  },
}));

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: ({ children, style }: any) => {
    const { View } = require('react-native');
    const side = Array.isArray(style) && style.some((entry) => entry?.left === 0)
      ? 'left'
      : Array.isArray(style) && style.some((entry) => entry?.right === 0)
        ? 'right'
        : 'unknown';
    return (
      <View testID={`gradient-${side}`}>
        {children}
      </View>
    );
  },
}));

describe('ParameterSelector', () => {
  beforeEach(() => {
    mockTrackMatomoEvent.mockClear();
  });

  it('renders chart type buttons and handles parameter change', () => {
    const setParameter = jest.fn();
    const { getByLabelText, getByText } = render(
      <ParameterSelector
        chartTypes={['temperature', 'wind', 'pressure'] as any}
        parameter={'wind' as any}
        setParameter={setParameter}
      />
    );

    expect(getByText('weather:charts:temperature')).toBeTruthy();
    expect(getByText('weather:charts:wind')).toBeTruthy();
    expect(getByText('weather:charts:pressure')).toBeTruthy();

    fireEvent.press(
      getByLabelText('weather:parameter: weather:charts:temperature')
    );

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Selected OBSERVATIONS parameter'
    );
    expect(setParameter).toHaveBeenCalledWith('temperature');
  });

  it('shows left and right gradients based on flatlist onScroll props', () => {
    const view = render(
      <ParameterSelector
        chartTypes={['temperature', 'wind', 'pressure'] as any}
        parameter={'temperature' as any}
        setParameter={jest.fn()}
      />
    );

    expect(view.queryByTestId('gradient-left')).toBeNull();
    expect(view.queryByTestId('gradient-right')).toBeNull();

    const flatList = view.UNSAFE_getByType(FlatList);
    fireEvent(flatList, 'scroll', {
      nativeEvent: {
        contentOffset: { x: 30, y: 0 },
        layoutMeasurement: { width: 100, height: 40 },
        contentSize: { width: 300, height: 40 },
      },
    });

    expect(view.getByTestId('gradient-left')).toBeTruthy();
    expect(view.getByTestId('gradient-right')).toBeTruthy();
  });
});
