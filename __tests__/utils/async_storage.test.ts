import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clear,
  DYNAMICCONFIG,
  DYNAMICCONFIG_ETAG,
  getItem,
  LOCALE,
  multiGet,
  removeItem,
  setItem,
  THEME,
  UNITS,
  VERSION,
} from '@utils/async_storage';

describe('async_storage utils', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  afterAll(() => {
    consoleError.mockRestore();
    consoleLog.mockRestore();
  });

  it('exports storage keys', () => {
    expect(LOCALE).toBe('locale');
    expect(UNITS).toBe('units');
    expect(THEME).toBe('theme');
    expect(VERSION).toBe('version');
    expect(DYNAMICCONFIG).toBe('dynamicconfig');
    expect(DYNAMICCONFIG_ETAG).toBe('dynamicconfig_etag');
  });

  it('sets, gets and removes a single item', async () => {
    await setItem(LOCALE, 'fi');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(LOCALE, 'fi');
    await expect(getItem(LOCALE)).resolves.toBe('fi');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(LOCALE);

    await removeItem(LOCALE);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(LOCALE);
    await expect(getItem(LOCALE)).resolves.toBeNull();
  });

  it('gets multiple items', async () => {
    await AsyncStorage.multiSet([
      [LOCALE, 'fi'],
      [THEME, 'dark'],
    ]);

    await expect(multiGet([LOCALE, THEME, VERSION])).resolves.toEqual([
      [LOCALE, 'fi'],
      [THEME, 'dark'],
      [VERSION, null],
    ]);
    expect(AsyncStorage.multiGet).toHaveBeenCalledWith([LOCALE, THEME, VERSION]);
  });

  it('clears all async storage keys via multiRemove', async () => {
    await AsyncStorage.multiSet([
      [LOCALE, 'fi'],
      [THEME, 'dark'],
    ]);

    await clear();

    expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([LOCALE, THEME]);
    await expect(AsyncStorage.getAllKeys()).resolves.toEqual([]);
    expect(consoleLog).toHaveBeenCalledWith('Clearing async storage');
    expect(consoleLog).toHaveBeenCalledWith('Async storage clear');
  });

  it('throws contextual error when getItem fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('boom'));

    await expect(getItem(LOCALE)).rejects.toThrow(
      'Error getting item with key: locale'
    );
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('throws contextual error when multiGet fails', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockRejectedValueOnce(new Error('boom'));

    await expect(multiGet([LOCALE, THEME])).rejects.toThrow(
      'Error getting items with keys: locale,theme'
    );
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('throws contextual error when setItem fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('boom'));

    await expect(setItem(THEME, 'dark')).rejects.toThrow(
      'Error setting item theme : dark'
    );
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('throws contextual error when removeItem fails', async () => {
    jest
      .spyOn(AsyncStorage, 'removeItem')
      .mockRejectedValueOnce(new Error('boom'));

    await expect(removeItem(VERSION)).rejects.toThrow(
      'Error removing item with key version'
    );
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('throws contextual error when clear fails', async () => {
    jest.spyOn(AsyncStorage, 'getAllKeys').mockRejectedValueOnce(new Error('boom'));

    await expect(clear()).rejects.toThrow('Error clearing async storage');
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
  });
});
