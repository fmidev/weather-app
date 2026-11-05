import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, Text as NativeText, View } from 'react-native';
import moment from 'moment-timezone';

import ForecastListColumn from '../../src/components/weather/forecast/ForecastListColumn';
import * as constants from '../../src/store/forecast/constants';

const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();
const mockGetWindDirection = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#cccccc',
      chartGridDay: '#999999',
      hourListText: '#111111',
      listTint: '#eeeeee',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.value ? `${key}:${options.value}:${options.unit}` : key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@assets/images', () => ({
  weatherSymbolGetter: (symbol: string) => {
    const { Text } = require('react-native');
    return ({ width, height }: any) => (
      <Text testID={`weather-symbol-${symbol}`}>{`${width}-${height}`}</Text>
    );
  },
}));

jest.mock('@config', () => ({
  Config: {
    get: (key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            data: [
              {
                parameters: ['windDirection', 'windSpeedMS'],
              },
            ],
          },
        };
      }
      return {
        units: {
          precipitation: 'mm',
          pressure: 'hPa',
          temperature: 'C',
          wind: 'm/s',
        },
      };
    },
  },
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
  getForecastParameterUnitTranslationKey: (...args: any[]) =>
    mockGetForecastParameterUnitTranslationKey(...args),
}));

jest.mock('@utils/accessibility', () => ({
  ...jest.requireActual('@utils/accessibility'),
  formatAccessibleTemperature: (value: string) => value,
}));

jest.mock('@utils/helpers', () => ({
  isOdd: (value: number) => value % 2 === 1,
  getWindDirection: (...args: any[]) => mockGetWindDirection(...args),
}));

jest.mock('@utils/number', () => ({
  roundToNearestTen: (value: number) => Math.round(value / 10) * 10,
}));

