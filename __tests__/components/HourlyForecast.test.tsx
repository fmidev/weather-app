import React from 'react';
import { render } from '@testing-library/react-native';

import HourlyForecast from '../../src/components/weather/forecast/HourlyForecast';
import * as constants from '../../src/store/forecast/constants';

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

const makeData = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    epochtime: 2000000000 + index * 3600,
    localtime: `xxxxxxxxx${index.toString().padStart(2, '0')}`,
    sunrise: '2033-05-18T03:00:00',
    sunset: '2033-05-18T21:00:00',
    dayLength: 1080,
  }));

describe('HourlyForecast', () => {
  beforeEach(() => {
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
});
