import reducer from '@store/location/reducer';
import * as actions from '@store/location/actions';
import * as selectors from '@store/location/selector';
import * as types from '@store/location/types';

const mockConfigGet = jest.fn();
const mockGetAutocomplete = jest.fn();
const mockGetLocationsLocales = jest.fn();
const mockIsCancel = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@network/AutocompleteApi', () => ({
  __esModule: true,
  default: (...args: any[]) => mockGetAutocomplete(...args),
}));

jest.mock('@network/WeatherApi', () => ({
  getLocationsLocales: (...args: any[]) => mockGetLocationsLocales(...args),
}));

jest.mock('axios', () => ({
  isCancel: (...args: any[]) => mockIsCancel(...args),
}));

const location: types.Location = {
  name: 'Test',
  area: 'Region',
  id: 7,
  lat: 12,
  lon: 34,
  country: 'FI',
  timezone: 'Europe/Helsinki',
};

const defaultState: types.LocationState = {
  favorites: Array.from({ length: 5 }).map((_, i) => ({
    ...location,
    id: i,
    area: i === 3 ? '' : location.area,
  })),
  recent: Array.from({ length: 3 }).map((_, i) => ({ ...location, id: i })),
  search: [location],
  current: location,
  isGeolocation: undefined,
  loading: false,
};

