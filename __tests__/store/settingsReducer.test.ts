import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from 'redux';
import { persistReducer, persistStore, Persistor } from 'redux-persist';
import type { SettingsActionTypes } from '@store/settings/types';
import { UPDATE_FORECAST_BACKGROUND_IMAGES } from '@store/settings/types';

let mockBackgroundImagesEnabled: boolean | undefined;

jest.mock('../../defaultConfig', () => ({
  __esModule: true,
  default: {
    get weather() {
      return { backgroundImagesEnabled: mockBackgroundImagesEnabled };
    },
  },
}));

jest.mock('@utils/units', () => ({
  getDefaultUnits: () => undefined,
}));

const loadReducer = () =>
  require('@store/settings/reducer') as typeof import('@store/settings/reducer');

const startStore = async (preference?: boolean) => {
  const { default: reducer, settingsPersist } = loadReducer();
  const store = createStore(
    persistReducer(
      {
        ...settingsPersist,
        storage: AsyncStorage,
        timeout: 0,
      },
      reducer
    )
  );
  const persistor = await new Promise<Persistor>((resolve) => {
    const instance = persistStore(store, undefined, () => resolve(instance));
  });

  if (preference !== undefined) {
    store.dispatch({
      type: UPDATE_FORECAST_BACKGROUND_IMAGES,
      enabled: preference,
    });
  }

  await persistor.flush();
  persistor.pause();

  return store;
};

describe('settings reducer background image initialization', () => {
  beforeEach(async () => {
    jest.resetModules();
    mockBackgroundImagesEnabled = undefined;
    await AsyncStorage.clear();
  });

  it.each([
    { configured: true, expected: true },
    { configured: false, expected: false },
    { configured: undefined, expected: true },
  ])(
    'initializes background images to $expected when config is $configured',
    ({ configured, expected }) => {
      mockBackgroundImagesEnabled = configured;
      const { default: reducer } = loadReducer();

      const state = reducer(undefined, {} as SettingsActionTypes);

      expect(state.forecastBackgroundImages).toBe(expected);
    }
  );

  it.each([true, false])(
    'persists %s and restores it after the config default changes',
    async (enabled) => {
      mockBackgroundImagesEnabled = enabled;
      const firstStore = await startStore();

      expect(firstStore.getState().forecastBackgroundImages).toBe(enabled);
      const storedSettings = JSON.parse(
        (await AsyncStorage.getItem('persist:settings'))!
      );
      expect(JSON.parse(storedSettings.forecastBackgroundImages)).toBe(enabled);

      jest.resetModules();
      mockBackgroundImagesEnabled = !enabled;
      const nextStore = await startStore();

      expect(nextStore.getState().forecastBackgroundImages).toBe(enabled);
    }
  );

  it.each([true, false])(
    'persists the user selection %s instead of the config default',
    async (enabled) => {
      mockBackgroundImagesEnabled = !enabled;
      const firstStore = await startStore(enabled);

      expect(firstStore.getState().forecastBackgroundImages).toBe(enabled);

      jest.resetModules();
      const nextStore = await startStore();

      expect(nextStore.getState().forecastBackgroundImages).toBe(enabled);
    }
  );

  it('uses the config default for older persisted settings without the new field', async () => {
    mockBackgroundImagesEnabled = false;
    await AsyncStorage.setItem(
      'persist:settings',
      JSON.stringify({ theme: JSON.stringify('dark') })
    );

    const store = await startStore();

    expect(store.getState().forecastBackgroundImages).toBe(false);
    expect(store.getState().theme).toBe('dark');
  });
});
