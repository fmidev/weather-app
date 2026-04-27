import {
  getCurrentPosition,
  getForecast,
  getLocationsLocales,
  getObservation,
} from '../../src/network/WeatherApi';

const mockAxiosClient = jest.fn();
const mockConfigGet = jest.fn();
const mockFindNearestGeoMagneticObservationStation = jest.fn();
const mockIsAuroraBorealisLikely = jest.fn();

jest.mock('@utils/axiosClient', () => ({
  __esModule: true,
  default: (...args: any[]) => mockAxiosClient(...args),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
  },
}));

jest.mock('@utils/geoMagneticStations', () => ({
  findNearestGeoMagneticObservationStation: (...args: any[]) =>
    mockFindNearestGeoMagneticObservationStation(...args),
  isAuroraBorealisLikely: (...args: any[]) =>
    mockIsAuroraBorealisLikely(...args),
}));

const weatherConfig = {
  apiUrl: 'https://weather.example/timeseries',
  forecast: {
    timePeriod: '36h',
    data: [
      { producer: 'forecast-a', parameters: ['temperature'] },
      { producer: 'forecast-b', parameters: ['windSpeedMS'] },
    ],
  },
  observation: {
    enabled: true,
    numberOfStations: 3,
    producer: { default: 'obs-default', FI: 'obs-fi' },
    dailyProducers: ['obs-fi'],
    timePeriod: 24,
    parameters: ['temperature', 'windSpeedMS'],
    dailyParameters: ['rrday'],
    geoMagneticObservations: {
      enabled: false,
      countryCodes: ['FI'],
      producer: 'geo-producer',
    },
  },
};

describe('WeatherApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockFindNearestGeoMagneticObservationStation.mockReset();
    mockIsAuroraBorealisLikely.mockReset();
    mockConfigGet.mockReturnValue(weatherConfig);
  });

  it('returns empty forecast for invalid location', async () => {
    await expect(getForecast({} as any, 'FI')).resolves.toEqual({
      forecasts: [],
      isAuroraBorealisLikely: false,
    });
    expect(mockAxiosClient).not.toHaveBeenCalled();
  });

  it('fetches forecast for geoid location', async () => {
    mockAxiosClient
      .mockResolvedValueOnce({ data: [{ epochtime: 1, temperature: 5 }] })
      .mockResolvedValueOnce({ data: [{ epochtime: 1, windSpeedMS: 4 }] });

    await expect(getForecast({ geoid: 123 } as any, 'FI')).resolves.toEqual({
      forecasts: [
        [{ epochtime: 1, temperature: 5 }],
        [{ epochtime: 1, windSpeedMS: 4 }],
        {},
      ],
      isAuroraBorealisLikely: false,
    });

    expect(mockAxiosClient).toHaveBeenCalledTimes(2);
    expect(mockAxiosClient.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        url: 'https://weather.example/timeseries',
        params: expect.objectContaining({
          geoid: 123,
          producer: 'forecast-a',
          param: expect.stringContaining('temperature'),
        }),
      })
    );
  });

  it('adds geomagnetic request to forecast and resolves aurora likelihood', async () => {
    mockConfigGet.mockReturnValue({
      ...weatherConfig,
      observation: {
        ...weatherConfig.observation,
        geoMagneticObservations: {
          enabled: true,
          countryCodes: ['FI'],
          producer: 'geo-producer',
        },
      },
    });
    mockFindNearestGeoMagneticObservationStation.mockReturnValue({
      fmisid: 101,
      name: 'Geo station',
    });
    mockIsAuroraBorealisLikely.mockReturnValue(true);
    mockAxiosClient
      .mockResolvedValueOnce({ data: [{ epochtime: 1, temperature: 5 }] })
      .mockResolvedValueOnce({ data: [{ epochtime: 1, windSpeedMS: 4 }] })
      .mockResolvedValueOnce({
        data: [{ epochtime: 1, geomagneticRIndex: 7 }],
      });

    await expect(
      getForecast({ latlon: '68.0,24.0' } as any, 'FI')
    ).resolves.toEqual({
      forecasts: [
        [{ epochtime: 1, temperature: 5 }],
        [{ epochtime: 1, windSpeedMS: 4 }],
      ],
      isAuroraBorealisLikely: true,
    });

    expect(mockFindNearestGeoMagneticObservationStation).toHaveBeenCalledWith(
      68,
      24
    );
    expect(mockAxiosClient.mock.calls[2][0].params).toEqual(
      expect.objectContaining({
        fmisid: 101,
        producer: 'geo-producer',
        ignoreError400: true,
      })
    );
    expect(mockIsAuroraBorealisLikely).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ fmisid: 101 })
    );
  });

  it('fetches observations and daily observations when enabled', async () => {
    mockAxiosClient
      .mockResolvedValueOnce({ data: { hourly: true } })
      .mockResolvedValueOnce({ data: { daily: true } });

    await expect(
      getObservation({ latlon: '60.1,24.9' } as any, 'FI')
    ).resolves.toEqual([{ hourly: true }, { daily: true }]);

    expect(mockAxiosClient).toHaveBeenCalledTimes(2);
    expect(mockAxiosClient.mock.calls[0][0].params).toEqual(
      expect.objectContaining({
        latlon: '60.1,24.9',
        numberofstations: 3,
        producer: 'obs-fi',
        param: expect.stringContaining('temperature'),
      })
    );
    expect(mockAxiosClient.mock.calls[1][0].params).toEqual(
      expect.objectContaining({
        starttime: '-720h',
        param: expect.stringContaining('rrday'),
      })
    );
  });

  it('returns empty observation data when disabled or invalid', async () => {
    mockConfigGet.mockReturnValue({
      ...weatherConfig,
      observation: { ...weatherConfig.observation, enabled: false },
    });

    await expect(
      getObservation({ latlon: '60,24' } as any, 'FI')
    ).resolves.toEqual([{}, {}]);
    await expect(getObservation({} as any, 'FI')).resolves.toEqual([{}, {}]);
  });

  it('fetches current position and location locales', async () => {
    mockAxiosClient
      .mockResolvedValueOnce({ data: { 123: [{ name: 'Helsinki' }] } })
      .mockResolvedValueOnce({ data: { 123: [{ name: 'Helsinki' }] } });

    await expect(getCurrentPosition(60.1, 24.9)).resolves.toEqual({
      123: [{ name: 'Helsinki' }],
    });
    expect(mockAxiosClient.mock.calls[0]).toEqual([
      {
        url: 'https://weather.example/timeseries',
        params: expect.objectContaining({
          latlon: '60.1,24.9',
          lang: 'en',
          param: expect.stringContaining('geoid'),
        }),
      },
      undefined,
      'Timeseries',
    ]);

    await expect(getLocationsLocales([123, 456])).resolves.toEqual({
      123: [{ name: 'Helsinki' }],
    });
    expect(mockAxiosClient.mock.calls[1][0].params).toEqual(
      expect.objectContaining({
        geoid: '123,456',
        lang: 'en',
      })
    );
  });
});
