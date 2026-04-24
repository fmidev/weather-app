import React from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import MapView from '../../src/components/warnings/cap/MapView';

const mockConfigGet = jest.fn();
const mockGetSeveritiesForDays = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/warnings/selectors', () => ({
  selectLoading: jest.fn(),
}));

jest.mock('@utils/helpers', () => ({
  getSeveritiesForDays: (...args: any[]) => mockGetSeveritiesForDays(...args),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0066cc',
    },
    dark: false,
  }),
}));

jest.mock('react-native-maps', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');

  const MockMap = ReactLib.forwardRef(({ children, ...props }: any, ref: any) => (
    <View ref={ref} {...props}>
      {children}
    </View>
  ));
  const Polygon = ({ coordinates, fillColor }: any) => (
    <View testID={`polygon-${fillColor}-${coordinates.length}`} />
  );

  return {
    __esModule: true,
    default: MockMap,
    Polygon,
  };
});

jest.mock('../../src/components/warnings/cap/DaySelectorList', () => ({
  __esModule: true,
  default: ({ onDayChange, activeDay, dailySeverities }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="day-selector" onPress={() => onDayChange(1)}>
        <Text>{`${activeDay}-${dailySeverities.length}`}</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/warnings/cap/WarningTypeFiltersList', () => ({
  __esModule: true,
  default: ({ warnings, onWarningTypePress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="warning-filter" onPress={() => onWarningTypePress(warnings[0])}>
        <Text>{warnings.length}</Text>
      </Pressable>
    );
  },
}));

describe('MapView', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    mockConfigGet.mockReset();
    mockGetSeveritiesForDays.mockReset();
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return {
          capViewSettings: {
            mapHeight: 300,
            initialRegion: { latitude: 60, longitude: 24, latitudeDelta: 1, longitudeDelta: 1 },
            mapToolbarEnabled: false,
            mapScrollEnabled: true,
            mapZoomEnabled: true,
          },
        };
      }
      return {};
    });
    mockGetSeveritiesForDays.mockReturnValue([
      [0, 1, 0, 0],
      [0, 0, 2, 0],
    ]);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
    });
  });

  it('renders loading indicator while map data is loading', () => {
    expect(render(
      <MapView
        loading
        dates={[
          { time: new Date('2024-01-01T12:00:00Z').getTime(), weekday: 'Mon', date: '1 Jan', relativeDay: 'Today' },
        ]}
        capData={[]}
      />
    ).UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders polygons, day selector and supports filter toggling', () => {
    const warning = {
      identifier: 'wind-1',
      info: {
        event: 'Wind',
        severity: 'Severe',
        effective: '2024-01-01T00:00:00Z',
        expires: '2099-01-03T00:00:00Z',
        area: {
          polygon: '60,24 60.1,24 60.1,24.1 60,24.1',
        },
      },
    };

    const { getByTestId, queryAllByTestId } = render(
      <MapView
        loading={false}
        dates={[
          { time: new Date('2024-01-01T12:00:00Z').getTime(), weekday: 'Mon', date: '1 Jan', relativeDay: 'Today' },
          { time: new Date('2024-01-02T12:00:00Z').getTime(), weekday: 'Tue', date: '2 Jan', relativeDay: 'Tomorrow' },
        ]}
        capData={[warning] as any}
      />
    );

    expect(getByTestId('day-selector')).toBeTruthy();
    expect(getByTestId('warning-filter')).toBeTruthy();
    expect(queryAllByTestId('polygon-#FFCB5F-4')).toHaveLength(1);

    fireEvent.press(getByTestId('warning-filter'));
    expect(queryAllByTestId('polygon-#FFCB5F-4')).toHaveLength(0);

    fireEvent.press(getByTestId('day-selector'));
  });
});
