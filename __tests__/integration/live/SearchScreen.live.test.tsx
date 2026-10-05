import './searchScreenNativeMocks';

import { AccessibilityInfo, Keyboard, View } from 'react-native';
import { act, cleanup, fireEvent, waitFor, within } from '@testing-library/react-native';
import Geolocation from 'react-native-nitro-geolocation/compat';
import { Config } from '@config';
import i18n from '@i18n';
import AreaList from '@components/search/AreaList';
import IconButton from '@components/common/IconButton';
import type { AutoComplete, Location } from '@store/location/types';
import { roundCoordinates } from '@utils/number';
import { mountSearchScreen } from './searchScreenHarness';
import { mockTrackMatomoEvent } from './weatherScreenNativeMocks';
import defaultConfig from '../../../defaultConfig';
import { liveFailures, liveResponses } from '../../../jest.live.setup';

const REQUEST_TIMEOUT_MS = 30000;
const pattern = defaultConfig.location.default.name;
let screen: ReturnType<typeof mountSearchScreen>;

const getResponse = (query: string, language: string) => liveResponses.filter(({ url, params }) =>
  url === defaultConfig.location.apiUrl && params?.pattern === query && params?.lang === language
).at(-1);

const flushDebounce = async () => {
  // Flush the screen's real 250 ms debounce before entering waitFor's async
  // act scope, which otherwise batches React 19's debounced state update.
  await act(async () => {
    await new Promise<void>((resolve) => { setTimeout(resolve, 300); });
  });
};

const waitForResults = async (query: string, language = 'fi') => {
  await flushDebounce();
  await waitFor(() => {
    expect(screen.store.getState().location.loading).toBe(false);
  }, { timeout: REQUEST_TIMEOUT_MS, interval: 100 });
  const response = getResponse(query, language);
  if (!response) {
    const failure = liveFailures.filter(({ url, params }) =>
      url === defaultConfig.location.apiUrl && params?.pattern === query && params?.lang === language
    ).at(-1);
    throw new Error(`Autocomplete (${language}): ${failure?.status ?? 'no response'} ${failure?.message ?? 'Request did not complete'}`);
  }
  expect(response.status).toBe(200);
  const data = (typeof response.data === 'string' ? JSON.parse(response.data) : response.data) as AutoComplete;
  expect(mockTrackMatomoEvent).not.toHaveBeenCalledWith('Error', 'Autocomplete', expect.anything());
  const locations = data.autocomplete.result ?? [];
  expect(screen.store.getState().location.search).toEqual(locations);
  return { ...data, autocomplete: { ...data.autocomplete, result: locations } };
};

const search = async () => {
  fireEvent.changeText(screen.view.getByTestId('search_input'), pattern);
  const data = await waitForResults(pattern);
  expect(data.autocomplete.result.length).toBeGreaterThan(0);
  return data.autocomplete.result[0];
};

const locationName = (location: Location) => location.area && location.area !== location.name
  ? `${location.name}, ${location.area}` : location.name;

const results = () => within(screen.view.getByTestId('search_results'));

const savedList = (title: string) => {
  const list = screen.view.UNSAFE_getAllByType(AreaList).find((node) => node.props.title === title);
  expect(list).toBeDefined();
  return within(list!);
};

