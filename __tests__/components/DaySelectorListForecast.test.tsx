import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import DaySelectorList from '../../src/components/weather/forecast/DaySelectorList';

const mockConfigGet = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/settings/selectors', () => ({
  selectUnits: jest.fn(),
}));

jest.mock('@store/forecast/selectors', () => ({
  selectForecastInvalidData: jest.fn(),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'forecast:fromTo') return `${options.min} - ${options.max}`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#111111',
      screenBackground: '#f7f7f7',
      tabBarActive: '#2255aa',
      border: '#cccccc',
    },
    dark: false,
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
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Pressable } = require('react-native');
    return <Pressable {...props}>{children}</Pressable>;
  },
}));

jest.mock('../../src/components/weather/forecast/PrecipitationStrip', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="precipitation-strip">strip</Text>;
  },
}));

describe('DaySelectorList', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockConverter.mockReset();
    mockToPrecision.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            data: [{ parameters: ['temperature', 'precipitation1h'] }],
          },
        };
      }
      if (key === 'settings') {
        return {
          units: { temperature: 'C' },
        };
      }
      return {};
    });

    mockConverter.mockImplementation((_unit: string, value: any) => value);
    mockToPrecision.mockImplementation((_type: string, _unit: string, value: any) => `${value}`);
  });

  it('renders day block and changes active day', () => {
    const setActiveDayIndex = jest.fn();
    const dayData = [
      {
        timeStamp: 2000000000,
        maxTemperature: 10,
        minTemperature: 4,
        smartSymbol: 1,
        precipitationData: [{ precipitation: 1, timestamp: 2000000000 }],
      },
    ];

    const { getAllByText, getByLabelText, getByTestId, getByText } = render(
      <DaySelectorList
        activeDayIndex={0}
        setActiveDayIndex={setActiveDayIndex}
        dayData={dayData as any}
        units={{ temperature: { unitAbb: 'C' } } as any}
        invalidData={false}
      />
    );

    expect(getByTestId('weather-symbol-1')).toBeTruthy();
    expect(getByTestId('precipitation-strip')).toBeTruthy();
    expect(getAllByText(/4/).length).toBeGreaterThan(0);
    expect(getByText(/10/)).toBeTruthy();

    fireEvent.press(getByLabelText('symbols:1'));
    expect(setActiveDayIndex).toHaveBeenCalledWith(0);
  });
});
