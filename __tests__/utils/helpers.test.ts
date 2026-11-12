import { AccessibilityInfo, Alert } from 'react-native';
import Geolocation from 'react-native-nitro-geolocation/compat';
import moment from 'moment';
import type { TFunction } from 'i18next';
import {
  checkMultiple,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { Config } from '../../src/config';
import * as WeatherApi from '../../src/network/WeatherApi';
import type { Location } from '../../src/store/location/types';

import {
  convertValueToUnitPrecision,
  getFeelsLikeIconName,
  getGeolocation,
  getSeveritiesForDays,
  getSeveritiesForTimePeriod,
} from '../../src/utils/helpers';
import { trackMatomoEvent } from '../../src/utils/matomo';

jest.mock('../../src/utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

const flushAsync = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('helpers getGeolocation', () => {
  const callback = jest.fn();
  const t = ((key: string) => key) as TFunction<string[] | string>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tracks COARSE_LOCATION_OK when permission request is granted', async () => {
    (checkMultiple as jest.Mock).mockResolvedValueOnce({
      [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.DENIED,
    });
    (request as jest.Mock).mockResolvedValueOnce(RESULTS.GRANTED);

    await getGeolocation(callback, t);
    await flushAsync();

    expect((Geolocation as any).setRNConfiguration).toHaveBeenCalled();
    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'Notice',
      'Geolocation',
      'COARSE_LOCATION_OK'
    );
    expect((Geolocation as any).getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('tracks COARSE_LOCATION_NO_PERMISSION when permission request is blocked', async () => {
    (checkMultiple as jest.Mock).mockResolvedValueOnce({
      [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.DENIED,
    });
    (request as jest.Mock).mockResolvedValueOnce(RESULTS.BLOCKED);

    await getGeolocation(callback, t);
    await flushAsync();

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'Notice',
      'Geolocation',
      'COARSE_LOCATION_NO_PERMISSION'
    );
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('tracks NO_PERMISSION when permissions are already blocked', async () => {
    (checkMultiple as jest.Mock).mockResolvedValueOnce({
      [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.BLOCKED,
    });

    await getGeolocation(callback, t);

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'Notice',
      'Geolocation',
      'NO_PERMISSION'
    );
    expect(Alert.alert).toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('tracks Error event when permission request fails', async () => {
    const error = new Error('permission request failed');
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    (checkMultiple as jest.Mock).mockResolvedValueOnce({
      [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.DENIED,
    });
    (request as jest.Mock).mockRejectedValueOnce(error);

    await getGeolocation(callback, t);
    await flushAsync();

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Geolocation',
      'permission request failed'
    );
  });

  describe('nearby current location', () => {
    const current: Location = {
      id: 1, name: 'Helsinki', area: 'Uusimaa', country: 'FI',
      lat: 60, lon: 25, timezone: 'Europe/Helsinki',
    };

    beforeEach(() => {
      (checkMultiple as jest.Mock).mockResolvedValue({
        [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.GRANTED,
      });
      jest.spyOn(Config, 'get').mockReturnValue({ source: 'api' } as any);
      jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(jest.fn());
      jest.spyOn(WeatherApi, 'getCurrentPosition').mockResolvedValue({
        2: [{
          name: 'New place', region: 'New region', country: 'Finland', iso2: 'FI',
          localtz: 'Europe/Helsinki',
        }] as any,
      });
    });

    const reportPosition = async (
      latitude: number,
      longitude: number,
      getCurrentLocation: () => Location | undefined = () => current
    ) => {
      await getGeolocation(callback, t, undefined, getCurrentLocation);
      const onPosition = jest.mocked(Geolocation.getCurrentPosition).mock.calls[0][0];
      onPosition({ coords: { latitude, longitude } } as any);
      await flushAsync();
    };

    it.each([
      ['same position', 60],
      ['less than 100 metres before rounding', 60.000895],
      ['exactly 100 metres', 60.00089831528412],
    ] as const)('reuses current data at the %s without a reverse lookup', async (_name, latitude) => {
      await reportPosition(latitude, 25);

      expect(WeatherApi.getCurrentPosition).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(current, true);
      expect(callback.mock.calls[0][0]).toBe(current);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'navigation:locatedTo Helsinki, Uusimaa'
      );
    });

    it('fetches place details beyond 100 metres and keeps rounding GPS coordinates', async () => {
      await reportPosition(60.000904, 25.000001);

      expect(WeatherApi.getCurrentPosition).toHaveBeenCalledWith(60.0009, 25);
      expect(callback).toHaveBeenCalledWith({
        id: 2, name: 'New place', area: 'New region', country: 'FI',
        lat: 60.0009, lon: 25, timezone: 'Europe/Helsinki',
      }, true);
    });

    it.each([
      { name: 'missing', location: undefined },
      { name: 'invalid latitude', location: { ...current, lat: NaN } },
      { name: 'invalid longitude', location: { ...current, lon: Infinity } },
    ])('fetches place details when current location is $name', async ({ location }) => {
      await reportPosition(60, 25, () => location);
      expect(WeatherApi.getCurrentPosition).toHaveBeenCalledWith(60, 25);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('reads the latest current location when the GPS result arrives', async () => {
      const getCurrentLocation = jest.fn< Location | undefined, [] >().mockReturnValue(undefined);
      await getGeolocation(callback, t, true, getCurrentLocation);
      expect(getCurrentLocation).not.toHaveBeenCalled();
      getCurrentLocation.mockReturnValue(current);
      jest.mocked(Geolocation.getCurrentPosition).mock.calls[0][0]({
        coords: { latitude: current.lat, longitude: current.lon },
      } as any);

      expect(WeatherApi.getCurrentPosition).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(current, true);
    });

    it('accepts zero coordinates and announces a location without an area', async () => {
      const equator = { ...current, lat: 0, lon: 0, area: '' };
      await reportPosition(0, 0, () => equator);
      expect(WeatherApi.getCurrentPosition).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(equator, true);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'navigation:locatedTo Helsinki'
      );
    });

    it('retains the server lookup when no current-location getter was provided', async () => {
      await getGeolocation(callback, t);
      jest.mocked(Geolocation.getCurrentPosition).mock.calls[0][0]({
        coords: { latitude: current.lat, longitude: current.lon },
      } as any);
      await flushAsync();
      expect(WeatherApi.getCurrentPosition).toHaveBeenCalledWith(60, 25);
    });
  });
});

describe('helpers convertValueToUnitPrecision', () => {
  it('converts temperature to fahrenheit with default precision', () => {
    expect(convertValueToUnitPrecision('temperature', 'F', 28)).toBe('82');
  });

  it('converts pressure to inHg with default precision', () => {
    expect(convertValueToUnitPrecision('pressure', 'inHg', 10)).toBe('0.3');
  });

  it('supports custom decimals override', () => {
    expect(convertValueToUnitPrecision('pressure', 'inHg', 10, 2)).toBe('0.30');
  });

  it('returns converted value for zero input', () => {
    expect(convertValueToUnitPrecision('temperature', 'F', 0)).toBe('32');
  });

  it('returns null for undefined or null input', () => {
    expect(convertValueToUnitPrecision('temperature', 'F', undefined)).toBeNull();
    expect(convertValueToUnitPrecision('temperature', 'F', null)).toBeNull();
  });
});

describe('helpers getFeelsLikeIconName', () => {
  const weatherItem = {
    temperature: 5,
    windSpeedMS: 2,
    smartSymbol: 1,
  } as any;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('returns Finnish holiday icon for FI on 6 Dec 2035', () => {
    jest.useFakeTimers().setSystemTime(new Date('2035-01-10T12:00:00Z'));
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'FI' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-12-06T12:00:00Z').toObject();
    expect(getFeelsLikeIconName(weatherItem, momentObj)).toBe(
      'feels-like-itsenaisyyspaiva'
    );
  });

  it('returns Finnish holiday icon for FI on 14 Feb 2035', () => {
    jest.useFakeTimers().setSystemTime(new Date('2035-01-10T12:00:00Z'));
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'FI' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-02-14T12:00:00Z').toObject();
    expect(getFeelsLikeIconName(weatherItem, momentObj)).toBe(
      'feels-like-valentine'
    );
  });

  it('returns easter icon for FI during easter period in 2035', () => {
    // 2035 Easter Sunday is 25 Mar => Good Friday 23 Mar, Tuesday after Easter 27 Mar
    jest.useFakeTimers().setSystemTime(new Date('2035-03-24T12:00:00Z'));
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'FI' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-03-24T12:00:00Z').toObject();
    expect(getFeelsLikeIconName(weatherItem, momentObj)).toBe(
      'feels-like-easter'
    );
  });

  it('does not use Finnish holiday icons for CO on Finnish holiday dates', () => {
    jest.useFakeTimers().setSystemTime(new Date('2035-01-10T12:00:00Z'));
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'CO' } } as any;
      }
      return {} as any;
    });

    const independenceDay = moment.utc('2035-12-06T12:00:00Z').toObject();
    const valentineDay = moment.utc('2035-02-14T12:00:00Z').toObject();

    expect(getFeelsLikeIconName(weatherItem, independenceDay)).toBe(
      'feels-like-basic'
    );
    expect(getFeelsLikeIconName(weatherItem, valentineDay)).toBe(
      'feels-like-basic'
    );
  });

  it('returns winter icon when temperature is -30', () => {
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'CO' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-01-15T12:00:00Z').toObject();
    const item = { temperature: -30, windSpeedMS: 2, smartSymbol: 1 } as any;

    expect(getFeelsLikeIconName(item, momentObj)).toBe('feels-like-winter');
  });

  it('returns hot icon when temperature is +30', () => {
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'CO' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-07-15T12:00:00Z').toObject();
    const item = { temperature: 30, windSpeedMS: 2, smartSymbol: 1 } as any;

    expect(getFeelsLikeIconName(item, momentObj)).toBe('feels-like-hot');
  });

  it('returns basic icon when wind speed is 5 m/s', () => {
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'CO' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-07-15T12:00:00Z').toObject();
    const item = { temperature: 10, windSpeedMS: 5, smartSymbol: 1 } as any;

    expect(getFeelsLikeIconName(item, momentObj)).toBe('feels-like-basic');
  });

  it('returns windy icon when wind speed is 25 m/s', () => {
    jest.spyOn(Config, 'get').mockImplementation((key: string) => {
      if (key === 'location') {
        return { default: { country: 'CO' } } as any;
      }
      return {} as any;
    });

    const momentObj = moment.utc('2035-07-15T12:00:00Z').toObject();
    const item = { temperature: 10, windSpeedMS: 25, smartSymbol: 1 } as any;

    expect(getFeelsLikeIconName(item, momentObj)).toBe('feels-like-windy');
  });
});

describe('helpers getSeveritiesForTimePeriod', () => {
  const timezone = 'UTC';
  const start = moment.utc('2035-06-01T00:00:00Z');
  const end = moment.utc('2035-06-01T06:00:00Z');

  const makeWarning = (
    effective: string,
    expires: string,
    severity: 'Moderate' | 'Severe' | 'Extreme',
    asArray = false
  ) => {
    const info = {
      language: 'en',
      category: 'Met',
      event: 'Test',
      urgency: 'Immediate',
      severity,
      certainty: 'Observed',
      effective: new Date(effective),
      onset: new Date(effective),
      expires: new Date(expires),
      senderName: 'test',
      description: 'test',
      web: 'https://example.test',
      area: {
        areaDesc: 'test',
        polygon: '',
        circle: '',
      },
    };

    return {
      identifier: 'id',
      sender: 'sender',
      sent: new Date(effective),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      references: '',
      info: asArray ? [info] : info,
    } as any;
  };

  it('returns max severity for warnings overlapping the time period', () => {
    const warnings = [
      makeWarning(
        '2035-06-01T01:00:00Z',
        '2035-06-01T02:00:00Z',
        'Moderate'
      ), // begins/ends during period
      makeWarning(
        '2035-05-31T23:00:00Z',
        '2035-06-01T03:00:00Z',
        'Severe'
      ), // ends during period
      makeWarning(
        '2035-05-31T23:00:00Z',
        '2035-06-01T10:00:00Z',
        'Extreme'
      ), // contains period
    ];

    expect(getSeveritiesForTimePeriod(warnings, start, end, timezone)).toBe(3);
  });

  it('returns 0 when no warnings overlap the time period', () => {
    const warnings = [
      makeWarning(
        '2035-06-01T10:00:00Z',
        '2035-06-01T12:00:00Z',
        'Extreme'
      ),
    ];

    expect(getSeveritiesForTimePeriod(warnings, start, end, timezone)).toBe(0);
  });

  it('supports CAP warning info in array form', () => {
    const warnings = [
      makeWarning(
        '2035-05-31T23:00:00Z',
        '2035-06-01T03:00:00Z',
        'Severe',
        true
      ),
    ];

    expect(getSeveritiesForTimePeriod(warnings, start, end, timezone)).toBe(2);
  });
});

describe('helpers getSeveritiesForDays', () => {
  const timezone = 'UTC';
  const makeWarning = (
    effective: string,
    expires: string,
    severity: 'Moderate' | 'Severe' | 'Extreme'
  ) => {
    const info = {
      language: 'en',
      category: 'Met',
      event: 'Test',
      urgency: 'Immediate',
      severity,
      certainty: 'Observed',
      effective: new Date(effective),
      onset: new Date(effective),
      expires: new Date(expires),
      senderName: 'test',
      description: 'test',
      web: 'https://example.test',
      area: {
        areaDesc: 'test',
        polygon: '',
        circle: '',
      },
    };

    return {
      identifier: 'id',
      sender: 'sender',
      sent: new Date(effective),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      references: '',
      info,
    } as any;
  };

  it('returns empty array when warnings are undefined', () => {
    const date = moment.utc('2035-06-01T00:00:00Z').valueOf();
    expect(getSeveritiesForDays(undefined, [date], timezone)).toEqual([]);
  });

  it('returns severities for all four 6-hour periods in a day', () => {
    const date = moment.utc('2035-06-01T00:00:00Z').valueOf();
    const warnings = [
      makeWarning(
        '2035-06-01T01:00:00Z',
        '2035-06-01T02:00:00Z',
        'Moderate'
      ), // 00-06
      makeWarning(
        '2035-06-01T07:00:00Z',
        '2035-06-01T08:00:00Z',
        'Severe'
      ), // 06-12
      makeWarning(
        '2035-06-01T13:00:00Z',
        '2035-06-01T14:00:00Z',
        'Extreme'
      ), // 12-18
      makeWarning(
        '2035-06-01T19:00:00Z',
        '2035-06-01T20:00:00Z',
        'Moderate'
      ), // 18-24
    ];

    expect(getSeveritiesForDays(warnings, [date], timezone)).toEqual([[1, 2, 3, 1]]);
  });
});
