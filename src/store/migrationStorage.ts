import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Storage } from 'redux-persist';
import { reduxMMKVStorage } from '@store/mmkvStorage';

// Migrates redux-persist keys from AsyncStorage to MMKV on their first read.
export const migrationStorage: Storage = {
  getItem: async (key: string) => {
    const value = await reduxMMKVStorage.getItem(key);
    if (value !== undefined && value !== null) return value;

    const legacyValue = await AsyncStorage.getItem(key);
    if (legacyValue === null) return null;

    try {
      // Keep redux-persist's serialized format unchanged during the transfer.
      await reduxMMKVStorage.setItem(key, legacyValue);
      await AsyncStorage.removeItem(key);
    } catch {
      // Restore the user's settings even if migration fails. The legacy copy
      // remains available for a later attempt if the MMKV write failed.
    }
    return legacyValue;
  },
  setItem: (key: string, value: string) => reduxMMKVStorage.setItem(key, value),
  removeItem: async (key: string) => {
    // Clear the legacy copy first so a failed purge cannot restore old settings.
    await AsyncStorage.removeItem(key);
    await reduxMMKVStorage.removeItem(key);
  },
};
