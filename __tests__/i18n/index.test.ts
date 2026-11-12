import type { i18n as I18n } from 'i18next';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('i18n initialization', () => {
  const originalPlatform = Platform.OS;
  const originalModule = NativeModules.AppLanguage;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    NativeModules.AppLanguage = originalModule;
  });

  it('keeps the saved app preference even when Android has a different language', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    await AsyncStorage.setItem('locale', 'sv');
    const getLanguage = jest.fn().mockResolvedValue('en-GB');
    const setLanguage = jest.fn().mockResolvedValue(undefined);
    NativeModules.AppLanguage = {
      getLanguage,
      setLanguage,
    };

    const instance = require('../../i18n').default as I18n;
    if (!instance.isInitialized) {
      await new Promise<void>((resolve) =>
        instance.on('initialized', () => resolve())
      );
    }

    expect(setLanguage).toHaveBeenCalledWith('sv');
    expect(instance.language).toBe('sv');
    expect(instance.t('settings:language')).toBe('Språk');
    expect(getLanguage).not.toHaveBeenCalled();

    await instance.changeLanguage('fi');

    expect(setLanguage).toHaveBeenLastCalledWith('fi');
  });
});