describe('location reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'location') {
        return {
          default: location,
          maxFavorite: 2,
          maxRecent: 2,
        };
      }
      return {};
    });
    mockIsCancel.mockReturnValue(false);
  });

  it('should handle ADD_FAVORITE', () => {
    expect(
      reducer(defaultState, {
        type: types.ADD_FAVORITE,
        location,
        max: 10,
      })
    ).toMatchObject({
      favorites: [...defaultState.favorites, location],
    });
  });

  it('should handle ADD_FAVORITE max limit and remove geolocation marker', () => {
    const geolocationFavorite = {
      ...location,
      id: 99,
      isGeolocation: true,
    };

    const state = reducer(defaultState, {
      type: types.ADD_FAVORITE,
      location: geolocationFavorite,
      max: 3,
    });

    expect(state.favorites).toHaveLength(3);
    expect(state.favorites.map(({ id }) => id)).toEqual([3, 4, 99]);
    expect(state.favorites[2]).not.toHaveProperty('isGeolocation');
  });

  it('should handle DELETE_FAVORITE', () => {
    expect(
      reducer(defaultState, {
        type: types.DELETE_FAVORITE,
        id: 3,
      })
    ).toMatchObject({
      favorites: expect.not.arrayContaining([{ ...location, id: 3 }]),
    });
  });

  it('should handle DELETE_ALL_FAVORITES', () => {
    expect(
      reducer(defaultState, {
        type: types.DELETE_ALL_FAVORITES,
      })
    ).toMatchObject({
      favorites: [],
    });
  });

  it('should handle UPDATE_RECENT_SEARCHES', () => {
    expect(
      reducer(defaultState, {
        type: types.UPDATE_RECENT_SEARCHES,
        location: { ...location, id: 2 },
        max: 3,
      })
    ).toMatchObject({
      recent: defaultState.recent,
    });

    const updateReducer = reducer(defaultState, {
      type: types.UPDATE_RECENT_SEARCHES,
      location,
      max: 3,
    });

    expect(updateReducer).toMatchObject({
      recent: expect.arrayContaining(
        [...defaultState.recent, location].slice(1)
      ),
    });

    expect(updateReducer).toMatchObject({
      recent: expect.not.arrayContaining(defaultState.recent.slice(0, 1)),
    });
  });

  it('should handle SET_CURRENT_LOCATION with rounded coordinates and no-op same location', () => {
    const nextLocation = {
      ...location,
      id: 20,
      isGeolocation: true,
      lat: 60.123456,
      lon: 24.987654,
    };

    const updated = reducer(defaultState, {
      type: types.SET_CURRENT_LOCATION,
      location: nextLocation,
      isGeolocation: true,
    });

    expect(updated.current).toMatchObject({
      id: 20,
      lat: 60.1235,
      lon: 24.9877,
    });
    expect(updated.current).not.toHaveProperty('isGeolocation');
    expect(updated.isGeolocation).toBe(true);
    expect(
      reducer(updated, {
        type: types.SET_CURRENT_LOCATION,
        location: { ...updated.current! },
        isGeolocation: true,
      })
    ).toBe(updated);
  });

  it('should handle SET_CURRENT_LOCATION for coordinate-only locations', () => {
    const updated = reducer(defaultState, {
      type: types.SET_CURRENT_LOCATION,
      location: {
        ...location,
        id: Number.NaN,
        lat: 60.1234,
        lon: 24.9876,
      },
    });

    expect(updated.current).toMatchObject({
      area: '',
      lat: 60.1234,
      lon: 24.9876,
      name: '60.1234, 24.9876',
    });
  });

  it('should handle DELETE_ALL_RECENT_SEARCHES', () => {
    expect(
      reducer(defaultState, {
        type: types.DELETE_ALL_RECENT_SEARCHES,
      })
    ).toMatchObject({
      recent: [],
    });
  });

  it('should handle FETCH_AUTOCOMPLETE', () => {
    expect(
      reducer(defaultState, {
        type: types.FETCH_AUTOCOMPLETE,
        data: {
          autocomplete: {
            result: [location, location],
            'max-results': 20,
            'found-results': 2,
          },
        },
      })
    ).toMatchObject({
      search: [location, location],
      loading: false,
    });
  });

  it('should handle FETCH_AUTOCOMPLETE without result data', () => {
    expect(
      reducer({ ...defaultState, loading: true }, {
        type: types.FETCH_AUTOCOMPLETE,
        data: undefined,
      })
    ).toMatchObject({
      loading: false,
      search: [],
    });
  });

  it('should handle RESET_AUTOCOMPLETE', () => {
    expect(
      reducer(defaultState, {
        type: types.RESET_AUTOCOMPLETE,
      })
    ).toMatchObject({
      search: [],
    });
  });

  it('should handle UPDATE_LOCATIONS_LOCALES', () => {
    expect(
      reducer(defaultState, {
        type: types.UPDATE_LOCATIONS_LOCALES,
        data: {
          '3': [
            {
              iso2: 'FI',
              name: 'Test',
              region: 'Suomi',
              country: 'Suomi',
              latitude: 1,
              longitude: 2,
              localtz: 'Europe/Helsinki',
            },
          ],
          '4': [
            {
              iso2: 'FI',
              name: 'Testi',
              region: 'Suomi',
              country: 'Suomi',
              latitude: 1,
              longitude: 2,
              localtz: 'Europe/Helsinki',
            },
          ],
        },
      })
    ).toMatchObject({
      favorites: defaultState.favorites.map((item) =>
        item.id === 4 ? { ...item, name: 'Testi' } : item
      ),
    });
  });

  it('should handle SET_LOADING', () => {
    expect(
      reducer(defaultState, {
        type: types.SET_LOADING,
        loading: true,
      })
    ).toMatchObject({
      loading: true,
    });
  });

  it('selects current, recent, favorites, search and stored geoids', () => {
    const state = {
      location: {
        ...defaultState,
        current: { ...location, id: 50, name: 'Current' },
        isGeolocation: true,
        recent: [
          { ...location, id: 1, name: 'Recent' },
          { ...location, id: 50, name: 'Old current' },
        ],
      },
    } as any;

    expect(selectors.selectCurrent(state)).toEqual(state.location.current);
    expect(selectors.selectGeoid(state)).toBe(50);
    expect(selectors.selectTimeZone(state)).toBe('Europe/Helsinki');
    expect(selectors.selectRecent(state)).toEqual([
      { ...location, id: 1, name: 'Recent' },
      { ...state.location.current, isGeolocation: true },
    ]);
    expect(selectors.selectFavorites(state)).toEqual(defaultState.favorites);
    expect(selectors.selectSearch(state)).toEqual(defaultState.search);
    expect(selectors.selectLoading(state)).toBe(false);
    expect(selectors.selectIsGeolocation(state)).toBe(true);
    expect(selectors.selectStoredGeoids(state)).toEqual([0, 1, 2, 3, 4, 1, 50]);
  });

  it('selects fallback current location from config', () => {
    expect(
      selectors.selectCurrent({
        location: {
          ...defaultState,
          current: undefined,
        },
      } as any)
    ).toEqual(location);
  });

  it('dispatches synchronous location actions', () => {
    const dispatch = jest.fn();

    actions.setCurrentLocation(location, true)(dispatch);
    actions.addFavorite(location)(dispatch);
    actions.deleteFavorite(7)(dispatch);
    actions.deleteAllFavorites()(dispatch);
    actions.updateRecentSearches(location)(dispatch);
    actions.deleteAllRecentSearches()(dispatch);
    actions.resetSearch()(dispatch);
    actions.setLoading(true)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: types.SET_CURRENT_LOCATION,
      location,
      isGeolocation: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.ADD_FAVORITE,
      location,
      max: 2,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.DELETE_FAVORITE,
      id: 7,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.DELETE_ALL_FAVORITES,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_RECENT_SEARCHES,
      location,
      max: 2,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.DELETE_ALL_RECENT_SEARCHES,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.RESET_AUTOCOMPLETE,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.SET_LOADING,
      loading: true,
    });
  });

  it('dispatches autocomplete result and reset on non-cancel error', async () => {
    const dispatch = jest.fn();
    const data = {
      autocomplete: {
        'found-results': 1,
        'max-results': 20,
        result: [location],
      },
    };
    mockGetAutocomplete.mockResolvedValueOnce(data);

    actions.searchLocation('hel')(dispatch);
    await flushPromises();

    expect(mockGetAutocomplete).toHaveBeenCalledWith('hel');
    expect(dispatch).toHaveBeenCalledWith({
      type: types.FETCH_AUTOCOMPLETE,
      data,
    });

    mockGetAutocomplete.mockRejectedValueOnce(new Error('failed'));
    actions.searchLocation('bad')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: types.RESET_AUTOCOMPLETE,
    });
  });

  it('does not reset autocomplete on cancelled request', async () => {
    const dispatch = jest.fn();
    mockIsCancel.mockReturnValueOnce(true);
    mockGetAutocomplete.mockRejectedValueOnce(new Error('cancelled'));

    actions.searchLocation('cancelled')(dispatch);
    await flushPromises();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches locale updates only when geoids are provided', async () => {
    const dispatch = jest.fn();
    const data = {
      '7': [
        {
          country: 'Finland',
          iso2: 'FI',
          latitude: 1,
          localtz: 'Europe/Helsinki',
          longitude: 2,
          name: 'Testi',
          region: 'Uusimaa',
        },
      ],
    };
    mockGetLocationsLocales.mockResolvedValueOnce(data);

    actions.updateLocationsLocales([])(dispatch);
    expect(mockGetLocationsLocales).not.toHaveBeenCalled();

    actions.updateLocationsLocales([7])(dispatch);
    await flushPromises();

    expect(mockGetLocationsLocales).toHaveBeenCalledWith([7]);
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_LOCATIONS_LOCALES,
      data,
    });
  });
});

const flushPromises = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
