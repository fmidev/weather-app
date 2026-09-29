import { NativeModules, Platform } from 'react-native';

type NavigationBarNativeModule = {
  setDarkTheme: (isDark: boolean) => void;
};

export const setNavigationBarTheme = (isDark: boolean): void => {
  if (Platform.OS === 'android') {
    const navigationBar = NativeModules.NavigationBar as NavigationBarNativeModule;
    navigationBar.setDarkTheme(isDark);
  }
};
