import { NativeModules, Platform } from 'react-native';

import { setNavigationBarTheme } from '../../src/utils/navigationBar';

const originalPlatform = Platform.OS;
const originalNavigationBar = NativeModules.NavigationBar;

describe('setNavigationBarTheme', () => {
  const setDarkTheme = jest.fn();

  beforeEach(() => {
    setDarkTheme.mockClear();
    NativeModules.NavigationBar = { setDarkTheme };
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    NativeModules.NavigationBar = originalNavigationBar;
  });

  it.each([false, true])('sets the Android bar theme to dark=%s', (isDark) => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });

    setNavigationBarTheme(isDark);

    expect(setDarkTheme).toHaveBeenCalledWith(isDark);
  });

  it('does not call the Android module on iOS', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });

    setNavigationBarTheme(true);

    expect(setDarkTheme).not.toHaveBeenCalled();
  });
});
