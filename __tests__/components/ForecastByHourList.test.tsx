import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ForecastByHourList from '../../src/components/weather/forecast/ForecastByHourList';
import * as constants from '../../src/store/forecast/constants';

const mockForecastListColumn = jest.fn();
const mockForecastListHeaderColumn = jest.fn();
const mockScrollToIndex = jest.fn();

jest.mock('react-native', () => {
  const ReactActual = require('react');
  const ReactNative = jest.requireActual('react-native');

  const MockVirtualizedList = ReactActual.forwardRef((props: any, ref: any) => {
    ReactActual.useImperativeHandle(ref, () => ({
      scrollToIndex: mockScrollToIndex,
    }));

    return (
      <ReactNative.ScrollView testID="virtualized-list" onScroll={props.onScroll}>
        {props.data.map((item: any, index: number) =>
          ReactActual.createElement(
            ReactActual.Fragment,
            {
              key: props.keyExtractor
                ? props.keyExtractor(item, index)
                : `${index}`,
            },
            props.renderItem({ item, index })
          )
        )}
      </ReactNative.ScrollView>
    );
  });

  return Object.create(ReactNative, {
    VirtualizedList: {
      value: MockVirtualizedList,
      configurable: true,
    },
  });
});

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
      border: '#cccccc',
      hourListText: '#111111',
      listTint: '#eeeeee',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: ({ children, style }: any) => {
    const { View } = require('react-native');
    const side = Array.isArray(style) && style.some((entry) => entry?.left === 52)
      ? 'left'
      : 'right';
    return <View testID={`gradient-${side}`}>{children}</View>;
  },
}));

jest.mock('@assets/Icon', () => ({
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

jest.mock('@utils/helpers', () => ({
  isOdd: (value: number) => value % 2 === 1,
}));

jest.mock('../../src/components/weather/forecast/ForecastListColumn', () => ({
  __esModule: true,
  default: (props: any) => {
    mockForecastListColumn(props);
    const { Text } = require('react-native');
    return <Text testID={`forecast-column-${props.data.epochtime}`}>{props.data.epochtime}</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/ForecastListHeaderColumn', () => ({
  __esModule: true,
  default: (props: any) => {
    mockForecastListHeaderColumn(props);
    const { Text } = require('react-native');
    return <Text testID="forecast-header-column">{props.displayParams.length}</Text>;
  },
}));

const makeData = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    epochtime: 2000000000 + index * 3600,
    sunrise: '2033-05-18T03:00:00',
    sunset: '2033-05-18T21:00:00',
    dayLength: 1080,
  }));

describe('ForecastByHourList', () => {
  beforeEach(() => {
    mockForecastListColumn.mockClear();
    mockForecastListHeaderColumn.mockClear();
    mockScrollToIndex.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when list is closed', () => {
    const view = render(
      <ForecastByHourList
        data={makeData(3) as any}
        isOpen={false}
        activeDayIndex={0}
        setActiveDayIndex={jest.fn()}
        currentDayOffset={0}
        currentHour={12}
        clockType={24 as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        units={{} as any}
      />
    );

    expect(view.toJSON()).toBeNull();
  });

  it('renders header, columns, gradients and day duration row', () => {
    const view = render(
      <ForecastByHourList
        data={makeData(4) as any}
        isOpen
        activeDayIndex={0}
        setActiveDayIndex={jest.fn()}
        currentDayOffset={0}
        currentHour={12}
        clockType={24 as any}
        displayParams={[
          [0, constants.TEMPERATURE],
          [1, constants.DAY_LENGTH],
        ] as any}
        units={{ temperature: { unitAbb: 'C' } } as any}
      />
    );

    expect(view.getByTestId('forecast-header-column')).toBeTruthy();
    expect(view.getByTestId('forecast-column-2000000000')).toBeTruthy();
    expect(view.getByTestId('forecast_table')).toBeTruthy();
    expect(view.getByText('18 h 0 min')).toBeTruthy();
    expect(view.getByTestId('gradient-left')).toBeTruthy();
    expect(view.getByTestId('gradient-right')).toBeTruthy();
    expect(mockForecastListHeaderColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        displayParams: [
          [0, constants.TEMPERATURE],
          [1, constants.DAY_LENGTH],
        ],
      })
    );
    expect(mockForecastListColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        clockType: 24,
        displayParams: [
          [0, constants.TEMPERATURE],
          [1, constants.DAY_LENGTH],
        ],
      })
    );
  });

  it('updates active day on horizontal scroll', () => {
    const setActiveDayIndex = jest.fn();
    const view = render(
      <ForecastByHourList
        data={makeData(48) as any}
        isOpen
        activeDayIndex={0}
        setActiveDayIndex={setActiveDayIndex}
        currentDayOffset={0}
        currentHour={12}
        clockType={24 as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        units={{} as any}
      />
    );

    fireEvent.scroll(view.getByTestId('virtualized-list'), {
      nativeEvent: {
        contentOffset: { x: 52 * 23, y: 0 },
      },
    });

    expect(setActiveDayIndex).toHaveBeenCalledWith(1);
  });

  it('scrolls to active day index when active day changes', () => {
    render(
      <ForecastByHourList
        data={makeData(50) as any}
        isOpen
        activeDayIndex={2}
        setActiveDayIndex={jest.fn()}
        currentDayOffset={3}
        currentHour={12}
        clockType={24 as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        units={{} as any}
      />
    );

    expect(mockScrollToIndex).toHaveBeenCalledWith({
      index: 27,
      animated: false,
    });
  });
});
