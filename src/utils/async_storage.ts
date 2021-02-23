import AsyncStorage from '@react-native-community/async-storage';

// keys
export const LOCALE = 'locale';
export const FAVORITES = 'favorites';

type StorageKey = typeof LOCALE | typeof FAVORITES;

export const getItem = async (key: StorageKey): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(error);
    throw Error(`Error getting item with key: ${key}`);
  }
};

export const setItem = async (
  key: StorageKey,
  value: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(error);
    throw Error(`Error setting item ${key} : ${value}`);
  }
};

export const removeItem = async (key: StorageKey): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(error);
    throw Error(`Error removing item with key ${key}`);
  }
};

export const clear = async (): Promise<void> => {
  try {
    console.log('Clearing async storage');
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    console.log('Async storage clear');
  } catch (error) {
    console.error(error);
    throw Error(`Error clearing async storage`);
  }
};
