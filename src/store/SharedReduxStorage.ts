import { Storage } from 'redux-persist';
import {
  getItem,
  setItem,
  removeItem,
  type StorageKey,
} from '../utils/async_storage';
import DefaultPreference from 'react-native-default-preference';
import { IOS_APP_GROUP } from '@assets/constants';

DefaultPreference.setName(IOS_APP_GROUP);

// Allows to share data with iOS/Android widgets
export const SharedReduxStorage: Storage = {
  setItem: async (key: string, value: string) => {
    await setItem(key as StorageKey, value); // Writes to Android SqlLite database
    if (IOS_APP_GROUP) {
      await DefaultPreference.set(key, value); // Writes to iOS UserDefaults and Android SharedPreferences
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    const value = await getItem(key as StorageKey);
    return value;
  },
  removeItem: async (key: string) => {
    await removeItem(key as StorageKey);
    if (IOS_APP_GROUP) {
      await DefaultPreference.clear(key);
    }
  },
};
