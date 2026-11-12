import moment from 'moment-timezone';
import { createInstance, type i18n } from 'i18next';
import {
  AppState,
  DeviceEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../../i18n/en.json';
import fi from '../../i18n/fi.json';
import sv from '../../i18n/sv.json';
import {
  formatAccessibleDateTime,
  formatAccessiblePrecipitation,
  formatAccessibleTemperature,
  formatAccessibleTime,
  setAndroidAppLanguage,
  syncAndroidAppLanguage,
} from '../../src/utils/accessibility';

const translateTime = (key: string) =>
  key === 'time:amSpoken' ? 'in the morning' : 'in the afternoon';

describe('formatAccessibleTime', () => {
  it('formats only the time using a 24-hour clock by default', () => {
    const t = jest.fn();
    const date = moment.utc('2024-01-02T09:05:00Z');

    expect(formatAccessibleTime(date, t)).toBe('9:05');
    expect(formatAccessibleTime(date, t, true)).toBe('9:05');
    expect(t).not.toHaveBeenCalled();
  });

  it.each([
    ['00:00', '12:00 in the morning'],
    ['09:05', '9:05 in the morning'],
    ['11:59', '11:59 in the morning'],
    ['12:00', '12:00 in the afternoon'],
    ['23:59', '11:59 in the afternoon'],
  ])('uses a spoken period for %s on a 12-hour clock', (time, expected) => {
    const date = moment.utc(`2024-01-02T${time}:00Z`);

    expect(formatAccessibleTime(date, translateTime, false)).toBe(expected);
  });

  it('uses the time in the supplied timezone without changing the moment', () => {
    const date = moment.utc('2024-01-02T22:05:00Z').tz('Europe/Helsinki');
    const original = date.format();

    expect(formatAccessibleTime(date, translateTime)).toBe('0:05');
    expect(formatAccessibleTime(date, translateTime, false)).toBe(
      '12:05 in the morning'
    );
    expect(date.format()).toBe(original);
  });
});

describe('formatAccessibleDateTime', () => {
  const date = moment.utc('2024-01-02T13:05:00Z').locale('en');

  it('includes the date and 24-hour time by default', () => {
    expect(formatAccessibleDateTime(date, translateTime)).toBe(
      'Tuesday, January 2, 2024 13:05'
    );
  });

  it('supports a 12-hour time and omitting the year', () => {
    expect(formatAccessibleDateTime(date, translateTime, false, false)).toBe(
      'Tuesday, 2. January 1:05 in the afternoon'
    );
  });
});

describe('formatAccessibleTemperature', () => {
  const t = (key: string) => (key === 'forecast:minus' ? 'minus' : key);

  it('converts negative temperature to spoken minus format', () => {
    expect(formatAccessibleTemperature(-7, t)).toBe('minus 7');
    expect(formatAccessibleTemperature('-3', t)).toBe('minus 3');
  });

  it('returns plain value for zero and positive values', () => {
    expect(formatAccessibleTemperature(0, t)).toBe('0');
    expect(formatAccessibleTemperature(12, t)).toBe('12');
  });

  it('returns dash for invalid values', () => {
    expect(formatAccessibleTemperature('', t)).toBe('-');
    expect(formatAccessibleTemperature(undefined, t)).toBe('-');
    expect(formatAccessibleTemperature(null, t)).toBe('-');
    expect(formatAccessibleTemperature('not-a-number', t)).toBe('-');
  });
});

const originalPlatform = Platform.OS;
const originalModule = NativeModules.AppLanguage;
const flushPromises = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

describe('Android app language', () => {
  let instance: i18n;
  let stopSyncing: (() => void) | undefined;
  const setLanguage = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    NativeModules.AppLanguage = { setLanguage };
    setLanguage.mockResolvedValue(undefined);
    instance = createInstance();
    await instance.init({
      lng: 'fi',
      fallbackLng: 'fi',
      resources: { fi: {}, sv: {}, en: {} },
    });
  });

  afterEach(() => {
    stopSyncing?.();
    stopSyncing = undefined;
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    NativeModules.AppLanguage = originalModule;
  });

  it.each(['fi', 'sv', 'en'])(
    'sets Android to the app language %s',
    async (language) => {
      await setAndroidAppLanguage(language);

      expect(setLanguage).toHaveBeenCalledWith(language);
    }
  );

  it.each(['ios', 'android'] as const)(
    'works without the native module on %s',
    async (os) => {
      Object.defineProperty(Platform, 'OS', { value: os });
      NativeModules.AppLanguage = undefined;

      await setAndroidAppLanguage('sv');
      stopSyncing = syncAndroidAppLanguage(instance);
      await instance.changeLanguage('en');

      expect(setLanguage).not.toHaveBeenCalled();
    }
  );

  it('never calls the Android module on iOS even if it is available', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });

    await setAndroidAppLanguage('sv');
    stopSyncing = syncAndroidAppLanguage(instance);
    await instance.changeLanguage('en');

    expect(setLanguage).not.toHaveBeenCalled();
  });

  it.each(['fi', 'sv', 'en'])(
    'synchronizes an in-app language change to %s',
    async (language) => {
      stopSyncing = syncAndroidAppLanguage(instance);

      await instance.changeLanguage(language);

      expect(setLanguage).toHaveBeenCalledWith(language);
    }
  );

  it('keeps the app language when Android settings change or the app resumes', async () => {
    const appStateSubscription = jest.spyOn(AppState, 'addEventListener');
    stopSyncing = syncAndroidAppLanguage(instance);

    DeviceEventEmitter.emit('appLanguageChanged');
    DeviceEventEmitter.emit('appStateDidChange', { app_state: 'active' });
    await flushPromises();

    expect(instance.language).toBe('fi');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(setLanguage).not.toHaveBeenCalled();
    expect(appStateSubscription).not.toHaveBeenCalled();
  });

  it('reports a native write failure without rejecting the i18next language change', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    stopSyncing = syncAndroidAppLanguage(instance);
    setLanguage.mockRejectedValueOnce(new Error('Native failure'));

    await instance.changeLanguage('sv');
    await flushPromises();

    expect(instance.language).toBe('sv');
    expect(console.error).toHaveBeenCalledWith(
      'Failed to update the Android app language:',
      expect.any(Error)
    );
  });

  it('keeps initialization working if the native language write fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    setLanguage.mockRejectedValueOnce(new Error('Native failure'));

    await expect(setAndroidAppLanguage('sv')).resolves.toBeUndefined();
  });

  it('removes the i18next listener on disposal', async () => {
    stopSyncing = syncAndroidAppLanguage(instance);
    stopSyncing();

    await instance.changeLanguage('sv');

    expect(setLanguage).not.toHaveBeenCalled();
  });
});

