import { applyMiddleware, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import forecastCacheMiddleware from '@store/forecast/cacheMiddleware';
import forecastReducer, { forecastPersist } from '@store/forecast/reducer';
import locationReducer from '@store/location/reducer';
import {
  ForecastActionTypes,
  TimeStepData,
} from '@store/forecast/types';
import {
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
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

const steps = [{ epochtime: 10, temperature: 5 } as TimeStepData];

const createTestStore = (
  current: Location | undefined,
  favorites: Location[],
  cachedIds = ['1', '2', '3', '4'],
  reduceForecast = forecastReducer
) => {
  const initialState = {
    forecast: {
      ...forecastReducer(undefined, {} as ForecastActionTypes),
      data: Object.fromEntries(cachedIds.map((id) => [id, steps])),
      auroraBorealisData: Object.fromEntries(cachedIds.map((id) => [id, true])),
    },
    location: {
      ...locationReducer(undefined, {} as LocationActionTypes),
      current,
      favorites,
    },
  } as State;

  return createStore(
    (
      state: State | undefined,
      action: ForecastActionTypes | LocationActionTypes
    ) => {
      const previous = state ?? initialState;
      return {
        ...previous,
        forecast: reduceForecast(
          previous.forecast,
          action as ForecastActionTypes
        ),
        location: locationReducer(
          previous.location,
          action as LocationActionTypes
        ),
      };
    },
    applyMiddleware(forecastCacheMiddleware)
  );
};

describe('forecast cache middleware', () => {
  it('removes deleted favorites and unrelated forecasts while retaining the selection and other favorites', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: DELETE_FAVORITE, id: 2 });

    expect(store.getState().forecast.data).toEqual({ 1: steps, 3: steps });
    expect(store.getState().forecast.auroraBorealisData).toEqual({
      1: true,
      3: true,
    });
  });

  it('retains the selected location even when removed from favorites', () => {
    const store = createTestStore(location(1), [location(1), location('2')]);
    store.dispatch({ type: DELETE_FAVORITE, id: 1 });

    expect(store.getState().forecast.data).toEqual({ 1: steps, 2: steps });
  });

  it('retains only the selected location when all favorites are deleted', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: DELETE_ALL_FAVORITES });

    expect(store.getState().forecast.data).toEqual({ 1: steps });
    expect(store.getState().forecast.auroraBorealisData).toEqual({ 1: true });
  });

  it('prunes the favorite evicted by the maximum favorite count when adding a location', () => {
    const store = createTestStore(location(1), [location(2), location(3)]);
    store.dispatch({ type: ADD_FAVORITE, location: location(4), max: 2 });

    expect(store.getState().location.favorites.map(({ id }) => id)).toEqual([
      3, 4,
    ]);
    expect(store.getState().forecast.data).toEqual({
      1: steps,
      3: steps,
      4: steps,
    });
  });

  it('prunes the previous selection when switching locations, keeping favorites cached', () => {
    const store = createTestStore(location(1), [location(2)]);
    store.dispatch({ type: SET_CURRENT_LOCATION, location: location(3) });

    expect(store.getState().forecast.data).toEqual({ 2: steps, 3: steps });
  });

  it('retains coordinate forecasts for a selected location without a geoid', () => {
    const store = createTestStore(location(NaN), [location(2)], ['0', '2']);
    store.dispatch({ type: DELETE_ALL_FAVORITES });

    expect(store.getState().forecast.data).toEqual({ 0: steps });
    expect(store.getState().forecast.auroraBorealisData).toEqual({ 0: true });
  });

  it('retains the configured default when no location is selected', () => {
    const store = createTestStore(undefined, [location(2)], ['9', '2']);
    store.dispatch({ type: DELETE_ALL_FAVORITES });

    expect(store.getState().forecast.data).toEqual({ 9: steps });
  });

  it('persists the pruned cache after favorite changes', async () => {
    await AsyncStorage.clear();
    const store = createTestStore(
      location(1),
      [location(2)],
      ['1', '2', '3'],
      persistReducer(
        { ...forecastPersist, storage: AsyncStorage, timeout: 0 },
        forecastReducer
      ) as typeof forecastReducer
    );
    let persistor!: ReturnType<typeof persistStore>;
    await new Promise<void>((resolve) => {
      persistor = persistStore(store, undefined, resolve);
    });

    try {
      store.dispatch({ type: DELETE_ALL_FAVORITES });
      await persistor.flush();
      const value = await AsyncStorage.getItem('persist:forecast');
      const persisted = JSON.parse(value!);
      expect(JSON.parse(persisted.data)).toEqual({ 1: steps });
      expect(JSON.parse(persisted.auroraBorealisData)).toEqual({ 1: true });
    } finally {
      persistor.pause();
    }
  });
});
