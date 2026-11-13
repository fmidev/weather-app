import { applyMiddleware, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import warningsCacheMiddleware from '@store/warnings/cacheMiddleware';
import warningsReducer, { warningsPersist } from '@store/warnings/reducer';
import locationReducer from '@store/location/reducer';
import { reduxMMKVStorage } from '@store/mmkvStorage';
import {
  FETCH_WARNINGS_SUCCESS,
  FETCH_FAVORITE_WARNINGS_SUCCESS,
  WarningsActionTypes,
  WarningsData,
} from '@store/warnings/types';
import {
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
  RESET_AUTOCOMPLETE,
  Location,
  LocationActionTypes,
} from '@store/location/types';
import type { State } from '@store/types';

jest.mock('@config', () => ({
  Config: { get: () => ({ default: { id: 9 } }) },
}));

const location = (id: number | string): Location => ({
  id,
  name: `Location ${id}`,
  area: '',
  country: 'FI',
  timezone: 'Europe/Helsinki',
  lat: 60,
  lon: 25,
});
const data: WarningsData = {
  updated: '2026-11-11T09:00:00Z', error: 0, warnings: [],
};

const createTestStore = (
  current: Location | undefined,
  favorites: Location[],
  cachedIds = ['1', '2', '3', '4'],
  reduceWarnings = warningsReducer
) => {
  const initialState = {
    warnings: {
      ...warningsReducer(undefined, {} as WarningsActionTypes),
      data: Object.fromEntries(cachedIds.map((id) => [id, data])),
    },
    location: {
      ...locationReducer(undefined, {} as LocationActionTypes),
      current,
      favorites,
    },
  } as State;

  return createStore(
    (state: State | undefined, action: WarningsActionTypes | LocationActionTypes) => {
      const previous = state ?? initialState;
      return {
        ...previous,
        warnings: reduceWarnings(previous.warnings, action as WarningsActionTypes),
        location: locationReducer(previous.location, action as LocationActionTypes),
      };
    },
    applyMiddleware(warningsCacheMiddleware)
  );
};

describe('warnings cache middleware', () => {
  it('removes deleted favorites and unrelated warnings while retaining the selection and other favorites', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: DELETE_FAVORITE, id: 2 });
    expect(store.getState().warnings.data).toEqual({ 1: data, 3: data });
  });

  it('retains the selected location even when removed from favorites', () => {
    const store = createTestStore(location(1), [location(1), location('2')]);
    store.dispatch({ type: DELETE_FAVORITE, id: 1 });
    expect(store.getState().warnings.data).toEqual({ 1: data, 2: data });
  });

  it('retains only the selected location when all favorites are deleted', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: DELETE_ALL_FAVORITES });
    expect(store.getState().warnings.data).toEqual({ 1: data });
  });

  it('prunes the favorite evicted by the maximum favorite count when adding a location', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: ADD_FAVORITE, location: location(4), max: 2 });
    expect(store.getState().location.favorites.map(({ id }) => id)).toEqual([3, 4]);
    expect(store.getState().warnings.data).toEqual({ 1: data, 3: data, 4: data });
  });

  it('prunes the previous selection when switching locations, keeping favorites cached', () => {
    const store = createTestStore(location(1), [location(2)]);
    store.dispatch({ type: SET_CURRENT_LOCATION, location: location(3) });
    expect(store.getState().warnings.data).toEqual({ 2: data, 3: data });
  });

  it('retains the previous selection when it is still a favorite', () => {
    const store = createTestStore(location(1), [location(1), location('2')]);
    store.dispatch({ type: SET_CURRENT_LOCATION, location: location(3) });
    expect(store.getState().warnings.data).toEqual({ 1: data, 2: data, 3: data });
  });

  it('retains coordinate warnings under the same key used by warning responses', () => {
    const store = createTestStore(location(NaN), [location(2)], ['NaN', '2']);
    store.dispatch({ type: DELETE_ALL_FAVORITES });
    expect(store.getState().warnings.data).toEqual({ NaN: data });
  });

  it('retains the configured default when no location is selected', () => {
    const store = createTestStore(undefined, [location(2)], ['9', '2']);
    store.dispatch({ type: DELETE_ALL_FAVORITES });
    expect(store.getState().warnings.data).toEqual({ 9: data });
  });

  it('does not restore a removed favorite when an earlier batch response arrives', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: DELETE_FAVORITE, id: 2 });
    store.dispatch({
      type: FETCH_FAVORITE_WARNINGS_SUCCESS,
      data: { 2: data, 3: data, 10: data },
    });
    expect(store.getState().warnings.data).toEqual({ 1: data, 3: data });
  });

  it('does not restore the previous selection when its delayed response arrives', () => {
    const store = createTestStore(location(1), [location(2)]);
    store.dispatch({ type: SET_CURRENT_LOCATION, location: location(3) });
    store.dispatch({
      type: FETCH_WARNINGS_SUCCESS,
      id: 1, data, timestamp: 123, requestKey: 'location-1-fi',
    });
    expect(store.getState().warnings.data).toEqual({ 2: data, 3: data });
  });

  it('stores fresh warnings for the selection while removing unrelated cached entries', () => {
    const store = createTestStore(location(1), [location(2)]);
    const freshData = { ...data, updated: '2026-11-11T10:00:00Z' };
    store.dispatch({
      type: FETCH_WARNINGS_SUCCESS,
      id: 1, data: freshData, timestamp: 123, requestKey: 'location-1-fi',
    });
    expect(store.getState().warnings.data).toEqual({ 1: freshData, 2: data });
    expect(store.getState().warnings.data[1]).toBe(freshData);
    expect(store.getState().warnings.data[2]).toBe(data);
  });

  it('does not change warning state for unrelated actions', () => {
    const store = createTestStore(location(1), [location(2)]);
    const previous = store.getState().warnings;
    store.dispatch({ type: RESET_AUTOCOMPLETE });
    expect(store.getState().warnings).toBe(previous);
  });

  it('persists the pruned warnings cache after favorite changes', async () => {
    await reduxMMKVStorage.removeItem('persist:warnings');
    const store = createTestStore(
      location(1), [location(2)], ['1', '2', '3'],
      persistReducer(
        { ...warningsPersist, storage: reduxMMKVStorage, timeout: 0 },
        warningsReducer
      ) as typeof warningsReducer
    );
    let persistor!: ReturnType<typeof persistStore>;
    await new Promise<void>((resolve) => {
      persistor = persistStore(store, undefined, resolve);
    });

    try {
      store.dispatch({ type: DELETE_ALL_FAVORITES });
      await persistor.flush();
      const value = await reduxMMKVStorage.getItem('persist:warnings');
      const persisted = JSON.parse(value!);
      expect(JSON.parse(persisted.data)).toEqual({ 1: data });
    } finally {
      persistor.pause();
      await reduxMMKVStorage.removeItem('persist:warnings');
    }
  });
});
