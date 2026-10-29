import './screenTestMocks';

import React from 'react';
import { ScrollView } from 'react-native';
import { render } from '@testing-library/react-native';

import WeatherScreen from '../../src/screens/WeatherScreen';
import { mockConfigGetAll, mockState, resetScreenMocks } from './screenTestMocks';

const createProps = () => ({
  announcements: undefined as any,
  fetchForecast: jest.fn(),
  fetchMeteorologistSnapshot: jest.fn(),
  fetchNews: jest.fn(),
  fetchObservation: jest.fn(),
  fetchWarnings: jest.fn(),
  location: { country: 'FI', id: 1, lat: 60.1, lon: 24.9 } as any,
  resetObservations: jest.fn(),
  locationUpdateCount: 5,
});

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

  it.each(['vertical', 'legacy'])('scrolls to the top after geolocation and search selections in the %s layout, including the same location', (layout) => {
    const config = mockConfigGetAll();
    mockConfigGetAll.mockReturnValue({
      ...config,
      weather: { ...config.weather, layout },
    });
    const props = createProps();
    const view = render(<WeatherScreen {...props} />);
    const scrollTo = view.UNSAFE_getByType(ScrollView).instance.scrollTo;
    expect(scrollTo).not.toHaveBeenCalled();
    const forecastRequests = props.fetchForecast.mock.calls.length;

    view.rerender(<WeatherScreen {...props} locationUpdateCount={6} />);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenLastCalledWith({ x: 0, y: 0, animated: true });
    expect(props.fetchForecast).toHaveBeenCalledTimes(forecastRequests);

    const manuallySelected = { ...props, location: { ...props.location, id: 2 } };
    view.rerender(<WeatherScreen {...manuallySelected} locationUpdateCount={7} />);
    expect(scrollTo).toHaveBeenCalledTimes(2);

    const requestsAfterSelection = props.fetchForecast.mock.calls.length;
    view.rerender(<WeatherScreen {...manuallySelected} locationUpdateCount={8} />);
    expect(scrollTo).toHaveBeenCalledTimes(3);
    expect(props.fetchForecast).toHaveBeenCalledTimes(requestsAfterSelection);
  });

  it('scrolls once when returning after selecting a location and keeps the scroll position when search is cancelled', () => {
    const props = createProps();
    const view = render(<WeatherScreen {...props} />);
    const scrollTo = view.UNSAFE_getByType(ScrollView).instance.scrollTo;

    mockState.focused = false;
    view.rerender(<WeatherScreen {...props} />);
    mockState.focused = true;
    view.rerender(<WeatherScreen {...props} />);
    expect(scrollTo).not.toHaveBeenCalled();

    mockState.focused = false;
    view.rerender(<WeatherScreen {...props} locationUpdateCount={6} />);
    expect(scrollTo).not.toHaveBeenCalled();

    mockState.focused = true;
    view.rerender(<WeatherScreen {...props} locationUpdateCount={6} />);
    expect(scrollTo).toHaveBeenCalledTimes(1);

    mockState.focused = false;
    view.rerender(<WeatherScreen {...props} locationUpdateCount={6} />);
    mockState.focused = true;
    view.rerender(<WeatherScreen {...props} locationUpdateCount={6} />);
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });
});
