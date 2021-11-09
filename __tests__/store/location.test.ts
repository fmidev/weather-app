import reducer from '@store/location/reducer';
import * as types from '@store/location/types';
import { Config } from '@config';
import defaultConfig from '../config/testConfig';

const location: types.Location = {
  name: 'Test',
  area: 'Region',
  id: 7,
  lat: 12,
  lon: 34,
};

const defaultState: types.LocationState = {
  favorites: Array.from({ length: 5 }).map((_, i) => ({ ...location, id: i })),
  recent: Array.from({ length: 3 }).map((_, i) => ({ ...location, id: i })),
  search: [location],
  current: location,
  geolocation: undefined,
  isGeolocation: undefined,
};

describe('location reducer', () => {
  Config.setDefaultConfig({
    ...defaultConfig,
    location: { ...defaultConfig.location, maxRecent: 3 },
  });

  it('should handle SET_GEOLOCATION', () => {
    const helsinkiCoordinates = {
      latitude: 60.1733244,
      longitude: 24.9410248,
    };

    expect(
      reducer(defaultState, {
        type: types.SET_GEOLOCATION,
        geolocation: helsinkiCoordinates,
      })
    ).toMatchObject({
      geolocation: helsinkiCoordinates,
    });
  });

  it('should handle ADD_FAVORITE', () => {
    expect(
      reducer(defaultState, {
        type: types.ADD_FAVORITE,
        location,
      })
    ).toMatchObject({
      favorites: [...defaultState.favorites, location],
    });
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
      })
    ).toMatchObject({
      recent: defaultState.recent,
    });

    const updateReducer = reducer(defaultState, {
      type: types.UPDATE_RECENT_SEARCHES,
      location,
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
});