describe('ForecastListColumn', () => {
  beforeEach(() => {
    moment.tz.setDefault('UTC');
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockGetForecastParameterUnitTranslationKey.mockReset();
    mockGetWindDirection.mockReset();

    mockConverter.mockImplementation((_unit: string, value: number) => value);
    mockToPrecision.mockImplementation(
      (_type: string, _unit: string, value: number) => `${value}`
    );
    mockGetForecastParameterUnitTranslationKey.mockImplementation(
      (unit: string) => unit
    );
    mockGetWindDirection.mockReturnValue(180);
  });

  afterEach(() => {
    moment.tz.setDefault();
  });

  it('renders forecast values, symbol and accessibility labels', () => {
    const data = {
      epochtime: 2000000000,
      smartSymbol: 2,
      temperature: 5,
      feelsLike: 3,
      dewPoint: 1,
      windSpeedMS: 4,
      windDirection: 180,
      windCompass8: 'S',
      hourlymaximumgust: 9,
      precipitation1h: 1.25,
      pop: 7,
      pressure: 1013,
      relativeHumidity: 82,
      dayLength: 500,
    };

    const view = render(
      <ForecastListColumn
        clockType={24 as any}
        data={data as any}
        displayParams={[
          [0, constants.SMART_SYMBOL],
          [1, constants.TEMPERATURE],
          [2, constants.FEELS_LIKE],
          [3, constants.DEW_POINT],
          [4, constants.WIND_SPEED_AND_DIRECTION],
          [5, constants.WIND_GUST],
          [6, constants.PRECIPITATION_1H],
          [7, constants.PRECIPITATION_PROBABILITY],
          [8, constants.PRESSURE],
          [9, constants.RELATIVE_HUMIDITY],
          [10, constants.DAY_LENGTH],
        ]}
        units={
          {
            precipitation: { unitAbb: 'mm', unitPrecision: 1 },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
      />
    );

    expect(view.getByTestId('weather-symbol-2')).toBeTruthy();
    expect(view.getByText('5°')).toBeTruthy();
    expect(view.getByText('3°')).toBeTruthy();
    expect(view.getByText('1°')).toBeTruthy();
    expect(view.getByText('4')).toBeTruthy();
    expect(view.getByText('9')).toBeTruthy();
    expect(view.getByText('1.3')).toBeTruthy();
    expect(view.getByText('<10')).toBeTruthy();
    expect(view.getByText('1013')).toBeTruthy();
    expect(view.getByText('82')).toBeTruthy();
    expect(view.queryByText('500')).toBeNull();
    const hour = view.getByA11yRole('text');
    expect(hour.props.accessibilityLabel).toBe(
      [
        'forecast:at 03',
        'symbols:2',
        'forecast:params:temperature:5:forecast:C',
        'forecast:params:feelsLike:3:forecast:C',
        'forecast:params:dewpoint:1:forecast:C',
        'observation:windDirection:S 4 forecast:m/s',
        'forecast:params:hourlymaximumgust:9:forecast:m/s',
        'forecast:params:precipitation1h:1.3:forecast:mm',
        'forecast:params:pop:<10:%',
        'forecast:params:pressure:1013:forecast:hPa',
        'forecast:params:relativeHumidity:82:false',
      ].join('. ')
    );
  });

  it('formats high and missing precipitation probability values', () => {
    const displayParams: [number, any][] = [
      [0, constants.PRECIPITATION_PROBABILITY],
    ];

    const highPop = render(
      <ForecastListColumn
        clockType={24 as any}
        data={{ epochtime: 2000000001, pop: 95 } as any}
        displayParams={displayParams}
      />
    );
    expect(highPop.getByText('>90')).toBeTruthy();

    const missingPop = render(
      <ForecastListColumn
        clockType={24 as any}
        data={{ epochtime: 2000000002 } as any}
        displayParams={displayParams}
      />
    );
    expect(missingPop.getByText('-')).toBeTruthy();
    expect(missingPop.getByA11yRole('text').props.accessibilityLabel).toContain(
      'forecast:popMissing'
    );
  });

  it.each([false, true])(
    'exposes one complete hour and hides its individual fields in compact mode %s',
    (compact) => {
      const view = render(
        <ForecastListColumn
          compact={compact}
          clockType={24}
          data={{ epochtime: 2000000000, temperature: 0, pop: 55 } as any}
          displayParams={[
            [0, constants.PRECIPITATION_PROBABILITY],
            [1, constants.TEMPERATURE],
            [2, constants.DAY_LENGTH],
          ]}
        />
      );

      const hours = view.getAllByA11yRole('text');
      expect(hours).toHaveLength(1);
      const hour = hours[0];
      expect(hour.props.accessible).toBe(true);
      expect(hour.props.focusable).toBe(true);
      expect(hour.props.importantForAccessibility).toBe('yes');
      expect(hour.props.accessibilityLabel).toBe(
        'forecast:at 03. forecast:params:pop:60:%. forecast:params:temperature:0:forecast:C'
      );
      const content = hour.findByProps({
        importantForAccessibility: 'no-hide-descendants',
      });
      expect(content.props.accessibilityElementsHidden).toBe(true);
      expect(content.props.accessible).toBe(false);
      expect(content.props.focusable).toBe(false);
      expect(
        content.findAllByType(View).filter(
          ({ props }) => props.accessible || props.focusable
        )
      ).toHaveLength(0);
      expect(
        content.findAllByType(NativeText).every(
          ({ props }) => props.accessible === false
        )
      ).toBe(true);
    }
  );

  it('updates the whole hour label with selected parameters and units', () => {
    const props = {
      clockType: 12 as const,
      data: {
        epochtime: 2000000000,
        temperature: -2,
        precipitation1h: 1.25,
      } as any,
      displayParams: [[0, constants.TEMPERATURE]] as [number, any][],
    };
    const view = render(<ForecastListColumn {...props} />);
    const hour = view.getByA11yRole('text');
    expect(hour.props.accessibilityLabel).toBe(
      'forecast:at 3 am. forecast:params:temperature:-2:forecast:C'
    );
    mockConverter.mockImplementation((unit, value) =>
      unit === 'in' ? 0.05 : value
    );

    view.rerender(
      <ForecastListColumn
        {...props}
        displayParams={[[0, constants.PRECIPITATION_1H]]}
        units={
          {
            precipitation: { unitAbb: 'in', unitPrecision: 2 },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
            pressure: { unitAbb: 'hPa' },
          } as any
        }
      />
    );

    expect(view.getByA11yRole('text')).toBe(hour);
    expect(hour.props.accessibilityLabel).toBe(
      'forecast:at 3 am. forecast:params:precipitation1h:0.05:forecast:in'
    );
  });

  it('keeps the time row height consistent in compact mode', () => {
    const regularView = render(
      <ForecastListColumn
        clockType={24 as any}
        data={{ epochtime: 2000000000 } as any}
        displayParams={[]}
      />
    );
    const compactView = render(
      <ForecastListColumn
        compact
        clockType={24 as any}
        data={{ epochtime: 2000000000 } as any}
        displayParams={[]}
      />
    );

    const regularStyle = StyleSheet.flatten(
      regularView.getByTestId('forecast-time-row').props.style
    );
    const compactStyle = StyleSheet.flatten(
      compactView.getByTestId('forecast-time-row').props.style
    );
    expect(compactStyle.height).toBe(regularStyle.height);
    expect(compactStyle.height).toBeLessThanOrEqual(52);
  });
});
