import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ModalForecast from '../../src/components/weather/forecast/ModalForecast';
import * as constants from '../../src/store/forecast/constants';

const mockForecastListColumn = jest.fn();
const mockForecastListHeaderColumn = jest.fn();
const mockScrollToIndex = jest.fn();
const mockTimeSelectButtonGroup = jest.fn();
let mockWindowDimensions = {
  width: 390,
  height: 700,
  fontScale: 1,
  scale: 1,
};

jest.mock('react-native', () => {
  const ReactActual = require('react');
  const ReactNative = jest.requireActual('react-native');

  const MockFlatList = ReactActual.forwardRef((props: any, ref: any) => {
    ReactActual.useImperativeHandle(ref, () => ({
      scrollToIndex: mockScrollToIndex,
    }));

    return (
      <ReactNative.ScrollView testID="flat-list" onScroll={props.onScroll}>
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
    FlatList: {
      value: MockFlatList,
      configurable: true,
    },
    useWindowDimensions: {
      value: () => mockWindowDimensions,
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
      hourListText: '#111111',
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
  default: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient">{children}</View>;
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

jest.mock('../../src/components/weather/forecast/ForecastListHeaderColumn', () => ({
  __esModule: true,
  default: (props: any) => {
    mockForecastListHeaderColumn(props);
    const { Text } = require('react-native');
    return <Text testID="forecast-header-column">{props.displayParams.length}</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/TimeSelectButtonGroup', () => ({
  __esModule: true,
  default: (props: any) => {
    mockTimeSelectButtonGroup(props);
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID="time-select"
        onPress={() => props.onTimeSelect(12)}>
        <Text>{`${props.startHour}-${props.endHour}-${props.selectedHour}`}</Text>
      </Pressable>
    );
  },
}));

const makeData = (count: number, startHour = 0) =>
  Array.from({ length: count }, (_, index) => {
    const hour = startHour + index;

    return {
      epochtime: 2000000000 + index * 3600,
      localtime: `xxxxxxxxx${hour.toString().padStart(2, '0')}`,
      sunrise: '2033-05-18T03:00:00',
      sunset: '2033-05-18T21:00:00',
      dayLength: 1080,
    };
  });

describe('ModalForecast', () => {
  beforeEach(() => {
    mockForecastListColumn.mockClear();
    mockForecastListHeaderColumn.mockClear();
    mockScrollToIndex.mockClear();
    mockTimeSelectButtonGroup.mockClear();
    mockWindowDimensions = {
      width: 390,
      height: 700,
      fontScale: 1,
      scale: 1,
    };
  });

  it('returns null without data', () => {
    const view = render(
      <ModalForecast
        data={undefined as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
      />
    );

    expect(view.toJSON()).toBeNull();
  });

  it('renders modal forecast table, day duration and scrolls to start', () => {
    const displayParams = [
      [0, constants.TEMPERATURE],
      [1, constants.DAY_LENGTH],
    ];

    const view = render(
      <ModalForecast
        data={makeData(3) as any}
        displayParams={displayParams as any}
        clockType={24 as any}
        units={{ temperature: { unitAbb: 'C' } } as any}
        initialPosition="start"
      />
    );

    expect(view.getByTestId('time-select')).toBeTruthy();
    expect(view.getByTestId('forecast-header-column')).toBeTruthy();
    expect(view.getByTestId('forecast-column-2000000000')).toBeTruthy();
    expect(view.getByTestId('day_duration')).toBeTruthy();
    expect(view.getByText('18 h 0 min')).toBeTruthy();
    expect(mockForecastListHeaderColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        displayParams,
        modal: true,
      })
    );
    expect(mockForecastListColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        clockType: 24,
        displayParams,
        modal: true,
      })
    );
    expect(mockScrollToIndex).toHaveBeenCalledWith({
      animated: false,
      index: 0,
      viewPosition: 0,
    });
  });

  it('scrolls to the last item when initial position is end', () => {
    render(
      <ModalForecast
        data={makeData(4) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
        initialPosition="end"
      />
    );

    expect(mockScrollToIndex).toHaveBeenCalledWith({
      animated: false,
      index: 3,
      viewPosition: 0,
    });
  });

  it('updates selected hour on horizontal scroll and scrolls when hour is selected', () => {
    const view = render(
      <ModalForecast
        data={makeData(24) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
        initialPosition="start"
      />
    );

    fireEvent.scroll(view.getByTestId('flat-list'), {
      nativeEvent: {
        contentOffset: { x: 48 * 2, y: 0 },
      },
    });

    expect(mockTimeSelectButtonGroup).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedHour: 2,
      })
    );

    fireEvent.press(view.getByTestId('time-select'));

    expect(mockScrollToIndex).toHaveBeenLastCalledWith({
      animated: false,
      index: 12,
      viewPosition: 0,
    });
  });

  it('omits time selector on wide displays and omits day duration when not configured', () => {
    mockWindowDimensions = {
      width: 700,
      height: 700,
      fontScale: 1,
      scale: 1,
    };

    const view = render(
      <ModalForecast
        data={makeData(3) as any}
        displayParams={[[0, constants.TEMPERATURE]] as any}
        clockType={24 as any}
        units={{} as any}
        initialPosition="start"
      />
    );

    expect(view.queryByTestId('time-select')).toBeNull();
    expect(view.queryByTestId('day_duration')).toBeNull();
  });
});
