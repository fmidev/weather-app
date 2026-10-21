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
    fetchMeteorologistSnapshot: jest.fn(),
    fetchNews: jest.fn(),
    fetchObservation: jest.fn(),
    fetchWarnings: jest.fn(),
    location: currentLocation,
    resetObservations: jest.fn(),
    setCurrentLocation: jest.fn(),
  };
  const view = render(<WeatherScreen {...props} />);
  let favoritesTop = 1000;

  view
    .UNSAFE_getByType(ScrollView)
    .instance.getNativeScrollRef.mockReturnValue({
      measure: jest.fn((callback: (...values: number[]) => void) =>
        callback(0, 0, 390, 800, 0, 0)
      ),
    });
  const nativeView = (testID: string) =>
    view.UNSAFE_getAllByType(View).find((node) => node.props.testID === testID)!
      .instance;
  nativeView('favorites-panel-container').measure = jest.fn(
    (callback: (...values: number[]) => void) =>
      callback(0, 0, 390, 100, 0, favoritesTop)
  );
  nativeView('observation-panel-container').measure = jest.fn(
    (callback: (...values: number[]) => void) =>
      callback(0, 0, 390, 300, 0, 2000)
  );

  return {
    props,
    view,
    setFavoritesTop: (top: number) => {
      favoritesTop = top;
    },
    scroll: (top: number) => {
      favoritesTop = top;
      fireEvent.scroll(view.getByTestId('weather_scrollview'), {
        nativeEvent: { layoutMeasurement: { height: 800 } },
      });
    },
    backgroundCalls: () =>
      props.fetchForecast.mock.calls.filter(
        ([, , options]) => options?.background
      ),
  };
};

