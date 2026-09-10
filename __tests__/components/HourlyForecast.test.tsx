import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FlatList } from 'react-native';

import HourlyForecast from '../../src/components/weather/forecast/HourlyForecast';
import * as constants from '../../src/store/forecast/constants';

let mockBackground = '#ffffff';
let mockDark = false;
const mockForecastListColumn = jest.fn();
const mockForecastListHeaderColumn = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectDisplayParams: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
  selectUnits: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#111111',
      background: mockBackground,
    },
    dark: mockDark,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient" {...props}>{children}</View>;
  },
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@config', () => ({
  Config: {
    get: (key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            excludeDayLength: false,
            excludeDayDuration: false,
            excludePolarNightAndMidnightSun: false,
          },
        };
      }
      return {};
    },
  },
}));

jest.mock('../../src/components/weather/forecast/ForecastListColumn', () => ({
  __esModule: true,
  default: (props: any) => {
    mockForecastListColumn(props);
    const { Text } = require('react-native');
    return (
      <Text testID={`forecast-column-${props.data.epochtime}`}>
        {props.data.epochtime}
      </Text>
    );
  },
}));

jest.mock(
  '../../src/components/weather/forecast/ForecastListHeaderColumn',
  () => ({
    __esModule: true,
    default: (props: any) => {
      mockForecastListHeaderColumn(props);
      const { Text } = require('react-native');
      return (
        <Text testID="forecast-header-column">
          {props.displayParams.length}
        </Text>
      );
    },
  })
);

const makeData = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    epochtime: 2000000000 + index * 3600,
    localtime: `2033-05-18T${index.toString().padStart(2, '0')}:00:00`,
    sunrise: '2033-05-18T03:00:00',
    sunset: '2033-05-18T21:00:00',
    dayLength: 1080,
  }));

