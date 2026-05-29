import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import ErrorComponent from '../../src/components/common/ErrorComponent';

const mockConfigGet = jest.fn();
const mockNetInfoFetch = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        forecastErrorTitle: 'Forecast error',
        observationErrorTitle: 'Observation error',
        warningsErrorTitle: 'Warnings error',
        overlaysErrorTitle: 'Map error',
        noInternetTitle: 'No internet',
        checkConnection: 'Check your connection',
        tryAgain: 'Try again',
      };
      return translations[key] ?? key;
    },
    i18n: {
      language: 'en',
    },
  }),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: () => mockNetInfoFetch(),
  },
}));

jest.mock('@store/location/selector', () => ({
  selectCurrent: (state: any) => state.mock.location,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectError: (state: any) => state.mock.forecastError,
  selectForecastInvalidData: (state: any) => state.mock.forecastInvalidDataError,
}));

jest.mock('@store/observation/selector', () => ({
  selectError: (state: any) => state.mock.observationError,
}));

jest.mock('@store/warnings/selectors', () => ({
  selectError: (state: any) => state.mock.warningsError,
}));

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: (state: any) => state.mock.activeOverlay,
  selectOverlaysError: (state: any) => state.mock.overlaysError,
}));

jest.mock('@store/settings/selectors', () => ({
  selectMapLibrary: (state: any) => state.mock.mapLibrary,
}));

const mockFetchForecast = jest.fn((...args: any[]) => ({
  type: 'FORECAST/FETCH',
  payload: { location: args[0], country: args[1] },
}));
const mockFetchObservation = jest.fn((...args: any[]) => ({
  type: 'OBSERVATION/FETCH',
  payload: { location: args[0], country: args[1] },
}));
const mockFetchWarnings = jest.fn((...args: any[]) => ({
  type: 'WARNINGS/FETCH',
  payload: args[0],
}));
const mockUpdateOverlays = jest.fn((...args: any[]) => ({
  type: 'MAP/UPDATE_OVERLAYS',
  payload: { activeOverlay: args[0], mapLibrary: args[1] },
}));

jest.mock('@store/forecast/actions', () => ({
  fetchForecast: (...args: any[]) => mockFetchForecast(...args),
}));

jest.mock('@store/observation/actions', () => ({
  fetchObservation: (...args: any[]) => mockFetchObservation(...args),
}));

jest.mock('@store/warnings/actions', () => ({
  fetchWarnings: (...args: any[]) => mockFetchWarnings(...args),
}));

jest.mock('@store/map/actions', () => ({
  updateOverlays: (...args: any[]) => mockUpdateOverlays(...args),
}));

const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const flushEffects = async () => {
  await waitFor(() => {
    expect(mockNetInfoFetch).toHaveBeenCalled();
  });
  await act(async () => {
    await Promise.resolve();
  });
};

describe('ErrorComponent', () => {
  beforeEach(() => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'settings') {
        return { verboseErrorMessages: true };
      }
      if (key === 'unresolvedGeoIdErrorMessage') {
        return {
          en: {
            title: 'Outside service area',
            additionalInfo: 'Choose another location',
          },
        };
      }
      return undefined;
    });
    mockNetInfoFetch.mockResolvedValue({ isConnected: true });
    mockFetchForecast.mockClear();
    mockFetchObservation.mockClear();
    mockFetchWarnings.mockClear();
    mockUpdateOverlays.mockClear();
    mockIcon.mockClear();
  });

  it('renders no internet message and can be dismissed', async () => {
    mockNetInfoFetch.mockResolvedValue({ isConnected: false });

    const store = createStore({
      mock: {
        location: { id: 1, lat: 60.1699, lon: 24.9384, country: 'FI' },
        forecastError: undefined,
        forecastInvalidDataError: false,
        observationError: undefined,
        warningsError: undefined,
        activeOverlay: 3,
        overlaysError: undefined,
        mapLibrary: 'maplibre',
      },
    });

    const { getByText, getByTestId, queryByText } = render(
      <Provider store={store as any}>
        <ErrorComponent
          navReady
          currentRoute={{ name: 'StackWeather', key: 'weather' } as any}
        />
      </Provider>
    );

    await flushEffects();

    expect(getByText('No internet')).toBeTruthy();

    expect(getByText('Check your connection')).toBeTruthy();

    fireEvent.press(getByTestId('icon-close-outline'));

    await waitFor(() => {
      expect(queryByText('No internet')).toBeNull();
    });
  });

  it('renders forecast error and dispatches retry action', async () => {
    const store = createStore({
      mock: {
        location: { id: 42, lat: 60.1699, lon: 24.9384, country: 'FI' },
        forecastError: new Error('Forecast request failed'),
        forecastInvalidDataError: false,
        observationError: undefined,
        warningsError: undefined,
        activeOverlay: 7,
        overlaysError: undefined,
        mapLibrary: 'maplibre',
      },
    });

    const { getByText } = render(
      <Provider store={store as any}>
        <ErrorComponent
          navReady
          currentRoute={{ name: 'StackWeather', key: 'weather' } as any}
        />
      </Provider>
    );

    await flushEffects();

    expect(getByText('Forecast error')).toBeTruthy();

    expect(getByText('Error: Forecast request failed')).toBeTruthy();

    fireEvent.press(getByText('Try again'));

    expect(mockFetchForecast).toHaveBeenCalledWith(
      { geoid: 42, latlon: '60.1699,24.9384' },
      'FI'
    );
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'FORECAST/FETCH',
      payload: {
        location: { geoid: 42, latlon: '60.1699,24.9384' },
        country: 'FI',
      },
    });
  });

  it('renders out-of-service-area message without retry button', async () => {
    const store = createStore({
      mock: {
        location: { id: 42, lat: 60.1699, lon: 24.9384, country: 'FI' },
        forecastError: { message: '400 unresolved geoid' },
        forecastInvalidDataError: false,
        observationError: undefined,
        warningsError: undefined,
        activeOverlay: 7,
        overlaysError: undefined,
        mapLibrary: 'maplibre',
      },
    });

    const { getByText, queryByText } = render(
      <Provider store={store as any}>
        <ErrorComponent
          navReady
          currentRoute={{ name: 'StackWeather', key: 'weather' } as any}
        />
      </Provider>
    );

    await flushEffects();

    expect(getByText('Outside service area')).toBeTruthy();

    expect(getByText('Choose another location')).toBeTruthy();
    expect(queryByText('Try again')).toBeNull();
  });
});
