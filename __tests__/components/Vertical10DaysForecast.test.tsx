import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import Vertical10DaysForecast from '../../src/components/weather/forecast/Vertical10DaysForecast';

const mockConfigGet = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();

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
      if (key === 'forecast:precipitationMissing') return 'Missing precipitation';
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
      modalBackground: '#ffffff',
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
  uppercaseFirst: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
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

jest.mock('react-native-modal', () => ({
  __esModule: true,
  default: ({ children, isVisible }: any) => {
    const { View } = require('react-native');
    return isVisible ? <View testID="forecast-modal">{children}</View> : null;
  },
}));

jest.mock('../../src/components/weather/forecast/PrecipitationStrip', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="precipitation-strip">strip</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/ModalContent', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="modal-content">content</Text>;
  },
}));

describe('Vertical10DaysForecast', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockClear();
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockGetForecastParameterUnitTranslationKey.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
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
    mockToPrecision.mockImplementation((_type: string, _unit: string, value: any) => `${value}`);
    mockGetForecastParameterUnitTranslationKey.mockImplementation((value: string) => value);
  });

  it('renders forecast row and opens modal on press', () => {
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

    const { getByHintText, getByTestId, getByText } = render(
      <Vertical10DaysForecast
        dayData={dayData as any}
        units={{
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
          precipitation: { unitAbb: 'mm' },
        } as any}
        invalidData={false}
        displayParams={[0, 1, 2] as any}
      />
    );

    expect(getByTestId('weather-symbol-3')).toBeTruthy();
    expect(getByText(/4°/)).toBeTruthy();
    expect(getByTestId('precipitation-strip')).toBeTruthy();

    fireEvent.press(getByHintText('Show hourly forecast'));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Show hourly forecast - day 1'
    );
    expect(getByTestId('forecast-modal')).toBeTruthy();
  });
});
