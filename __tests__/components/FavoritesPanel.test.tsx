import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import FavoritesPanel from '../../src/components/weather/FavoritesPanel';
import forecastReducer from '../../src/store/forecast/reducer';
import locationReducer from '../../src/store/location/reducer';
import settingsReducer from '../../src/store/settings/reducer';
import warningsReducer from '../../src/store/warnings/reducer';
import { GREEN, ORANGE, RED, TRANSPARENT, YELLOW } from '../../src/assets/colors';
import {
  FETCH_FAVORITE_WARNINGS_SUCCESS,
  LocationWarnings,
  Warning,
} from '../../src/store/warnings/types';
import { FETCH_FORECAST_SUCCESS } from '../../src/store/forecast/types';
import {
  ADD_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
} from '../../src/store/location/types';
import type { TimeStepData, WeatherData } from '../../src/store/forecast/types';
import type { Location } from '../../src/store/location/types';
import type { UnitMap } from '../../src/store/settings/types';

let mockLanguage = 'fi';
let mockFontScale = 1;
let mockForecastBackground = '#93B8D1';
const mockSelectedFavoriteBorder = '#303193';

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
      secondaryText: '#666666',
      cardShadow: '#D8E7F2',
      selectedFavoriteBorder: mockSelectedFavoriteBorder,
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
  warnings: warningsReducer,
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

const warning = (overrides: Partial<Warning> = {}): Warning => ({
  type: 'wind',
  language: 'fi',
  severity: 'Moderate',
  description: 'Wind warning',
  duration: { startTime: '2030-01-01T12:30:00Z', endTime: '2030-01-01T14:00:00Z' },
  ...overrides,
});

const warningsData = (warnings: Warning[]) => ({
  warnings, updated: '2030-01-01T12:00:00Z', error: 0,
});

