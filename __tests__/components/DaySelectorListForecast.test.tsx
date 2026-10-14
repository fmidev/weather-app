import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import moment from 'moment-timezone';

import DaySelectorList from '../../src/components/weather/forecast/DaySelectorList';

const mockConfigGet = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
let mockLanguage = 'en';
let mockParameters = ['temperature', 'precipitation1h'];

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

jest.mock('react-i18next', () => {
  const i18n = jest.requireActual('i18next').createInstance();
  i18n.init({
    initImmediate: false,
    lng: 'en',
    resources: {
      en: require('../../i18n/en.json'),
      fi: require('../../i18n/fi.json'),
    },
  });
  return {
    useTranslation: () => ({
      t: (key: string, options?: any) =>
        i18n.t(key, { ...options, lng: mockLanguage }),
      i18n: { language: mockLanguage },
    }),
  };
});

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
  getForecastParameterUnitTranslationKey: (unit: string) =>
    unit === 'in' ? 'inches' : 'millimeters',
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
  default: ({ accessible }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID="precipitation-strip" accessible={accessible}>
        strip
      </Text>
    );
  },
}));

describe('DaySelectorList', () => {
  beforeEach(() => {
    moment.tz.setDefault('UTC');
    mockLanguage = 'en';
    mockParameters = ['temperature', 'precipitation1h'];
    mockConfigGet.mockReset();
    mockConverter.mockReset();
    mockToPrecision.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            data: [{ parameters: mockParameters }],
          },
        };
      }
      if (key === 'settings') {
        return {
          units: { temperature: 'C', precipitation: 'mm' },
        };
      }
      return {};
    });

    mockConverter.mockImplementation((unit: string, value: number) =>
      unit === 'in' ? value / 25.4 : value
    );
    mockToPrecision.mockImplementation(
      (type: string, unit: string, value: number) =>
        type === 'precipitation'
          ? value.toFixed(unit === 'in' ? 2 : 1)
          : `${value}`
    );
  });

  afterEach(() => moment.tz.setDefault());

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

    const { getAllByText, getAllByRole, getByRole, getByTestId, getByText } =
      render(
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

    expect(getAllByRole('button')).toHaveLength(1);
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe(
      'Wednesday, 18th May. Clear. From 4 degrees Celsius to 10 degrees Celsius. ' +
        'Precipitation at night, total precipitation 1.0 millimeters'
    );
    expect(button.props.accessibilityState).toEqual({ selected: true });
    expect(getByTestId('precipitation-strip').props.accessible).toBe(false);
    expect(
      button.findAll(
        (node) => node !== button && node.props.accessible === true
      )
    ).toHaveLength(0);
    fireEvent.press(button);
    expect(setActiveDayIndex).toHaveBeenCalledWith(0);
  });

  it.each([
    [
      'en',
      'in',
      2.54,
      'Precipitation in the morning, total precipitation 0.10 inches',
    ],
    [
      'fi',
      'mm',
      2.4,
      'Sadetta aamupäivällä, kokonaissademäärä 2,4 millimetriä',
    ],
    [
      'en',
      'mm',
      0,
      'No precipitation all day, total precipitation 0.0 millimeters',
    ],
    ['en', 'mm', null, 'Precipitation amount missing'],
  ])(
    'includes the localized precipitation summary for %s in %s (%s)',
    (language, unit, amount, summary) => {
      mockLanguage = language as string;
      const timeStamp = Date.parse('2035-06-01T06:00:00Z') / 1000;
      const view = render(
        <DaySelectorList
          activeDayIndex={1}
          setActiveDayIndex={jest.fn()}
          dayData={
            [
              {
                timeStamp,
                maxTemperature: 10,
                minTemperature: 4,
                smartSymbol: 4,
                precipitationData: [
                  { timestamp: timeStamp, precipitation: amount },
                ],
              },
            ] as any
          }
          units={
            {
              temperature: { unitAbb: 'C' },
              precipitation: { unitAbb: unit },
            } as any
          }
          invalidData={false}
        />
      );
      const button = view.getByRole('button');
      expect(button.props.accessibilityLabel).toContain(summary);
      expect(button.props.accessibilityState).toEqual({ selected: false });
    }
  );

  it.each([true, false])(
    'does not announce rainfall when invalid=%s or precipitation is disabled',
    (invalidData) => {
      if (!invalidData) mockParameters = ['temperature'];
      const timeStamp = Date.parse('2035-06-01T06:00:00Z') / 1000;
      const view = render(
        <DaySelectorList
          activeDayIndex={0}
          setActiveDayIndex={jest.fn()}
          dayData={
            [
              {
                timeStamp,
                maxTemperature: 10,
                minTemperature: 4,
                smartSymbol: 4,
                precipitationData: [{ timestamp: timeStamp, precipitation: 1 }],
              },
            ] as any
          }
          units={undefined}
          invalidData={invalidData}
        />
      );
      const label = view.getByRole('button').props.accessibilityLabel;
      expect(label).not.toContain('total precipitation');
      if (invalidData) expect(label).toContain('Precipitation amount missing');
      else expect(view.queryByTestId('precipitation-strip')).toBeNull();
    }
  );
});
