import AsyncStorage from '@react-native-async-storage/async-storage';

// keys
export const LOCALE = 'locale';
export const UNITS = 'units';
export const THEME = 'theme';
export const VERSION = 'version';
export const DYNAMICCONFIG = 'dynamicconfig';
export const DYNAMICCONFIG_ETAG = 'dynamicconfig_etag';

type StorageKey =
  | typeof LOCALE
  | typeof UNITS
  | typeof THEME
  | typeof VERSION
  | typeof DYNAMICCONFIG
  | typeof DYNAMICCONFIG_ETAG;

export const getItem = async (key: StorageKey): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(error);
    throw Error(`Error getting item with key: ${key}`);
  }
};

export const multiGet = async (
  keys: StorageKey[]
): Promise<readonly [string, string | null][]> => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values;
  } catch (error) {
    console.error(error);
    throw Error(`Error getting items with keys: ${keys}`);
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
