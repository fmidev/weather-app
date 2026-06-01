/* global jest */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
  setRNConfiguration: jest.fn(),
}));

jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [
    {
      languageTag: 'fi-FI',
      languageCode: 'fi',
      countryCode: 'FI',
      isRTL: false,
    },
  ]),
  getNumberFormatSettings: jest.fn(() => ({
    decimalSeparator: ',',
    groupingSeparator: ' ',
  })),
  getCalendar: jest.fn(() => 'gregorian'),
  getCountry: jest.fn(() => 'FI'),
  getCurrencies: jest.fn(() => ['EUR']),
  getTemperatureUnit: jest.fn(() => 'celsius'),
  getTimeZone: jest.fn(() => 'Europe/Helsinki'),
  uses24HourClock: jest.fn(() => true),
  usesMetricSystem: jest.fn(() => true),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    GRANTED: 'granted',
    LIMITED: 'limited',
  },
  checkMultiple: jest.fn(async (permissions) =>
    permissions.reduce((acc, permission) => {
      acc[permission] = 'denied';
      return acc;
    }, {})
  ),
  request: jest.fn(async () => 'granted'),
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();

  class MMKV {
    getString(key) {
      const value = store.get(key);
      return typeof value === 'string' ? value : undefined;
    }

    set(key, value) {
      store.set(key, value);
    }

    delete(key) {
      store.delete(key);
    }

    clearAll() {
      store.clear();
    }
  }

  return { MMKV };
});
