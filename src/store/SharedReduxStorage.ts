import { Storage } from 'redux-persist';
import {
  getItem,
  setItem,
  removeItem,
  type StorageKey,
} from '../utils/async_storage';
import DefaultPreference from 'react-native-default-preference';

DefaultPreference.setName('group.fi.fmi.mobileweather.settings');

// Allows to share data with iOS/Android widgets
export const SharedReduxStorage: Storage = {
  setItem: async (key: string, value: string) => {
    await setItem(key as StorageKey, value); // Writes to Android SqlLite database
    await DefaultPreference.set(key, value); // Writes to iOS UserDefaults and Android SharedPreferences
  },
  getItem: async (key: string): Promise<string | null> => {
    const value = await getItem(key as StorageKey);
    return value;
  },
  removeItem: async (key: string) => {
    await removeItem(key as StorageKey);
    await DefaultPreference.clear(key);
  },
};