describe('WeatherScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
    mockState.language = 'fi';
  });

  it('renders FMI layout and fetches configured data', () => {
    const fetchForecast = jest.fn();
    const fetchMeteorologistSnapshot = jest.fn();
    const fetchNews = jest.fn();
    const fetchObservation = jest.fn();
    const fetchWarnings = jest.fn();
    const resetObservations = jest.fn();
    const location = { country: 'FI', id: 1, lat: 60.1, lon: 24.9 };

    const { getByTestId } = render(
      <WeatherScreen
        announcements={[{ id: 'a' }] as any}
        fetchForecast={fetchForecast}
        fetchMeteorologistSnapshot={fetchMeteorologistSnapshot}
        fetchNews={fetchNews}
        fetchObservation={fetchObservation}
        fetchWarnings={fetchWarnings}
        location={location as any}
        resetObservations={resetObservations}
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
    expect(fetchForecast).toHaveBeenCalledWith(
      { geoid: 1, latlon: '60.1,24.9' },
      'FI'
    );
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
        fetchForecast={jest.fn()}
        fetchMeteorologistSnapshot={jest.fn()}
        fetchNews={jest.fn()}
        fetchObservation={jest.fn()}
        fetchWarnings={jest.fn()}
        location={{ country: 'SE', id: 1, lat: 59, lon: 18 } as any}
        resetObservations={jest.fn()}
      />
    );

    expect(getByTestId('gradient-wrapper')).toBeTruthy();
    expect(getByTestId('next-hour-forecast-panel')).toBeTruthy();
    expect(getByTestId('forecast-panel')).toBeTruthy();
    expect(getByTestId('observation-panel')).toBeTruthy();
    expect(queryByTestId('sun-and-moon-panel')).toBeNull();
  });

  it.each([currentLocation, favoriteLocation])(
    'selects $name from favorites and scrolls to the top, including the current location',
    (favorite) => {
      const screen = mountWithFavorites([favorite]);
      const scrollTo =
        screen.view.UNSAFE_getByType(ScrollView).instance.scrollTo;
      expect(scrollTo).not.toHaveBeenCalled();

      act(() => {
        screen.view
          .UNSAFE_getByType(FavoritesPanel)
          .props.onSelectLocation(favorite);
      });

      expect(screen.props.setCurrentLocation).toHaveBeenCalledTimes(1);
      expect(screen.props.setCurrentLocation).toHaveBeenCalledWith(favorite);
      expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'User action',
        'Weather',
        'Select location - favourites'
      );
    }
  );

  it('loads the forecast for the location selected from favorites', () => {
    const screen = mountWithFavorites([favoriteLocation]);

    act(() => {
      screen.view
        .UNSAFE_getByType(FavoritesPanel)
        .props.onSelectLocation(favoriteLocation);
    });
    screen.view.rerender(
      <WeatherScreen {...screen.props} location={favoriteLocation} />
    );

    expect(screen.props.fetchForecast).toHaveBeenCalledWith(
      {
        geoid: favoriteLocation.id,
        latlon: `${favoriteLocation.lat},${favoriteLocation.lon}`,
      },
      favoriteLocation.country
    );
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

    it('loads favorites only when visible, skipping the current location and duplicate favorites', () => {
      const foreignFavorite = { ...favoriteLocation, id: '3', country: 'SE' };
      const screen = mountWithFavorites([
        { ...currentLocation, id: '1' },
        favoriteLocation,
        favoriteLocation,
        foreignFavorite,
      ]);

      screen.scroll(800);
      expect(screen.backgroundCalls()).toHaveLength(0);
      expect(screen.props.fetchForecast).toHaveBeenCalledTimes(1);

      screen.scroll(700);
      expect(screen.backgroundCalls()).toEqual([
        [{ geoid: 2, latlon: '61.5,23.8' }, 'FI', { background: true }],
        [{ geoid: '3', latlon: '61.5,23.8' }, 'SE', { background: true }],
      ]);
      expect(screen.props.fetchObservation).not.toHaveBeenCalled();

      screen.scroll(600);
      screen.scroll(1000);
      screen.scroll(700);
      expect(screen.backgroundCalls()).toHaveLength(2);
    });

    it.each(['layout', 'contentSizeChange'])(
      'loads initially visible favorites on %s without scrolling',
      (event) => {
        const screen = mountWithFavorites([favoriteLocation]);
        screen.setFavoritesTop(400);

        fireEvent(
          screen.view.getByTestId(
            event === 'layout'
              ? 'favorites-panel-container'
              : 'weather_scrollview'
          ),
          event
        );

        expect(screen.backgroundCalls()).toHaveLength(1);
      }
    );

    it('loads newly added favorites without reloading fresh forecasts', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      screen.scroll(700);
      const nextFavorite = { ...favoriteLocation, id: 3, lat: 62, lon: 25 };

      screen.view.rerender(
        <WeatherScreen
          {...screen.props}
          favorites={[favoriteLocation, nextFavorite]}
        />
      );

      expect(screen.backgroundCalls()).toHaveLength(2);
      expect(screen.props.fetchForecast).toHaveBeenLastCalledWith(
        { geoid: 3, latlon: '62,25' },
        'FI',
        { background: true }
      );
    });

    it('refreshes visible favorites after the forecast interval and waits while hidden', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      screen.scroll(700);

      now += 60_000;
      mockUseReloader.mockReturnValue({ shouldReload: now });
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.backgroundCalls()).toHaveLength(1);

      now += 5 * 60_000;
      mockUseReloader.mockReturnValue({ shouldReload: now });
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.backgroundCalls()).toHaveLength(2);

      screen.scroll(1000);
      now += 6 * 60_000;
      mockUseReloader.mockReturnValue({ shouldReload: now });
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.backgroundCalls()).toHaveLength(2);

      screen.scroll(700);
      expect(screen.backgroundCalls()).toHaveLength(3);
    });

    it('waits until the screen is focused before loading visible favorites', () => {
      mockState.focused = false;
      const screen = mountWithFavorites([favoriteLocation]);
      screen.scroll(700);
      expect(screen.backgroundCalls()).toHaveLength(0);

      mockState.focused = true;
      screen.view.rerender(<WeatherScreen {...screen.props} />);
      expect(screen.backgroundCalls()).toHaveLength(1);
    });

    it('reloads visible favorites when the language changes', () => {
      const screen = mountWithFavorites([favoriteLocation]);
      screen.scroll(700);

      mockState.language = 'sv';
      screen.view.rerender(<WeatherScreen {...screen.props} />);

      expect(screen.backgroundCalls()).toHaveLength(2);
    });

    it('makes no additional forecast requests without favorites', () => {
      const screen = mountWithFavorites([]);
      screen.scroll(700);

      expect(screen.props.fetchForecast).toHaveBeenCalledTimes(1);
      expect(screen.backgroundCalls()).toHaveLength(0);
    });
  });
});