const mountPanel = (
  options: {
    favorites?: Location[]; data?: WeatherData; units?: UnitMap;
    warnings?: LocationWarnings;
    scrollToTop?: boolean;
  } = {}
) => {
  const initial = createStore(reducer).getState();
  const store = createStore(reducer, {
    ...initial,
    forecast: { ...initial.forecast, data: options.data },
    location: {
      ...initial.location,
      current: helsinki,
      favorites: options.favorites ?? [],
    },
    settings: { ...initial.settings, units: options.units },
    warnings: { ...initial.warnings, data: options.warnings ?? {} },
  });
  const onSelectLocation = jest.fn();
  const view = render(
    <Provider store={store}>
      <FavoritesPanel onSelectLocation={onSelectLocation} scrollToTop={options.scrollToTop} />
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

    const { getByText, getByA11yRole } = mountPanel({ favorites: [helsinki] });

    expect(getByText(title)).toBeTruthy();
    expect(getByA11yRole('header').props.accessibilityLabel).toBe(title);
  });

  it('shows the panel only while favorites exist', () => {
    const view = mountPanel();

    expect(view.toJSON()).toBeNull();

    act(() => {
      view.store.dispatch({ type: ADD_FAVORITE, location: helsinki, max: 10 });
    });

    expect(view.getByText('Suosikkipaikkakunnat')).toBeTruthy();
    expect(view.getByText('Helsinki')).toBeTruthy();

    act(() => {
      view.store.dispatch({ type: DELETE_ALL_FAVORITES });
    });

    expect(view.toJSON()).toBeNull();
  });

  it('shows only favorites with their next future forecast in themed 110x80 boxes', () => {
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
      width: 110,
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

  it.each([1, '1'])(
    'borders the selected favorite and follows Redux selection (ID %s)',
    (id) => {
      const view = mountPanel({ favorites: [{ ...helsinki, id }, tampere] });
      const expectSelected = (selectedId?: number | string) => {
        [id, tampere.id].forEach((favoriteId) => {
          const card = view.getByTestId(`favorite-forecast-${favoriteId}`);
          const selected = String(favoriteId) === String(selectedId);
          expect(StyleSheet.flatten(card.props.style)).toMatchObject({
            borderWidth: selected ? 2 : 0,
            borderColor: selected ? mockSelectedFavoriteBorder : TRANSPARENT,
          });
          expect(card.props.accessibilityState).toEqual({ selected });
        });
      };

      expectSelected(helsinki.id);
      act(() => {
        view.store.dispatch({ type: SET_CURRENT_LOCATION, location: tampere });
      });
      expectSelected(tampere.id);
      act(() => {
        view.store.dispatch({ type: SET_CURRENT_LOCATION, location: { ...helsinki, id: 3 } });
      });
      expectSelected();
    }
  );

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

  it.each([
    { severity: 'Moderate', color: YELLOW },
    { severity: 'Severe', color: ORANGE },
    { severity: 'Extreme', color: RED },
  ] as const)('shows a 6-unit bottom band for an active $severity warning', ({ severity, color }) => {
    const view = mountPanel({
      favorites: [helsinki],
      data: { 1: [step()] },
      warnings: { 1: warningsData([warning({ severity })]) },
    });

    expect(StyleSheet.flatten(view.getByTestId('favorite-warning-1').props.style)).toMatchObject({
      height: 6, position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: color,
    });
    expect(StyleSheet.flatten(view.getByTestId('favorite-forecast-1').props.style)).toMatchObject({
      borderRadius: 8, overflow: 'hidden', minHeight: 80,
    });
  });

  it('uses the highest severity active at each favorite forecast time rather than the current time', () => {
    const view = mountPanel({
      favorites: [helsinki, tampere],
      data: { 1: [step()], 2: [step({ epochtime: Date.now() / 1000 + 7200 })] },
      warnings: {
        1: warningsData([
          warning({ severity: 'Extreme', duration: {
            startTime: '2030-01-01T11:00:00Z', endTime: '2030-01-01T12:30:00Z',
          } }),
          warning(),
          warning({ severity: 'Severe' }),
          warning({ severity: 'Extreme', duration: {
            startTime: '2030-01-01T13:30:00Z', endTime: '2030-01-01T15:00:00Z',
          } }),
        ]),
        2: warningsData([warning({ severity: 'Extreme', duration: {
          startTime: '2030-01-01T13:30:00Z', endTime: '2030-01-01T15:00:00Z',
        } })]),
      },
    });

    expect(StyleSheet.flatten(view.getByTestId('favorite-warning-1').props.style).backgroundColor).toBe(ORANGE);
    expect(StyleSheet.flatten(view.getByTestId('favorite-warning-2').props.style).backgroundColor).toBe(RED);
  });

  it.each([
    { name: 'starts at forecast time', startTime: '2030-01-01T13:00:00Z', endTime: '2030-01-01T14:00:00Z', visible: true },
    { name: 'ends at forecast time', startTime: '2030-01-01T12:00:00Z', endTime: '2030-01-01T13:00:00Z', visible: false },
    { name: 'starts later', startTime: '2030-01-01T13:00:01Z', endTime: '2030-01-01T14:00:00Z', visible: false },
    { name: 'has an invalid time', startTime: 'invalid', endTime: '2030-01-01T14:00:00Z', visible: false },
    { name: 'uses a timezone offset', startTime: '2030-01-01T15:00:00+02:00', endTime: '2030-01-01T16:00:00+02:00', visible: true },
  ])('handles a warning that $name', ({ startTime, endTime, visible }) => {
    const view = mountPanel({
      favorites: [helsinki], data: { 1: [step()] },
      warnings: { 1: warningsData([warning({ duration: { startTime, endTime } })]) },
    });
    expect(StyleSheet.flatten(view.getByTestId('favorite-warning-1').props.style).backgroundColor)
      .toBe(visible ? YELLOW : GREEN);
  });

  it.each(['empty', 'unknown severity', 'missing forecast'])(
    'shows a green warning band for %s data with no active warnings', (state) => {
      const view = mountPanel({
        favorites: [helsinki], data: state === 'missing forecast' ? {} : { 1: [step()] },
        warnings: { 1: warningsData(
          state === 'empty' ? [] : [warning(state === 'unknown severity'
            ? { severity: 'unknown' as Warning['severity'] } : {})]
        ) },
      });
      expect(StyleSheet.flatten(view.getByTestId('favorite-warning-1').props.style).backgroundColor).toBe(GREEN);
    }
  );

  it('leaves the band absent only for the favorite without warning data', () => {
    const view = mountPanel({
      favorites: [helsinki, tampere], data: { 1: [step()], 2: [step()] },
      warnings: { 1: warningsData([]) },
    });
    expect(view.getByTestId('favorite-warning-1')).toBeTruthy();
    expect(view.queryByTestId('favorite-warning-2')).toBeNull();
  });

  it.each([
    { name: 'empty warning list', warnings: [] },
    { name: 'non-empty warning list', warnings: [warning()] },
  ])('hides expired warning data instead of displaying a band ($name)', ({ warnings }) => {
    const view = mountPanel({
      favorites: [helsinki], data: { 1: [step()] },
      warnings: { 1: { ...warningsData(warnings), updated: '2029-12-31T23:59:59Z' } },
    });
    expect(view.queryByTestId('favorite-warning-1')).toBeNull();
  });

  it('uses the current time for warning data when a forecast is unavailable', () => {
    const view = mountPanel({
      favorites: [helsinki],
      warnings: { 1: warningsData([warning({ duration: {
        startTime: '2030-01-01T11:00:00Z', endTime: '2030-01-01T13:00:00Z',
      } })]) },
    });
    expect(StyleSheet.flatten(view.getByTestId('favorite-warning-1').props.style).backgroundColor).toBe(YELLOW);
  });

  it('updates the band from missing to warning to green when favorite warnings arrive in Redux', () => {
    const view = mountPanel({ favorites: [helsinki], data: { 1: [step()] } });
    expect(view.queryByTestId('favorite-warning-1')).toBeNull();
    act(() => {
      view.store.dispatch({
        type: FETCH_FAVORITE_WARNINGS_SUCCESS,
        data: { 1: warningsData([warning()]) },
      });
    });
    expect(view.getByTestId('favorite-warning-1')).toBeTruthy();
    act(() => {
      view.store.dispatch({
        type: FETCH_FAVORITE_WARNINGS_SUCCESS, data: { 1: warningsData([]) },
      });
    });
    expect(StyleSheet.flatten(view.getByTestId('favorite-warning-1').props.style).backgroundColor).toBe(GREEN);
  });

  it.each([
    ['fi', 'Ei voimassa olevia varoituksia'],
    ['en', 'No active warnings'],
    ['sv', 'Inga gällande varningar'],
  ])('includes the no-warning situation in the accessibility label in %s', (language, label) => {
    mockLanguage = language;
    const view = mountPanel({
      favorites: [helsinki], data: { 1: [step()] }, warnings: { 1: warningsData([]) },
    });
    expect(view.getByTestId('favorite-forecast-1').props.accessibilityLabel).toContain(label);
  });

  it.each([
    ['fi', 'Varoitukset: Vaarallinen'],
    ['en', 'Warnings: Dangerous'],
    ['sv', 'Varningar: Farlig'],
  ])('includes the warning severity in the card accessibility label in %s', (language, label) => {
    mockLanguage = language;
    const view = mountPanel({
      favorites: [helsinki], data: { 1: [step()] },
      warnings: { 1: warningsData([warning({ severity: 'Severe' })]) },
    });
    expect(view.getByTestId('favorite-forecast-1').props.accessibilityLabel).toContain(label);
    expect(view.getByTestId('favorite-warning-1').props.accessible).toBe(false);
    fireEvent.press(view.getByTestId('favorite-forecast-1'));
    expect(view.onSelectLocation).toHaveBeenCalledWith(helsinki, true);
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
      expect(view.onSelectLocation).toHaveBeenCalledWith(tampere, true);
    }
  );

  it.each([true, false, undefined])(
    'forwards scrollToTop=%s with the selected favorite', (scrollToTop) => {
      const view = mountPanel({ favorites: [tampere], scrollToTop });
      const card = view.getByTestId('favorite-forecast-2');
      fireEvent.press(card);

      expect(view.onSelectLocation).toHaveBeenCalledWith(tampere, scrollToTop ?? true);
      expect(card.props.accessibilityHint).toBe(scrollToTop === false
        ? 'Näytä paikkakunnan ennuste'
        : 'Näytä paikkakunnan ennuste ja siirry näkymän alkuun');
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
      width: 220,
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
