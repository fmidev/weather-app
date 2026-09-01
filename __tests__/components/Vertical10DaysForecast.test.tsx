import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import Vertical10DaysForecast from '../../src/components/weather/forecast/Vertical10DaysForecast';

const mockConfigGet = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();
const mockHourlyForecast = jest.fn();
let mockWeatherLayout = 'vertical';

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'forecast:showHourlyForecast') return 'Show hourly forecast';
      if (key === 'forecast:hideHourlyForecast') return 'Hide hourly forecast';
      if (key === 'forecast:precipitationMissing')
        return 'Missing precipitation';
      if (options?.value) return `${key}:${options.value}`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#111111',
      hourListText: '#444444',
      border: '#cccccc',
    },
    dark: false,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

jest.mock('@assets/images', () => ({
  weatherSymbolGetter: (symbol: string) => {
    const { Text } = require('react-native');
    return ({ width, height }: any) => (
      <Text testID={`weather-symbol-${symbol}`}>{`${width}-${height}`}</Text>
    );
  },
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
  getForecastParameterUnitTranslationKey: (...args: any[]) =>
    mockGetForecastParameterUnitTranslationKey(...args),
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleDate: () => 'Accessible date',
  formatAccessibleTemperature: (value: string) => value,
  uppercaseFirst: (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1),
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

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/PrecipitationStrip', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="precipitation-strip">strip</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/HourlyForecast', () => ({
  __esModule: true,
  default: (props: any) => {
    const { Text } = require('react-native');
    mockHourlyForecast(props);
    return <Text testID="hourly-forecast-content">forecast</Text>;
  },
}));

describe('Vertical10DaysForecast', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockClear();
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockGetForecastParameterUnitTranslationKey.mockReset();
    mockHourlyForecast.mockClear();
    mockWeatherLayout = 'vertical';

    jest
      .spyOn(require('react-native'), 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 800, fontScale: 1, scale: 1 });

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          layout: mockWeatherLayout,
          forecast: {
            data: [
              {
                parameters: ['temperature', 'windSpeedMS', 'precipitation1h'],
              },
            ],
          },
        };
      }
      if (key === 'settings') {
        return {
          units: {
            temperature: 'C',
            wind: 'm/s',
            precipitation: 'mm',
          },
        };
      }
      return {};
    });

    mockConverter.mockImplementation((_unit: string, value: any) => value);
    mockToPrecision.mockImplementation(
      (_type: string, _unit: string, value: any) => `${value}`
    );
    mockGetForecastParameterUnitTranslationKey.mockImplementation(
      (value: string) => value
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the hourly forecast below the selected day and collapses it', () => {
    const dayData = [
      {
        maxTemperature: 10,
        minTemperature: 4,
        minWindSpeed: 2,
        maxWindSpeed: 5,
        totalPrecipitation: 1.5,
        precipitationMissing: false,
        timeStamp: 2000000000,
        smartSymbol: 3,
        precipitationData: [{ precipitation: 1, timestamp: 2000000000 }],
      },
    ];
    const hourlyData = [{ epochtime: 2000000000 }];

    const { getByHintText, getByTestId, getByText, queryByTestId } = render(
      <Vertical10DaysForecast
        dayData={dayData as any}
        units={
          {
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
            precipitation: { unitAbb: 'mm' },
          } as any
        }
        invalidData={false}
        displayParams={[0, 1, 2] as any}
        showSingleHourlyForecast={false}
        forecastByDay={{ '18.5.': hourlyData } as any}
      />
    );

    expect(getByTestId('weather-symbol-3')).toBeTruthy();
    expect(getByText(/4°/)).toBeTruthy();
    expect(getByTestId('precipitation-strip')).toBeTruthy();
    expect(
      StyleSheet.flatten(getByTestId('daily-forecast-row-0').props.style)
        .borderBottomWidth
    ).toBe(1);

    fireEvent.press(getByHintText('Show hourly forecast'));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Show hourly forecast - day 1'
    );
    expect(getByTestId('hourly-forecast-0')).toBeTruthy();
    expect(getByTestId('hourly-forecast-content')).toBeTruthy();
    expect(
      StyleSheet.flatten(getByTestId('daily-forecast-row-0').props.style)
        .borderBottomWidth
    ).toBe(0);
    expect(mockHourlyForecast).toHaveBeenCalledWith({
      data: hourlyData,
      initialScrollHour: 8,
    });

    fireEvent.press(getByHintText('Hide hourly forecast'));
    expect(mockTrackMatomoEvent).toHaveBeenLastCalledWith(
      'User action',
      'Weather',
      'Hide hourly forecast - day 1'
    );
    expect(queryByTestId('hourly-forecast-0')).toBeNull();
  });

  it('keeps previously opened hourly forecasts expanded', () => {
    const firstTimestamp = 2000000000;
    const secondTimestamp = firstTimestamp + 24 * 60 * 60;
    const dayData = [firstTimestamp, secondTimestamp].map(
      (timeStamp, index) => ({
        maxTemperature: 10 + index,
        minTemperature: 4 + index,
        minWindSpeed: 2,
        maxWindSpeed: 5,
        totalPrecipitation: 1.5,
        precipitationMissing: false,
        timeStamp,
        smartSymbol: 3,
        precipitationData: [{ precipitation: 1, timestamp: timeStamp }],
      })
    );

    const view = render(
      <Vertical10DaysForecast
        dayData={dayData as any}
        units={
          {
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
            precipitation: { unitAbb: 'mm' },
          } as any
        }
        invalidData={false}
        displayParams={[0, 1, 2] as any}
        showSingleHourlyForecast={false}
        forecastByDay={
          {
            '18.5.': [{ epochtime: firstTimestamp }],
            '19.5.': [{ epochtime: secondTimestamp }],
          } as any
        }
      />
    );

    fireEvent.press(view.getAllByHintText('Show hourly forecast')[0]);
    fireEvent.press(view.getByHintText('Show hourly forecast'));

    expect(view.getByTestId('hourly-forecast-0')).toBeTruthy();
    expect(view.getByTestId('hourly-forecast-1')).toBeTruthy();
  });

  it('keeps only one hourly forecast expanded when the setting is enabled', () => {
    const firstTimestamp = 2000000000;
    const secondTimestamp = firstTimestamp + 24 * 60 * 60;
    const dayData = [firstTimestamp, secondTimestamp].map((timeStamp) => ({
      maxTemperature: 10,
      minTemperature: 4,
      minWindSpeed: 2,
      maxWindSpeed: 5,
      totalPrecipitation: 1.5,
      precipitationMissing: false,
      timeStamp,
      smartSymbol: 3,
      precipitationData: [{ precipitation: 1, timestamp: timeStamp }],
    }));

    const view = render(
      <Vertical10DaysForecast
        dayData={dayData as any}
        units={
          {
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
            precipitation: { unitAbb: 'mm' },
          } as any
        }
        invalidData={false}
        displayParams={[0, 1, 2] as any}
        showSingleHourlyForecast
        forecastByDay={
          {
            '18.5.': [{ epochtime: firstTimestamp }],
            '19.5.': [{ epochtime: secondTimestamp }],
          } as any
        }
      />
    );

    fireEvent.press(view.getAllByHintText('Show hourly forecast')[0]);
    fireEvent.press(view.getByHintText('Show hourly forecast'));

    expect(view.queryByTestId('hourly-forecast-0')).toBeNull();
    expect(view.getByTestId('hourly-forecast-1')).toBeTruthy();
  });

  it('collapses previously expanded forecasts when single forecast mode is enabled', () => {
    const firstTimestamp = 2000000000;
    const secondTimestamp = firstTimestamp + 24 * 60 * 60;
    const dayData = [firstTimestamp, secondTimestamp].map((timeStamp) => ({
      maxTemperature: 10,
      minTemperature: 4,
      minWindSpeed: 2,
      maxWindSpeed: 5,
      totalPrecipitation: 1.5,
      precipitationMissing: false,
      timeStamp,
      smartSymbol: 3,
      precipitationData: [{ precipitation: 1, timestamp: timeStamp }],
    }));
    const units = {
      temperature: { unitAbb: 'C' },
      wind: { unitAbb: 'm/s' },
      precipitation: { unitAbb: 'mm' },
    } as any;
    const forecastByDay = {
      '18.5.': [{ epochtime: firstTimestamp }],
      '19.5.': [{ epochtime: secondTimestamp }],
    } as any;

    const view = render(
      <Vertical10DaysForecast
        dayData={dayData as any}
        units={units}
        invalidData={false}
        displayParams={[0, 1, 2] as any}
        showSingleHourlyForecast={false}
        forecastByDay={forecastByDay}
      />
    );

    fireEvent.press(view.getAllByHintText('Show hourly forecast')[0]);
    fireEvent.press(view.getByHintText('Show hourly forecast'));
    expect(view.getByTestId('hourly-forecast-0')).toBeTruthy();
    expect(view.getByTestId('hourly-forecast-1')).toBeTruthy();

    view.rerender(
      <Vertical10DaysForecast
        dayData={dayData as any}
        units={units}
        invalidData={false}
        displayParams={[0, 1, 2] as any}
        showSingleHourlyForecast
        forecastByDay={forecastByDay}
      />
    );

    expect(view.getByTestId('hourly-forecast-0')).toBeTruthy();
    expect(view.queryByTestId('hourly-forecast-1')).toBeNull();
  });

  it('does not scroll the hourly forecast to 8 on wide displays', () => {
    jest
      .spyOn(require('react-native'), 'useWindowDimensions')
      .mockReturnValue({ width: 768, height: 1024, fontScale: 1, scale: 2 });

    const timeStamp = 2000000000;
    const view = render(
      <Vertical10DaysForecast
        dayData={
          [
            {
              maxTemperature: 10,
              minTemperature: 4,
              minWindSpeed: 2,
              maxWindSpeed: 5,
              totalPrecipitation: 1.5,
              precipitationMissing: false,
              timeStamp,
              smartSymbol: 3,
              precipitationData: [{ precipitation: 1, timestamp: timeStamp }],
            },
          ] as any
        }
        units={
          {
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
            precipitation: { unitAbb: 'mm' },
          } as any
        }
        invalidData={false}
        displayParams={[0, 1, 2] as any}
        showSingleHourlyForecast={false}
        forecastByDay={
          {
            '18.5.': [{ epochtime: timeStamp }],
          } as any
        }
      />
    );

    fireEvent.press(view.getByHintText('Show hourly forecast'));

    expect(mockHourlyForecast).toHaveBeenCalledWith({
      data: [{ epochtime: timeStamp }],
      initialScrollHour: undefined,
    });
  });
});