describe('HourlyForecast', () => {
  beforeEach(() => {
    mockBackground = '#ffffff';
    mockDark = false;
    mockForecastListColumn.mockClear();
    mockForecastListHeaderColumn.mockClear();
  });

  it('returns null without data', () => {
    const view = render(
      <HourlyForecast
        data={undefined as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
      />
    );

    expect(view.toJSON()).toBeNull();
  });

  it('renders the compact hourly table and day duration', () => {
    const displayParams = [
      [0, constants.TEMPERATURE],
      [1, constants.DAY_LENGTH],
    ];

    const view = render(
      <HourlyForecast
        data={makeData(3) as any}
        displayParams={displayParams as any}
        clockType={24 as any}
        units={{ temperature: { unitAbb: 'C' } } as any}
      />
    );

    expect(view.getByTestId('forecast-header-column')).toBeTruthy();
    expect(view.getByTestId('forecast-column-2000000000')).toBeTruthy();
    expect(view.getByTestId('day_duration')).toBeTruthy();
    expect(view.getByText('18 h 0 min')).toBeTruthy();
    expect(mockForecastListHeaderColumn).toHaveBeenCalledWith(
      expect.objectContaining({ displayParams, compact: true })
    );
    expect(mockForecastListColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        clockType: 24,
        displayParams,
        compact: true,
      })
    );
  });

  it('omits day duration when it is not configured', () => {
    const view = render(
      <HourlyForecast
        data={makeData(3) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
      />
    );

    expect(view.queryByTestId('day_duration')).toBeNull();
  });

  it('starts the hourly list at the requested hour when it is available', () => {
    const view = render(
      <HourlyForecast
        data={makeData(12) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
        initialScrollHour={8}
      />
    );

    const list = view.UNSAFE_getByType(FlatList);

    expect(list.props.initialScrollIndex).toBe(8);
    expect(list.props.getItemLayout(undefined, 8)).toEqual({
      index: 8,
      length: 62,
      offset: 496,
    });
  });

  it('does not set an initial index when the requested hour is unavailable', () => {
    const view = render(
      <HourlyForecast
        data={makeData(3) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
        initialScrollHour={8}
      />
    );

    expect(
      view.UNSAFE_getByType(FlatList).props.initialScrollIndex
    ).toBeUndefined();
  });

  it.each([
    [0, false, true],
    [200, true, true],
    [700, true, false],
    [-20, false, true],
    [720, true, false],
  ])('shows available scroll directions at offset %s', (offset, left, right) => {
    const view = render(
      <HourlyForecast
        data={makeData(24) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
        initialScrollHour={8}
      />
    );

    fireEvent.scroll(view.getByTestId('hourly-forecast-list'), {
      nativeEvent: {
        contentOffset: { x: offset, y: 0 },
        contentSize: { width: 1000, height: 200 },
        layoutMeasurement: { width: 300, height: 200 },
      },
    });

    expect(!!view.queryByTestId('hourly-forecast-left-fade')).toBe(left);
    expect(!!view.queryByTestId('hourly-forecast-right-fade')).toBe(right);
  });

  it('updates fades on layout and content changes without scrolling', () => {
    const view = render(
      <HourlyForecast
        data={makeData(24) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
      />
    );
    const list = view.getByTestId('hourly-forecast-list');
    const layout = (width: number) =>
      fireEvent(list, 'layout', {
        nativeEvent: { layout: { width, height: 200, x: 0, y: 0 } },
      });

    expect(view.queryByTestId('hourly-forecast-left-fade')).toBeNull();
    expect(view.queryByTestId('hourly-forecast-right-fade')).toBeNull();
    fireEvent(list, 'contentSizeChange', 1000, 200);
    layout(300);
    expect(view.queryByTestId('hourly-forecast-left-fade')).toBeNull();
    expect(view.getByTestId('hourly-forecast-right-fade')).toBeTruthy();

    layout(1200);
    expect(view.queryByTestId('hourly-forecast-left-fade')).toBeNull();
    expect(view.queryByTestId('hourly-forecast-right-fade')).toBeNull();

    layout(300);
    expect(view.getByTestId('hourly-forecast-right-fade')).toBeTruthy();
    fireEvent(list, 'contentSizeChange', 200, 200);
    expect(view.queryByTestId('hourly-forecast-left-fade')).toBeNull();
    expect(view.queryByTestId('hourly-forecast-right-fade')).toBeNull();
  });

  it.each([
    { background: '#ffffff', rgb: '255, 255, 255', dark: false },
    { background: '#000000', rgb: '0, 0, 0', dark: true },
    { background: '#0F0F2D', rgb: '15, 15, 45', dark: true },
  ])('uses theme background $background for decorative fades', ({ background, rgb, dark }) => {
    mockBackground = background;
    mockDark = dark;
    const view = render(
      <HourlyForecast
        data={makeData(24) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
      />
    );
    fireEvent.scroll(view.getByTestId('hourly-forecast-list'), {
      nativeEvent: {
        contentOffset: { x: 200, y: 0 },
        contentSize: { width: 1000, height: 200 },
        layoutMeasurement: { width: 300, height: 200 },
      },
    });

    const left = view.getByTestId('hourly-forecast-left-fade');
    const right = view.getByTestId('hourly-forecast-right-fade');
    const transparent = `rgba(${rgb}, 0)`;
    const expectedColors = dark
      ? [background, `rgba(${rgb}, 0.65)`, transparent]
      : [background, transparent];
    expect(left.props.colors).toEqual(expectedColors);
    expect(right.props.colors).toEqual([...expectedColors].reverse());
    expect(left.props.locations).toEqual(dark ? [0, 0.45, 1] : undefined);
    expect(right.props.locations).toEqual(dark ? [0, 0.55, 1] : undefined);
    [left, right].forEach((fade) => {
      expect(fade.props.pointerEvents).toBe('none');
      expect(fade.props.accessible).toBe(false);
      expect(fade.props.accessibilityElementsHidden).toBe(true);
      expect(fade.props.importantForAccessibility).toBe('no-hide-descendants');
    });
  });

});