describe('formatAccessiblePrecipitation', () => {
  const i18n = createInstance();
  i18n.init({
    initImmediate: false,
    lng: 'en',
    // Callers include both a forecast-scoped strip and a daily row with another namespace.
    defaultNS: 'navigation',
    resources: { en, fi, sv },
  });
  const precipitationData = [
    {
      precipitation: 1.2,
      timestamp: moment.utc('2035-06-01T06:00:00Z').unix(),
    },
    {
      precipitation: 1.2,
      timestamp: moment.utc('2035-06-01T18:00:00Z').unix(),
    },
  ];

  beforeEach(() => {
    moment.tz.setDefault('UTC');
  });

  afterEach(() => {
    moment.tz.setDefault();
  });

  it('uses the forecast translations independently of the caller namespace', () => {
    expect(
      formatAccessiblePrecipitation(precipitationData, 'mm', 'en', i18n.t)
    ).toBe(
      'Precipitation in the morning and in the evening, total precipitation 2.4 millimeters'
    );
  });

  it('uses the caller language and selected unit', () => {
    const t = i18n.getFixedT('fi', 'navigation');
    expect(
      formatAccessiblePrecipitation(precipitationData, 'in', 'fi', t)
    ).toBe('Sadetta aamupäivällä ja illalla, kokonaissademäärä 0,09 tuumaa');
  });

  it('reports absent data without a rainfall amount', () => {
    expect(formatAccessiblePrecipitation(false, 'mm', 'en', i18n.t)).toBe(
      'Precipitation amount missing'
    );
  });

  it.each([
    {
      hours: [12, 18],
      amount: 0,
      label:
        'Ei sadetta iltapäivällä ja illalla, kokonaissademäärä 0,0 millimetriä',
    },
    {
      hours: [12, 18],
      amount: 1,
      label:
        'Sadetta iltapäivällä ja illalla, kokonaissademäärä 2,0 millimetriä',
    },
    {
      hours: [0, 6, 12],
      amount: 0,
      label:
        'Ei sadetta yöllä, aamupäivällä ja iltapäivällä, kokonaissademäärä 0,0 millimetriä',
    },
    {
      hours: [0, 6, 12],
      amount: 1,
      label:
        'Sadetta yöllä, aamupäivällä ja iltapäivällä, kokonaissademäärä 3,0 millimetriä',
    },
    {
      hours: [6],
      amount: 0,
      label: 'Ei sadetta aamupäivällä, kokonaissademäärä 0,0 millimetriä',
    },
  ])(
    'describes the available periods for a partial day ($hours, $amount)',
    ({ hours, amount, label }) => {
      const data = hours.map((hour) => ({
        precipitation: amount,
        timestamp: moment.utc('2035-06-01').hour(hour).unix(),
      }));

      expect(
        formatAccessiblePrecipitation(data, 'mm', 'fi', i18n.getFixedT('fi'))
      ).toBe(label);
    }
  );

  it.each([
    [
      'en',
      'No precipitation in the afternoon and in the evening, total precipitation 0.0 millimeters',
    ],
    [
      'sv',
      'Ingen nederbörd på eftermiddagen och på kvällen, total nederbörd 0,0 millimeter',
    ],
  ])('localizes a dry partial day for %s', (language, label) => {
    const data = [12, 18].map((hour) => ({
      precipitation: 0,
      timestamp: moment.utc('2035-06-01').hour(hour).unix(),
    }));

    expect(
      formatAccessiblePrecipitation(
        data,
        'mm',
        language,
        i18n.getFixedT(language)
      )
    ).toBe(label);
  });

  it.each([0, 1])(
    'allows an all-day description when timestamps cover every period (%s)',
    (amount) => {
      const data = [0, 6, 12, 18].map((hour) => ({
        precipitation: amount,
        timestamp: moment.utc('2035-06-01').hour(hour).unix(),
      }));
      const expected =
        amount === 0
          ? 'Ei sadetta koko päivänä, kokonaissademäärä 0,0 millimetriä'
          : 'Sataa koko päivän ajan, kokonaissademäärä 4,0 millimetriä';

      expect(
        formatAccessiblePrecipitation(data, 'mm', 'fi', i18n.getFixedT('fi'))
      ).toBe(expected);
    }
  );
});
