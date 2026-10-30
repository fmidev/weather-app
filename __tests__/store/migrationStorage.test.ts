import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import { MMKV } from 'react-native-mmkv';

import { migrationStorage } from '@store/migrationStorage';
import { reduxMMKVStorage } from '@store/mmkvStorage';
import forecastReducer, { forecastPersist } from '@store/forecast/reducer';
import { UPDATE_FORECAST_DISPLAY_FORMAT } from '@store/forecast/types';

const key = 'persist:forecast';
const preferences = {
  displayParams: [
    [0, 'smartSymbol'],
    [1, 'temperature'],
  ],
  displayFormat: 'chart',
  chartDisplayParam: 'windSpeedMS',
  showSingleHourlyForecast: true,
};
const serialize = (settings: typeof preferences) =>
  JSON.stringify({
    ...Object.fromEntries(
      Object.entries(settings).map(([name, value]) => [
        name,
        JSON.stringify(value),
      ])
    ),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  });
const legacyValue = serialize(preferences);

const restoreForecastStore = async () => {
  const reducer = persistReducer(
    {
      ...forecastPersist,
      storage: migrationStorage,
      timeout: 0,
    },
    forecastReducer
  );
  const store = createStore(reducer);
  let persistor!: ReturnType<typeof persistStore>;
  await new Promise<void>((resolve) => {
    persistor = persistStore(store, undefined, resolve);
  });
  await persistor.flush();
  return { store, persistor };
};

describe('migrationStorage (AsyncStorage to MMKV)', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    new MMKV().clearAll();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('restores all legacy forecast settings, persists edits in MMKV and retains them after restart', async () => {
    await AsyncStorage.setItem(key, legacyValue);
    const { store, persistor } = await restoreForecastStore();

    expect(store.getState()).toMatchObject(preferences);
    await expect(AsyncStorage.getItem(key)).resolves.toBeNull();
    expect(JSON.parse(new MMKV().getString(key)!)).toEqual({
      ...JSON.parse(legacyValue),
      data: JSON.stringify({}),
      auroraBorealisData: JSON.stringify({}),
      fetchTimestamp: JSON.stringify(store.getState().fetchTimestamp),
      fetchSuccessTime: JSON.stringify(0),
    });

    store.dispatch({ type: UPDATE_FORECAST_DISPLAY_FORMAT, value: 'table' });
    await persistor.flush();
    persistor.pause();

    const restarted = await restoreForecastStore();
    expect(restarted.store.getState()).toMatchObject({
      ...preferences,
      displayFormat: 'table',
    });
    restarted.persistor.pause();
  });

  it('copies the legacy blob unchanged before removing it from AsyncStorage', async () => {
    await AsyncStorage.setItem(key, legacyValue);
    const remove = jest
      .spyOn(AsyncStorage, 'removeItem')
      .mockImplementationOnce(async () => {
        expect(new MMKV().getString(key)).toBe(legacyValue);
      });

    await expect(migrationStorage.getItem(key)).resolves.toBe(legacyValue);
    expect(remove).toHaveBeenCalledWith(key);
  });

  it('prefers MMKV settings over a remaining older AsyncStorage copy', async () => {
    await AsyncStorage.setItem(key, legacyValue);
    const current = serialize({ ...preferences, displayFormat: 'table' });
    new MMKV().set(key, current);
    const readLegacy = jest.spyOn(AsyncStorage, 'getItem');

    await expect(migrationStorage.getItem(key)).resolves.toBe(current);
    expect(readLegacy).not.toHaveBeenCalled();
  });

  it('uses the default forecast settings for a new installation', async () => {
    const { store, persistor } = await restoreForecastStore();

    expect(store.getState()).toMatchObject({
      displayParams: [],
      displayFormat: 'table',
      chartDisplayParam: undefined,
      showSingleHourlyForecast: false,
    });
    await expect(AsyncStorage.getItem(key)).resolves.toBeNull();
    persistor.pause();
  });

  it('restores legacy settings and keeps the source if the MMKV migration write fails', async () => {
    await AsyncStorage.setItem(key, legacyValue);
    jest
      .spyOn(reduxMMKVStorage, 'setItem')
      .mockRejectedValueOnce(new Error('write failed'));

    await expect(migrationStorage.getItem(key)).resolves.toBe(legacyValue);
    await expect(AsyncStorage.getItem(key)).resolves.toBe(legacyValue);
    expect(new MMKV().getString(key)).toBeUndefined();

    await expect(migrationStorage.getItem(key)).resolves.toBe(legacyValue);
    expect(new MMKV().getString(key)).toBe(legacyValue);
    await expect(AsyncStorage.getItem(key)).resolves.toBeNull();
  });

  it('keeps the migrated settings available if legacy cleanup fails', async () => {
    await AsyncStorage.setItem(key, legacyValue);
    jest
      .spyOn(AsyncStorage, 'removeItem')
      .mockRejectedValueOnce(new Error('cleanup failed'));

    await expect(migrationStorage.getItem(key)).resolves.toBe(legacyValue);
    expect(new MMKV().getString(key)).toBe(legacyValue);
    await expect(AsyncStorage.getItem(key)).resolves.toBe(legacyValue);
  });

  it('writes new settings only to MMKV', async () => {
    await migrationStorage.setItem(key, legacyValue);

    expect(new MMKV().getString(key)).toBe(legacyValue);
    await expect(AsyncStorage.getItem(key)).resolves.toBeNull();
  });

  it('purges both copies so old settings cannot reappear on the next read', async () => {
    await AsyncStorage.setItem(key, legacyValue);
    new MMKV().set(key, legacyValue);

    await migrationStorage.removeItem(key);

    await expect(migrationStorage.getItem(key)).resolves.toBeNull();
    expect(new MMKV().getString(key)).toBeUndefined();
  });
});
