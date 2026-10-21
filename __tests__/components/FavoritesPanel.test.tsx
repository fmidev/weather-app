import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import FavoritesPanel from '../../src/components/weather/FavoritesPanel';
import forecastReducer from '../../src/store/forecast/reducer';
import locationReducer from '../../src/store/location/reducer';
import settingsReducer from '../../src/store/settings/reducer';
import { FETCH_FORECAST_SUCCESS } from '../../src/store/forecast/types';
import type { TimeStepData, WeatherData } from '../../src/store/forecast/types';
import type { Location } from '../../src/store/location/types';
import type { UnitMap } from '../../src/store/settings/types';

let mockLanguage = 'fi';
let mockFontScale = 1;
let mockForecastBackground = '#93B8D1';

jest.mock('@utils/helpers', () => ({
  msToBeaufort: jest.fn(),
  getIndexForDaySmartSymbol: jest.fn(),
}));

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return Object.create(ReactNative, {
    useWindowDimensions: {
      value: () => ({
        width: 390,
        height: 800,
        scale: 1,
        fontScale: mockFontScale,
      }),
    },
  });
});

jest.mock('@config', () => ({
  Config: {
    get: (key: string) =>
      key === 'weather'
        ? { forecast: { maxAge: 24 } }
        : { units: { temperature: 'C' } },
  },
}));

jest.mock('@assets/images', () => ({
  weatherSymbolGetter: (symbol: string) => {
    const { View } = require('react-native');
    return (props: any) => (
      <View testID={`weather-symbol-${symbol}`} {...props} />
    );
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      cardHeader: '#f0f0f0',
      border: '#cccccc',
      primaryText: '#101010',
      forecastBackground: mockForecastBackground,
    },
  }),
}));

jest.mock('react-i18next', () => {
  const i18n = jest.requireActual('i18next').createInstance();
  i18n.init({
    initImmediate: false,
    resources: {
      fi: require('../../i18n/fi.json'),
      en: require('../../i18n/en.json'),
      sv: require('../../i18n/sv.json'),
    },
  });

  return {
    useTranslation: (namespace: string) => ({
      t: (key: string, options: object) =>
        i18n.t(key, { ...options, lng: mockLanguage, ns: namespace }),
    }),
  };
});

const reducer = combineReducers({
  forecast: forecastReducer,
  location: locationReducer,
  settings: settingsReducer,
});

const helsinki: Location = {
  id: 1,
  name: 'Helsinki',
  area: '',
  country: 'FI',
  lat: 60,
  lon: 25,
  timezone: 'Europe/Helsinki',
};
const tampere: Location = { ...helsinki, id: '2', name: 'Tampere' };

const step = (overrides: Partial<TimeStepData> = {}): TimeStepData =>
  ({
    epochtime: Date.now() / 1000 + 3600,
    modtime: new Date().toISOString().replace('Z', ''),
    temperature: 5,
    smartSymbol: 2,
    ...overrides,
  }) as TimeStepData;

const mountPanel = (
  options: { favorites?: Location[]; data?: WeatherData; units?: UnitMap } = {}
) => {
  const initial = createStore(reducer).getState();
  const store = createStore(reducer, {
    ...initial,
    forecast: { ...initial.forecast, data: options.data },
    location: { ...initial.location, favorites: options.favorites ?? [] },
    settings: { ...initial.settings, units: options.units },
  });
  const onSelectLocation = jest.fn();
  const view = render(
    <Provider store={store}>
      <FavoritesPanel onSelectLocation={onSelectLocation} />
    </Provider>
  );
  return { store, onSelectLocation, ...view };
};

