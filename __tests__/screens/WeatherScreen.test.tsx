import './screenTestMocks';

import React from 'react';
import { ScrollView, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import WeatherScreen from '../../src/screens/WeatherScreen';
import FavoritesPanel from '../../src/components/weather/FavoritesPanel';
import {
  mockConfigGetAll,
  mockState,
  mockUseReloader,
  mockTrackMatomoEvent,
  resetScreenMocks,
} from './screenTestMocks';
import type { Location } from '../../src/store/location/types';

const currentLocation: Location = {
  country: 'FI',
  id: 1,
  lat: 60.1,
  lon: 24.9,
  name: 'Helsinki',
  area: '',
  timezone: 'Europe/Helsinki',
};
const favoriteLocation: Location = {
  ...currentLocation,
  id: 2,
  lat: 61.5,
  lon: 23.8,
  name: 'Tampere',
};

const mountWithFavorites = (favorites: Location[]) => {
  const props = {
    announcements: undefined,
    favorites,
    fetchForecast: jest.fn(),
    fetchAllForecasts: jest.fn(),
    fetchMeteorologistSnapshot: jest.fn(),
    fetchNews: jest.fn(),
    fetchObservation: jest.fn(),
    fetchWarnings: jest.fn(),
    fetchFavoriteWarnings: jest.fn(),
    location: currentLocation,
    resetObservations: jest.fn(),
    setCurrentLocation: jest.fn(),
  };
  const view = render(<WeatherScreen {...props} />);
  let observationTop = 2000;

  view
    .UNSAFE_getByType(ScrollView)
    .instance.getNativeScrollRef.mockReturnValue({
      measure: jest.fn((callback: (...values: number[]) => void) =>
        callback(0, 0, 390, 800, 0, 0)
      ),
    });
  const observationView = view.UNSAFE_getAllByType(View).find(
    (node) => node.props.testID === 'observation-panel-container'
  );
  if (observationView) {
    observationView.instance.measure = jest.fn(
      (callback: (...values: number[]) => void) =>
        callback(0, 0, 390, 300, 0, observationTop)
    );
  }

  return {
    props,
    view,
    scroll: (top: number) => {
      observationTop = top;
      fireEvent.scroll(view.getByTestId('weather_scrollview'), {
        nativeEvent: { layoutMeasurement: { height: 800 } },
      });
    },
  };
};

describe('WeatherScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
    mockState.language = 'fi';
  });

  it('renders FMI layout and fetches configured data', () => {
    const fetchForecast = jest.fn();
    const fetchAllForecasts = jest.fn();
    const fetchMeteorologistSnapshot = jest.fn();
    const fetchNews = jest.fn();
    const fetchObservation = jest.fn();
    const fetchWarnings = jest.fn();
    const resetObservations = jest.fn();
    const location = { country: 'FI', id: 1, lat: 60.1, lon: 24.9 };

    const { getByTestId } = render(
      <WeatherScreen
        announcements={[{ id: 'a' }] as any}
        favorites={[]}
        fetchForecast={fetchForecast}
        fetchAllForecasts={fetchAllForecasts}
        fetchMeteorologistSnapshot={fetchMeteorologistSnapshot}
        fetchNews={fetchNews}
        fetchObservation={fetchObservation}
        fetchWarnings={fetchWarnings}
        fetchFavoriteWarnings={jest.fn()}
        location={location as any}
        resetObservations={resetObservations}
        setCurrentLocation={jest.fn()}
      />
    );

    expect(getByTestId('weather_view')).toBeTruthy();
    expect(getByTestId('next-hour-weather-background-panel')).toBeTruthy();
    expect(getByTestId('forecast-panel-vertical')).toBeTruthy();
    expect(getByTestId('warning-icons-panel')).toBeTruthy();
    expect(getByTestId('meteorologist-snapshot')).toBeTruthy();
    expect(getByTestId('sun-and-moon-panel')).toBeTruthy();
    expect(getByTestId('observation-panel')).toBeTruthy();
    expect(getByTestId('news')).toBeTruthy();
    expect(resetObservations).toHaveBeenCalledTimes(1);
    expect(fetchAllForecasts).toHaveBeenCalledTimes(1);
    expect(fetchAllForecasts).toHaveBeenCalledWith([location]);
    expect(fetchForecast).not.toHaveBeenCalled();
    expect(fetchObservation).toHaveBeenCalledWith(
      { geoid: 1, latlon: '60.1,24.9' },
      'FI'
    );
    expect(fetchWarnings).toHaveBeenCalledWith(location);
    expect(fetchMeteorologistSnapshot).toHaveBeenCalledTimes(1);
    expect(fetchNews).toHaveBeenCalledWith('fi');
  });

  it('renders legacy layout inside GradientWrapper', () => {
    mockConfigGetAll.mockReturnValue({
      news: { enabled: false },
      warnings: { apiUrl: {}, enabled: false },
      weather: {
        forecast: {},
        layout: 'legacy',
        meteorologist: {},
        observation: { enabled: false },
      },
    });

    const { getByTestId, queryByTestId } = render(
      <WeatherScreen
        announcements={undefined as any}
        favorites={[]}
        fetchForecast={jest.fn()}
        fetchAllForecasts={jest.fn()}
        fetchMeteorologistSnapshot={jest.fn()}
        fetchNews={jest.fn()}
        fetchObservation={jest.fn()}
        fetchWarnings={jest.fn()}
        fetchFavoriteWarnings={jest.fn()}
        location={{ country: 'SE', id: 1, lat: 59, lon: 18 } as any}
        resetObservations={jest.fn()}
        setCurrentLocation={jest.fn()}
      />
    );

    expect(getByTestId('gradient-wrapper')).toBeTruthy();
    expect(getByTestId('next-hour-forecast-panel')).toBeTruthy();
    expect(getByTestId('forecast-panel')).toBeTruthy();
    expect(getByTestId('observation-panel')).toBeTruthy();
    expect(queryByTestId('sun-and-moon-panel')).toBeNull();
  });

  describe('favorites panel visibility', () => {
    it.each([
      { enabled: true, visible: true },
      { enabled: false, visible: false },
      { enabled: undefined, visible: true },
    ])(
      'renders visible=$visible when favoritesPanelEnabled=$enabled',
      ({ enabled, visible }) => {
        const config = mockConfigGetAll();
        config.weather.favoritesPanelEnabled = enabled;

        const { view, props } = mountWithFavorites([favoriteLocation]);
        if (enabled === false) {
          expect(props.fetchForecast).toHaveBeenCalledTimes(1);
          expect(props.fetchForecast).toHaveBeenCalledWith(
            { geoid: currentLocation.id, latlon: '60.1,24.9' },
            currentLocation.country
          );
          expect(props.fetchAllForecasts).not.toHaveBeenCalled();
        } else {
          expect(props.fetchAllForecasts).toHaveBeenCalledTimes(1);
          expect(props.fetchAllForecasts).toHaveBeenCalledWith([
            currentLocation,
            favoriteLocation,
          ]);
          expect(props.fetchForecast).not.toHaveBeenCalled();
        }

        if (visible) {
          expect(view.getByTestId('favorites-panel')).toBeTruthy();
        } else {
          expect(view.queryByTestId('favorites-panel')).toBeNull();
        }
      }
    );

    it('hides and shows the panel when configuration changes', () => {
      const config = mockConfigGetAll();
      const { view, props } = mountWithFavorites([favoriteLocation]);
      expect(view.getByTestId('favorites-panel')).toBeTruthy();

      config.weather.favoritesPanelEnabled = false;
      view.rerender(<WeatherScreen {...props} />);

      expect(view.queryByTestId('favorites-panel')).toBeNull();
      expect(props.fetchForecast).toHaveBeenCalledTimes(1);
      expect(props.fetchAllForecasts).toHaveBeenCalledTimes(1);

      config.weather.favoritesPanelEnabled = true;
      view.rerender(<WeatherScreen {...props} />);

      expect(view.getByTestId('favorites-panel')).toBeTruthy();
      expect(props.fetchAllForecasts).toHaveBeenCalledTimes(2);
      expect(props.fetchForecast).toHaveBeenCalledTimes(1);
    });
  });

  it.each([currentLocation, favoriteLocation].flatMap((favorite) =>
    [true, false, undefined].map((scrollToTop) => ({ favorite, scrollToTop }))
  ))(
    'selects $favorite.name from favorites with scrollToTop=$scrollToTop',
    ({ favorite, scrollToTop }) => {
      const screen = mountWithFavorites([favorite]);
      const scrollTo =
        screen.view.UNSAFE_getByType(ScrollView).instance.scrollTo;
      expect(scrollTo).not.toHaveBeenCalled();

      act(() => {
        screen.view
          .UNSAFE_getByType(FavoritesPanel)
          .props.onSelectLocation(favorite, scrollToTop);
      });

      expect(screen.props.setCurrentLocation).toHaveBeenCalledTimes(1);
      expect(screen.props.setCurrentLocation).toHaveBeenCalledWith(favorite);
      if (scrollToTop === false) {
        expect(scrollTo).not.toHaveBeenCalled();
      } else {
        expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
      }
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'User action',
        'Weather',
        'Select location - favourites'
      );
    }
  );

  it('loads the forecast for the location selected from favorites', () => {
    const screen = mountWithFavorites([currentLocation, favoriteLocation]);

    act(() => {
      screen.view
        .UNSAFE_getByType(FavoritesPanel)
        .props.onSelectLocation(favoriteLocation);
    });
    screen.view.rerender(
      <WeatherScreen {...screen.props} location={favoriteLocation} />
    );

    expect(screen.props.fetchAllForecasts).toHaveBeenLastCalledWith([
      favoriteLocation,
      currentLocation,
    ]);
  });

  describe('favorite warnings', () => {
    let now: number;

    beforeEach(() => {
      now = 1_000_000;
      jest.spyOn(Date, 'now').mockImplementation(() => now);
    });

    afterEach(() => jest.restoreAllMocks());

    it.each([true, undefined, false])(
      'fetches favorite warnings only when favoritesPanelEnabled is not false (%s)',
      (enabled) => {
        mockConfigGetAll().weather.favoritesPanelEnabled = enabled;
        const screen = mountWithFavorites([currentLocation, favoriteLocation]);
        expect(screen.props.fetchWarnings).toHaveBeenCalledWith(currentLocation);
        if (enabled === false) {
          expect(screen.props.fetchFavoriteWarnings).not.toHaveBeenCalled();
        } else {
          expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledTimes(1);
          expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledWith([favoriteLocation]);
        }
      }
    );

    it('fetches favorites even when the selected country has no local warnings API', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      screen.props.fetchWarnings.mockClear();
      screen.props.fetchFavoriteWarnings.mockClear();
      screen.view.rerender(
        <WeatherScreen {...screen.props} location={{ ...currentLocation, country: 'SE' }} />
      );
      expect(screen.props.fetchWarnings).not.toHaveBeenCalled();
      expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledWith([favoriteLocation]);
    });

    it('does not fetch favorite warnings when warnings are disabled', () => {
      mockConfigGetAll().warnings.enabled = false;
      const screen = mountWithFavorites([favoriteLocation]);
      expect(screen.props.fetchWarnings).not.toHaveBeenCalled();
      expect(screen.props.fetchFavoriteWarnings).not.toHaveBeenCalled();
    });

    it.each(['favorites', 'language', 'location'])(
      'reloads favorite warnings when %s changes',
      (trigger) => {
        const screen = mountWithFavorites([favoriteLocation]);
        if (trigger === 'language') mockState.language = 'sv';
        const favorites = trigger === 'favorites' ? [] : screen.props.favorites;
        const location = trigger === 'location' ? favoriteLocation : currentLocation;
        screen.view.rerender(<WeatherScreen {...screen.props} favorites={favorites} location={location} />);
        expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledTimes(2);
        expect(screen.props.fetchFavoriteWarnings).toHaveBeenLastCalledWith(
          trigger === 'language' ? [favoriteLocation] : []
        );
      }
    );

    it('refreshes favorite warnings using the warnings interval without waiting for panel visibility', () => {
      mockConfigGetAll().warnings.updateInterval = 2;
      const screen = mountWithFavorites([favoriteLocation]);
      expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledTimes(1);

      now += 60_000;
      mockUseReloader.mockReturnValue({ shouldReload: now });
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledTimes(1);

      mockState.focused = false;
      now += 2 * 60_000;
      mockUseReloader.mockReturnValue({ shouldReload: now });
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledTimes(1);

      mockState.focused = true;
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.props.fetchFavoriteWarnings).toHaveBeenCalledTimes(2);
      expect(screen.props.fetchWarnings).toHaveBeenCalledTimes(2);
    });
  });

  describe('favorite forecasts', () => {
    let now = 1_000_000;

    beforeEach(() => {
      now = 1_000_000;
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      const config = mockConfigGetAll();
      config.weather.observation.lazyLoad = true;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each(['interval', 'language', 'location'])(
      'uses only the selected-location request when favorites are disabled and %s changes',
      (trigger) => {
        mockConfigGetAll().weather.favoritesPanelEnabled = false;
        const screen = mountWithFavorites([favoriteLocation]);
        expect(screen.props.fetchForecast).toHaveBeenCalledTimes(1);

        if (trigger === 'interval') {
          now += 6 * 60_000;
          mockUseReloader.mockReturnValue({ shouldReload: now });
        } else if (trigger === 'language') {
          mockState.language = 'sv';
        }
        const location = trigger === 'location' ? favoriteLocation : currentLocation;
        screen.view.rerender(<WeatherScreen {...screen.props} location={location} />);

        expect(screen.props.fetchForecast).toHaveBeenCalledTimes(2);
        expect(screen.props.fetchForecast).toHaveBeenLastCalledWith(
          { geoid: location.id, latlon: `${location.lat},${location.lon}` },
          location.country
        );
        expect(screen.props.fetchAllForecasts).not.toHaveBeenCalled();
      }
    );

    it('loads the selected location and favorites in one batch before scrolling, skipping duplicate IDs', () => {
      const foreignFavorite = { ...favoriteLocation, id: '3', country: 'SE' };
      const screen = mountWithFavorites([
        { ...currentLocation, id: '1' },
        favoriteLocation,
        favoriteLocation,
        foreignFavorite,
      ]);

      expect(screen.props.fetchAllForecasts.mock.calls).toEqual([
        [[currentLocation, favoriteLocation, foreignFavorite]],
      ]);
      expect(screen.props.fetchObservation).not.toHaveBeenCalled();

      screen.scroll(600);
      screen.scroll(1000);
      screen.scroll(700);
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);
    });

    it('loads favorites with the current forecast in the legacy layout', () => {
      mockConfigGetAll().weather.layout = 'default';
      const screen = mountWithFavorites([favoriteLocation]);

      expect(screen.view.queryByTestId('favorites-panel')).toBeNull();
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledWith([
        currentLocation,
        favoriteLocation,
      ]);
    });

    it('refreshes the current and favorite forecasts when favorites change', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      const nextFavorite = { ...favoriteLocation, id: 3, lat: 62, lon: 25 };

      screen.view.rerender(
        <WeatherScreen
          {...screen.props}
          favorites={[favoriteLocation, nextFavorite]}
        />
      );

      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(2);
      expect(screen.props.fetchAllForecasts).toHaveBeenLastCalledWith([
        currentLocation,
        favoriteLocation,
        nextFavorite,
      ]);
    });

    it.each([2, undefined])(
      'refreshes favorites with the current forecast after the forecast interval (%s)',
      (updateInterval) => {
        mockConfigGetAll().weather.forecast.updateInterval = updateInterval;
        const screen = mountWithFavorites([favoriteLocation]);
        expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);

        now += 60_000;
        mockUseReloader.mockReturnValue({ shouldReload: now });
        screen.view.rerender(<WeatherScreen {...screen.props} />);
        expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);

        now += (updateInterval ?? 5) * 60_000;
        mockUseReloader.mockReturnValue({ shouldReload: now });
        screen.view.rerender(<WeatherScreen {...screen.props} />);
        expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(2);
      }
    );

    it('waits until the screen is focused before refreshing expired forecasts', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      mockState.focused = false;
      now += 6 * 60_000;
      mockUseReloader.mockReturnValue({ shouldReload: now });
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);

      mockState.focused = true;
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(2);
    });

    it('reloads favorites with the current forecast when the language changes', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      mockState.language = 'sv';
      screen.view.rerender(<WeatherScreen {...screen.props} />);

      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(2);
    });

    it('keeps observation loading dependent on observation visibility', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);
      expect(screen.props.fetchObservation).not.toHaveBeenCalled();

      screen.scroll(700);

      expect(screen.props.fetchObservation).toHaveBeenCalledTimes(1);
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);
    });

    it.each([
      { name: 'no favorites', favorites: [] },
      { name: 'only the current location', favorites: [currentLocation] },
      {
        name: 'only the current location with a string ID',
        favorites: [{ ...currentLocation, id: '1' }],
      },
    ])('loads the selected location once with $name', ({ favorites }) => {
      const screen = mountWithFavorites(favorites);

      expect(screen.props.fetchAllForecasts).toHaveBeenCalledTimes(1);
      expect(screen.props.fetchAllForecasts).toHaveBeenCalledWith([
        currentLocation,
      ]);
    });
  });
});
