import reducer from '@store/location/reducer';
import * as types from '@store/location/types';

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
  favorites: Array.from({ length: 5 }).map((_, i) => ({ ...location, id: i })),
  recent: Array.from({ length: 3 }).map((_, i) => ({ ...location, id: i })),
  search: [location],
  current: location,
  isGeolocation: undefined,
};

describe('location reducer', () => {
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