describe('FavoritesPanel', () => {
  beforeEach(() => {
    mockLanguage = 'fi';
    mockFontScale = 1;
    mockForecastBackground = '#93B8D1';
    jest.useFakeTimers().setSystemTime(new Date('2030-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['fi', 'Suosikkipaikkakunnat'],
    ['en', 'Favorite locations'],
    ['sv', 'Favoritorter'],
  ])('renders an accessible title in %s', (language, title) => {
    mockLanguage = language;

    const { getByText, getByA11yRole } = mountPanel();

    expect(getByText(title)).toBeTruthy();
    expect(getByA11yRole('header').props.accessibilityLabel).toBe(title);
  });

  it('shows only favorites with their next future forecast in themed 100x80 boxes', () => {
    const view = mountPanel({
      favorites: [tampere, helsinki],
      data: {
        1: [
          step({ epochtime: Date.now() / 1000 - 3600, temperature: 99 }),
          step({ temperature: 0 }),
          step({ epochtime: Date.now() / 1000 + 7200, temperature: 20 }),
        ],
        2: [step({ temperature: -5, smartSymbol: 101 })],
        3: [step({ temperature: 22 })],
      },
    });

    expect(view.getByText('Helsinki')).toBeTruthy();
    expect(view.getByText('Tampere')).toBeTruthy();
    expect(view.getByText('0°C')).toBeTruthy();
    expect(view.getByText('-5°C')).toBeTruthy();
    expect(view.queryByText('99°C')).toBeNull();
    expect(view.queryByText('20°C')).toBeNull();
    expect(view.queryByTestId('favorite-forecast-3')).toBeNull();
    expect(view.getByTestId('weather-symbol-2')).toBeTruthy();
    expect(view.getByTestId('weather-symbol-101')).toBeTruthy();
    expect(
      StyleSheet.flatten(view.getByTestId('favorite-forecast-1').props.style)
    ).toMatchObject({
      width: 100,
      minHeight: 80,
      backgroundColor: mockForecastBackground,
    });
    expect(
      view.getAllByTestId(/favorite-forecast-/).map((card) => card.props.testID)
    ).toEqual(['favorite-forecast-2', 'favorite-forecast-1']);
    expect(
      view.getByA11yLabel(/Tampere,.*lämpötila: miinus 5 Celsius-astetta/)
    ).toBeTruthy();
  });

  it('updates a favorite when new forecasts arrive in Redux', () => {
    const view = mountPanel({ favorites: [helsinki], data: { 1: [step()] } });
    expect(view.getByText('5°C')).toBeTruthy();

    act(() => {
      view.store.dispatch({
        type: FETCH_FORECAST_SUCCESS,
        background: true,
        data: {
          location: { geoid: 1 },
          forecast: [[step({ temperature: 9, smartSymbol: 1 })]],
          isAuroraBorealisLikely: false,
        },
        timestamp: Date.now(),
      });
    });

    expect(view.getByText('9°C')).toBeTruthy();
    expect(view.queryByText('5°C')).toBeNull();
    expect(view.getByTestId('weather-symbol-1')).toBeTruthy();
  });

  it.each([true, false])(
    'selects a favorite with forecast data available=%s',
    (available) => {
      const view = mountPanel({
        favorites: [helsinki, tampere],
        data: available ? { 1: [step()], 2: [step()] } : {},
      });
      const card = view.getByTestId('favorite-forecast-2');

      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityHint).toBe(
        'Näytä paikkakunnan ennuste ja siirry näkymän alkuun'
      );

      fireEvent.press(card);

      expect(view.onSelectLocation).toHaveBeenCalledTimes(1);
      expect(view.onSelectLocation).toHaveBeenCalledWith(tampere);
    }
  );

  it('uses the temperature unit selected in settings', () => {
    const view = mountPanel({
      favorites: [helsinki],
      data: { 1: [step({ temperature: 0 })] },
      units: {
        temperature: {
          unit: 'fahrenheit',
          unitAbb: 'F',
          unitId: 2,
          unitPrecision: 0,
        },
      },
    });

    expect(view.getByText('32°F')).toBeTruthy();
    expect(
      view.getByA11yLabel(/lämpötila: 32 Fahrenheit-astetta/)
    ).toBeTruthy();
  });

  it.each(['missing', 'stale', 'past'])(
    'shows a placeholder for a %s forecast',
    (state) => {
      const data: WeatherData =
        state === 'missing'
          ? {}
          : {
              1: [
                step(
                  state === 'stale'
                    ? { modtime: '2029-12-29T12:00:00' }
                    : { epochtime: Date.now() / 1000 - 1 }
                ),
              ],
            };
      const view = mountPanel({ favorites: [helsinki], data });

      expect(view.getByText('Helsinki')).toBeTruthy();
      expect(view.getByText('-')).toBeTruthy();
      expect(
        view.getByA11yLabel('Helsinki, Ennustetta ei ole saatavilla')
      ).toBeTruthy();
      expect(view.queryAllByTestId(/weather-symbol-/)).toHaveLength(0);
    }
  );

  it('handles missing temperature and symbol values without showing invalid weather data', () => {
    const view = mountPanel({
      favorites: [helsinki],
      data: { 1: [step({ temperature: NaN, smartSymbol: undefined })] },
    });

    expect(view.getByText('-')).toBeTruthy();
    expect(view.queryAllByTestId(/weather-symbol-/)).toHaveLength(0);
  });

  it('grows the boxes with large text while keeping the full location name accessible', () => {
    mockFontScale = 2;
    const location = {
      ...helsinki,
      name: 'A very long favorite location name',
    };
    const view = mountPanel({ favorites: [location], data: { 1: [step()] } });

    expect(
      StyleSheet.flatten(view.getByTestId('favorite-forecast-1').props.style)
    ).toMatchObject({
      width: 200,
      minHeight: 160,
    });
    expect(view.getByA11yLabel(new RegExp(`^${location.name},`))).toBeTruthy();
  });

  it.each(['#93B8D1', '#353944', '#898D9B'])(
    'uses white text on background %s',
    (background) => {
      mockForecastBackground = background;
      const view = mountPanel({ favorites: [helsinki], data: { 1: [step()] } });

      expect(
        StyleSheet.flatten(view.getByText('Helsinki').props.style).color
      ).toBe('#FFFFFF');
      expect(StyleSheet.flatten(view.getByText('5°C').props.style).color).toBe(
        '#FFFFFF'
      );
    }
  );
});