describe('SearchScreen with live defaultConfig APIs', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    Config.setDefaultConfig(defaultConfig);
    await i18n.changeLanguage('fi');
    screen = mountSearchScreen();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('debounces typing and renders the real autocomplete response', async () => {
    const { view, store } = screen;
    const input = view.getByTestId('search_input');
    expect(input.props.accessibilityRole).toBe('search');
    expect(input.props.accessibilityLabel).toBe(i18n.t('searchScreen:label'));
    const requestCount = liveResponses.length;
    const failureCount = liveFailures.length;
    fireEvent.changeText(input, pattern.slice(0, 1));
    fireEvent.changeText(input, pattern.slice(0, 2));
    fireEvent.changeText(input, pattern);
    expect(store.getState().location.loading).toBe(true);
    expect(view.getByA11yLabel(i18n.t('searchScreen:loading'))).toBeTruthy();
    expect(liveResponses).toHaveLength(requestCount);
    const data = await waitForResults(pattern);
    expect(data.autocomplete.result.length).toBeGreaterThan(0);
    expect(results().getAllByTestId('search_result_text').map((node) => node.props.children))
      .toEqual(data.autocomplete.result.map(locationName));
    expect(getResponse(pattern, 'fi')?.params).toEqual(expect.objectContaining({
      keyword: defaultConfig.location.keyword, lang: 'fi', pattern,
    }));
    expect(liveResponses.slice(requestCount).filter(({ url, params }) =>
      url === defaultConfig.location.apiUrl && params?.pattern !== pattern
    )).toHaveLength(0);
    expect(liveFailures.slice(failureCount).filter(({ url, params }) =>
      url === defaultConfig.location.apiUrl && params?.pattern !== pattern
    )).toHaveLength(0);
  });

  it.each(['fi', 'sv', 'en'])('loads and renders the live localized response (%s)', async (language) => {
    await act(async () => { await i18n.changeLanguage(language); });
    fireEvent.changeText(screen.view.getByTestId('search_input'), pattern);
    const data = await waitForResults(pattern, language);
    expect(data.autocomplete.result.length).toBeGreaterThan(0);
    expect(results().getAllByTestId('search_result_text').map((node) => node.props.children))
      .toEqual(data.autocomplete.result.map(locationName));
    expect(getResponse(pattern, language)?.params?.lang).toBe(language);
  });

  it('selects a real result, updates history/map state, announces the selection and navigates back', async () => {
    const chosen = await search();
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    fireEvent.press(results().getAllByA11yHint(i18n.t('searchScreen:choose'))[0]);
    expect(screen.store.getState().location.current).toEqual({
      ...chosen, lat: roundCoordinates(chosen.lat), lon: roundCoordinates(chosen.lon),
    });
    expect(screen.store.getState().location.recent).toEqual([chosen]);
    expect(screen.store.getState().map.animateToArea).toBe(true);
    expect(screen.navigation.goBack).toHaveBeenCalledTimes(1);
    expect(screen.view.getByTestId('search_input').props.value).toBe('');
    expect(announce).toHaveBeenCalledWith(i18n.t('searchScreen:selectedLocation', { location: locationName(chosen) }));
    expect(dismiss).toHaveBeenCalled();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Select location - search results');
  });

  it('adds and removes a real result as a favorite using accessible buttons', async () => {
    const chosen = await search();
    fireEvent.press(results().getAllByA11yLabel(i18n.t('searchScreen:addToFavorites', { location: locationName(chosen) }))[0]);
    expect(screen.store.getState().location.favorites).toEqual([chosen]);
    expect(screen.view.getByText(i18n.t('searchScreen:favorites'))).toBeTruthy();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Add favourite - search results');
    fireEvent.press(results().getAllByA11yLabel(i18n.t('searchScreen:removeFromFavorites', { location: locationName(chosen) }))[0]);
    expect(screen.store.getState().location.favorites).toEqual([]);
    expect(screen.view.queryByText(i18n.t('searchScreen:favorites'))).toBeNull();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Remove favourite - search results');
  });

  it('selects saved favorites/recent results and clears both lists without another autocomplete request', async () => {
    const chosen = await search();
    fireEvent.press(results().getAllByA11yLabel(i18n.t('searchScreen:addToFavorites', { location: locationName(chosen) }))[0]);
    fireEvent.press(results().getAllByA11yHint(i18n.t('searchScreen:choose'))[0]);
    await flushDebounce();
    await waitFor(() => expect(screen.store.getState().location.search).toEqual([]));
    const requestCount = liveResponses.length;
    fireEvent.press(savedList(i18n.t('searchScreen:favorites')).getAllByA11yHint(i18n.t('searchScreen:choose'))[0]);
    expect(screen.store.getState().location.recent).toEqual([chosen]);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Select location - favourites');
    fireEvent.press(screen.view.getByText(i18n.t('searchScreen:clearFavorites')));
    expect(screen.store.getState().location.favorites).toEqual([]);
    fireEvent.press(savedList(i18n.t('searchScreen:recentSearches')).getAllByA11yHint(i18n.t('searchScreen:choose'))[0]);
    expect(screen.navigation.goBack).toHaveBeenCalledTimes(3);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Select location - recent searches');
    fireEvent.press(screen.view.getByText(i18n.t('searchScreen:clearRecentSearches')));
    expect(screen.store.getState().location.recent).toEqual([]);
    expect(screen.view.queryByText(i18n.t('searchScreen:recentSearches'))).toBeNull();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Remove all favourites');
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Remove search history');
    expect(liveResponses).toHaveLength(requestCount);
  });

  it('clears the query and loaded results without issuing an empty-pattern request', async () => {
    await search();
    const requestCount = liveResponses.length;
    fireEvent.press(screen.view.getByTestId('search_clear_button'));
    expect(screen.view.getByTestId('search_input').props.value).toBe('');
    expect(screen.view.queryByTestId('search_clear_button')).toBeNull();
    await flushDebounce();
    await waitFor(() => expect(screen.store.getState().location.search).toEqual([]));
    expect(screen.store.getState().location.loading).toBe(false);
    expect(screen.view.queryByTestId('search_results')).toBeNull();
    expect(liveResponses).toHaveLength(requestCount);
  });

  it('renders the no-results message for a successful live search with no matches', async () => {
    const missingPattern = 'zzzxqvweatherintegrationzzzxqv';
    fireEvent.changeText(screen.view.getByTestId('search_input'), missingPattern);
    const data = await waitForResults(missingPattern);
    expect(data.autocomplete['found-results']).toBe(0);
    expect(data.autocomplete.result).toEqual([]);
    expect(screen.view.getByText(i18n.t('searchScreen:noResults'))).toBeTruthy();
    expect(screen.view.queryByTestId('search_results')).toBeNull();
  });

  it.each(['press', 'accessibilityTap'] as const)('resolves default coordinates through the live timeseries API (%s)', async (interaction) => {
    const { lat, lon } = defaultConfig.location.default;
    // Public default coordinates stand in for device GPS; the reverse lookup
    // and its schema validation use the actual WeatherApi and HTTP transport.
    jest.spyOn(Geolocation, 'getCurrentPosition').mockImplementation((success) => success({
      timestamp: Date.now(),
      coords: { latitude: lat, longitude: lon, accuracy: 1, altitude: null,
        altitudeAccuracy: null, heading: null, speed: null },
    }));
    if (interaction === 'press') {
      const button = screen.view.UNSAFE_getAllByType(IconButton).find((node) => node.props.icon === 'locate');
      fireEvent.press(button!);
    } else {
      const row = screen.view.UNSAFE_getAllByType(View).find((node) => typeof node.props.onAccessibilityTap === 'function');
      fireEvent(row!, 'accessibilityTap');
    }
    await waitFor(() => expect(screen.store.getState().location.isGeolocation).toBe(true), {
      timeout: REQUEST_TIMEOUT_MS, interval: 100,
    });
    const response = liveResponses.filter(({ url, params }) =>
      url === defaultConfig.weather.apiUrl && params?.latlon === `${roundCoordinates(lat)},${roundCoordinates(lon)}`
    ).at(-1);
    expect(response?.status).toBe(200);
    const data = (typeof response?.data === 'string' ? JSON.parse(response.data) : response?.data) as
      Record<string, { name: string; localtz: string; iso2: string }[]>;
    const geoid = Object.keys(data)[0];
    const place = data[geoid][0];
    expect(screen.store.getState().location.current).toEqual(expect.objectContaining({
      id: Number(geoid), name: place.name, timezone: place.localtz, country: place.iso2,
      lat: roundCoordinates(lat), lon: roundCoordinates(lon),
    }));
    expect(screen.navigation.goBack).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', `Geolocation - ${interaction === 'press' ? 'button' : 'accessibility tap'}`);
  });
});
