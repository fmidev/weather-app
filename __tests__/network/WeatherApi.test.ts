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
const mockTrackMatomoEvent = jest.fn();

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

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

const forecastStep = {
  epochtime: 1789574400,
  localtime: '20260916T160000',
  sunrise: '20260916T040000',
  sunset: '20260916T170000',
  sunriseToday: 1,
  sunsetToday: 1,
  dayLength: 780,
  moonPhase: 25.5,
  modtime: '20260916T120000',
  dark: 0,
  temperature: 5,
  feelsLike: 3,
  dewPoint: 1,
  smartSymbol: 1,
  windDirection: 180,
  windSpeedMS: 4,
  pop: 10,
  hourlymaximumgust: 6,
  relativeHumidity: 70,
  pressure: 1013,
  precipitation1h: 0,
  windCompass8: 'S',
  totalCloudCover: 20,
};

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

const geoMagneticObservation = {
  distance: 10,
  epochtime: 1,
  fmisid: 101,
  name: 'Geo station',
  geomagneticRIndex: 7,
};

const observationStep = {
  epochtime: 1789574400,
  dewPoint: 1,
  humidity: 70,
  precipitation1h: 0,
  pressure: 1013,
  ri_10min: 0,
  snowDepth: 0,
  temperature: 5,
  totalCloudCover: 20,
  visibility: 10000,
  windCompass8: 'NE',
  windDirection: 45,
  windGust: 6,
  windSpeedMS: 4,
};

const dailyObservationStep = {
  epochtime: 1789574400,
  rrday: 0,
  maximumTemperature: 10,
  minimumTemperature: 2,
  minimumGroundTemperature06: 1,
  snowDepth06: 0,
};

const stationObservations = (steps: unknown[]) => ({
  101: { 'Observation station': { aws: { '10.5': steps } } },
});

const positionData = {
  name: 'Helsinki',
  latitude: 60.1,
  longitude: 24.9,
  region: 'Uusimaa',
  country: 'Finland',
  iso2: 'FI',
  localtz: 'Europe/Helsinki',
};

describe('WeatherApi', () => {
  beforeEach(() => {
    mockAxiosClient.mockReset();
    mockConfigGet.mockReset();
    mockFindNearestGeoMagneticObservationStation.mockReset();
    mockIsAuroraBorealisLikely.mockReset();
    mockTrackMatomoEvent.mockReset();
    mockConfigGet.mockReturnValue(weatherConfig);
  });

  it('returns empty forecast for invalid location', async () => {
    await expect(getForecast({} as any, 'FI')).resolves.toEqual({
      forecast: [],
      location: {},
      isAuroraBorealisLikely: false,
    });
    expect(mockAxiosClient).not.toHaveBeenCalled();
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it('excludes the geomagnetic placeholder from forecast data', async () => {
    const location = { geoid: 123, latlon: '60.0,25.0' };
    mockAxiosClient
      .mockResolvedValueOnce({ data: [{ epochtime: 1, temperature: 5 }] })
      .mockResolvedValueOnce({ data: [{ epochtime: 1, windSpeedMS: 4 }] });

    await expect(getForecast(location, 'FI')).resolves.toEqual({
      forecast: [
        [{ epochtime: 1, temperature: 5 }],
        [{ epochtime: 1, windSpeedMS: 4 }],
      ],
      location,
      isAuroraBorealisLikely: false,
    });
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
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
        data: [geoMagneticObservation],
      });

    const location = { latlon: '68.0,24.0' };

    await expect(getForecast(location, 'FI')).resolves.toEqual({
      forecast: [
        [{ epochtime: 1, temperature: 5 }],
        [{ epochtime: 1, windSpeedMS: 4 }],
      ],
      location,
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

  it.each<[string, unknown]>([
    ['non-array response', {}],
    ['null response', null],
    ['missing data', undefined],
    ['missing required fields', [{ epochtime: 1, geomagneticRIndex: 7 }]],
    ['incorrect field type', [{ ...geoMagneticObservation, geomagneticRIndex: '7' }]],
    ['unexpected field', [{ ...geoMagneticObservation, unexpected: 1 }]],
    [
      'invalid earlier observation',
      [{ ...geoMagneticObservation, epochtime: '1' }, geoMagneticObservation],
    ],
    ['empty observations', []],
  ])('ignores geomagnetic %s and preserves the forecast', async (_description, data) => {
    mockConfigGet.mockReturnValue({
      ...weatherConfig,
      observation: {
        ...weatherConfig.observation,
        geoMagneticObservations: {
          ...weatherConfig.observation.geoMagneticObservations,
          enabled: true,
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
      .mockResolvedValueOnce({ data });

    const location = { latlon: '68.0,24.0' };

    await expect(getForecast(location, 'FI')).resolves.toEqual({
      forecast: [
        [{ epochtime: 1, temperature: 5 }],
        [{ epochtime: 1, windSpeedMS: 4 }],
      ],
      location,
      isAuroraBorealisLikely: false,
    });
    expect(mockIsAuroraBorealisLikely).not.toHaveBeenCalled();
  });

  it.each([false, true, undefined])(
    'uses geomagnetic schemaValidation=%s to control validation',
    async (schemaValidation) => {
      mockConfigGet.mockReturnValue({
        ...weatherConfig,
        observation: {
          ...weatherConfig.observation,
          geoMagneticObservations: {
            ...weatherConfig.observation.geoMagneticObservations,
            enabled: true,
            schemaValidation,
          },
        },
      });
      const station = { fmisid: 101, name: 'Geo station' };
      mockFindNearestGeoMagneticObservationStation.mockReturnValue(station);
      mockIsAuroraBorealisLikely.mockReturnValue(true);
      mockAxiosClient
        .mockResolvedValueOnce({ data: [{ epochtime: 1, temperature: 5 }] })
        .mockResolvedValueOnce({ data: [{ epochtime: 1, windSpeedMS: 4 }] })
        .mockResolvedValueOnce({
          data: [{ ...geoMagneticObservation, unexpected: 1 }],
        });

      const result = await getForecast({ latlon: '68.0,24.0' }, 'FI');

      expect(result.isAuroraBorealisLikely).toBe(schemaValidation === false);
      if (schemaValidation === false) {
        expect(mockIsAuroraBorealisLikely).toHaveBeenCalledWith(7, station);
      } else {
        expect(mockIsAuroraBorealisLikely).not.toHaveBeenCalled();
      }
    }
  );

  it('throws formatted Axios error details when forecast request fails', async () => {
    const responseData = 'x'.repeat(120);
    const axiosError = {
      isAxiosError: true,
      message: 'Request failed',
      code: 'ERR_BAD_RESPONSE',
      config: { url: 'https://weather.example/timeseries' },
      response: {
        status: 503,
        data: responseData,
      },
    };

    mockAxiosClient
      .mockRejectedValueOnce(axiosError)
      .mockResolvedValueOnce({ data: [{ epochtime: 1, windSpeedMS: 4 }] });

    const expectedError = [
      'Message: Request failed',
      'Code: ERR_BAD_RESPONSE',
      'Url: https://weather.example/timeseries',
      'Status: 503',
      `Data: ${responseData.substring(0, 100)}`,
      '',
    ].join('\n');

    await expect(getForecast({ latlon: '60.1,24.9' } as any, 'FI')).rejects.toThrow(
      expectedError
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Timeseries',
      expectedError
    );
  });

  it.each([false, true, undefined])(
    'uses forecast schemaValidation=%s to control default and UV validation',
    async (schemaValidation) => {
      mockConfigGet.mockReturnValue({
        ...weatherConfig,
        forecast: {
          ...weatherConfig.forecast,
          schemaValidation,
          data: [
            { producer: 'default', parameters: ['temperature'] },
            { producer: 'uv', parameters: ['uvCumulated'] },
          ],
        },
      });
      const forecastData = [{ ...forecastStep, unexpected: 1 }];
      const uvData = [{ epochtime: 1, uvCumulated: 2, unexpected: 1 }];
      mockAxiosClient
        .mockResolvedValueOnce({ data: forecastData })
        .mockResolvedValueOnce({ data: uvData });

      const result = getForecast({ latlon: '60,25' }, 'FI');

      if (schemaValidation === false) {
        await expect(result).resolves.toEqual(
          expect.objectContaining({ forecast: [forecastData, uvData] })
        );
        expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
      } else {
        await expect(result).rejects.toThrow('Forecast validation failed:');
        await expect(result).rejects.toThrow('UV forecast validation failed:');
        expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
      }
    }
  );

  describe('default producer validation', () => {
    beforeEach(() => {
      mockConfigGet.mockReturnValue({
        ...weatherConfig,
        forecast: {
          ...weatherConfig.forecast,
          data: [{ producer: 'default', parameters: ['temperature'] }],
        },
      });
    });

    it.each([
      ['valid forecast', [forecastStep]],
      ['two-character wind direction', [{ ...forecastStep, windCompass8: 'NE' }]],
      ['empty forecast', []],
      [
        'nullable fields',
        [{
          ...Object.fromEntries(
            Object.keys(forecastStep).map((key) => [key, null])
          ),
          epochtime: forecastStep.epochtime,
          localtime: forecastStep.localtime,
        }],
      ],
    ])('accepts %s', async (_description, data) => {
      mockAxiosClient.mockResolvedValueOnce({ data });

      await expect(getForecast({ latlon: '60,25' }, 'FI')).resolves.toEqual(
        expect.objectContaining({ forecast: [data] })
      );
    });

    it.each<[string, unknown, string]>([
      ['non-array response', {}, 'must be array'],
      ['null response', null, 'must be array'],
      ['missing data', undefined, 'must be array'],
      ['missing required field', [{ epochtime: 1 }], 'localtime'],
      [
        'incorrect field type',
        [{ ...forecastStep, temperature: '5' }],
        'temperature',
      ],
      [
        'invalid timestamp',
        [{ ...forecastStep, localtime: 'invalid' }],
        'localtime',
      ],
      ['invalid flag', [{ ...forecastStep, dark: 2 }], 'dark'],
      [
        'wind direction longer than two characters',
        [{ ...forecastStep, windCompass8: 'NNE' }],
        'windCompass8',
      ],
      [
        'unexpected field',
        [{ ...forecastStep, unexpected: 1 }],
        'additional properties',
      ],
      [
        'invalid later timestep',
        [forecastStep, { ...forecastStep, temperature: '5' }],
        'data/1/temperature',
      ],
    ])('rejects %s', async (_description, data, errorDetail) => {
      mockAxiosClient.mockResolvedValueOnce({ data });
      const result = getForecast({ latlon: '60,25' }, 'FI');

      await expect(result).rejects.toThrow('Forecast validation failed:');
      await expect(result).rejects.toThrow(errorDetail);
      expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'Timeseries',
        expect.stringContaining(errorDetail)
      );
      await expect(result).rejects.toThrow(
        mockTrackMatomoEvent.mock.calls[0][2]
      );
    });

    it.each(['', undefined])(
      'validates when producer %s falls back to default',
      async (producer) => {
        mockConfigGet.mockReturnValue({
          ...weatherConfig,
          forecast: {
            ...weatherConfig.forecast,
            data: [{ producer, parameters: ['temperature'] }],
          },
        });
        mockAxiosClient.mockResolvedValueOnce({ data: [{}] });

        await expect(getForecast({ latlon: '60,25' }, 'FI')).rejects.toThrow(
          'Forecast validation failed:'
        );
        expect(mockAxiosClient.mock.calls[0][0].params.producer).toBe('default');
      }
    );

    it('validates default producer even when it is not the first request', async () => {
      mockConfigGet.mockReturnValue({
        ...weatherConfig,
        forecast: {
          ...weatherConfig.forecast,
          data: [
            weatherConfig.forecast.data[0],
            { producer: 'default', parameters: ['temperature'] },
          ],
        },
      });
      mockAxiosClient
        .mockResolvedValueOnce({ data: [{ epochtime: 1, temperature: 5 }] })
        .mockResolvedValueOnce({ data: [{}] });

      await expect(getForecast({ latlon: '60,25' }, 'FI')).rejects.toThrow(
        'Forecast validation failed:'
      );
    });
  });

  describe('uv producer validation', () => {
    beforeEach(() => {
      mockConfigGet.mockReturnValue({
        ...weatherConfig,
        forecast: {
          ...weatherConfig.forecast,
          data: [
            { producer: 'default', parameters: ['temperature'] },
            { producer: 'uv', parameters: ['uvCumulated'] },
          ],
        },
      });
      mockAxiosClient.mockResolvedValueOnce({ data: [forecastStep] });
    });

    it.each([
      ['numeric UV value', [{ epochtime: 1, uvCumulated: 2.5 }]],
      ['null UV value', [{ epochtime: 1, uvCumulated: null }]],
      ['empty forecast', []],
    ])('accepts %s', async (_description, data) => {
      mockAxiosClient.mockResolvedValueOnce({ data });

      await expect(getForecast({ latlon: '60,25' }, 'FI')).resolves.toEqual(
        expect.objectContaining({ forecast: [[forecastStep], data] })
      );
      expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    });

    it.each<[string, unknown, string]>([
      ['non-array response', {}, 'must be array'],
      ['null response', null, 'must be array'],
      ['missing data', undefined, 'must be array'],
      ['missing UV value', [{ epochtime: 1 }], 'uvCumulated'],
      ['missing timestamp', [{ uvCumulated: 2 }], 'epochtime'],
      ['string UV value', [{ epochtime: 1, uvCumulated: '2' }], 'uvCumulated'],
      ['fractional timestamp', [{ epochtime: 1.5, uvCumulated: 2 }], 'epochtime'],
      [
        'unexpected field',
        [{ epochtime: 1, uvCumulated: 2, temperature: 5 }],
        'additional properties',
      ],
      [
        'invalid later timestep',
        [{ epochtime: 1, uvCumulated: 2 }, { epochtime: 2, uvCumulated: '3' }],
        'data/1/uvCumulated',
      ],
    ])('rejects %s and tracks the validation error', async (_description, data, errorDetail) => {
      mockAxiosClient.mockResolvedValueOnce({ data });
      const result = getForecast({ latlon: '60,25' }, 'FI');

      await expect(result).rejects.toThrow('UV forecast validation failed:');
      await expect(result).rejects.toThrow(errorDetail);
      expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'Timeseries',
        expect.stringContaining(errorDetail)
      );
      await expect(result).rejects.toThrow(mockTrackMatomoEvent.mock.calls[0][2]);
    });
  });

  it('fetches observations and daily observations when enabled', async () => {
    const hourly = stationObservations([observationStep]);
    const daily = stationObservations([dailyObservationStep]);
    mockAxiosClient
      .mockResolvedValueOnce({ data: hourly })
      .mockResolvedValueOnce({ data: daily });

    await expect(
      getObservation({ latlon: '60.1,24.9' } as any, 'FI')
    ).resolves.toEqual([hourly, daily]);

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

  describe.each([
    ['hourly', observationStep, 'Observation validation failed:'],
    ['daily', dailyObservationStep, 'Daily observation validation failed:'],
  ] as const)('%s observation validation', (kind, step, errorMessage) => {
    const mockObservationResponses = (data: unknown) => {
      mockAxiosClient
        .mockResolvedValueOnce({
          data: kind === 'hourly' ? data : stationObservations([observationStep]),
        })
        .mockResolvedValueOnce({
          data: kind === 'daily' ? data : stationObservations([dailyObservationStep]),
        });
    };

    it.each([
      ['empty response', {}],
      ['empty station observations', stationObservations([])],
      [
        'nullable measurements',
        stationObservations([{
          ...Object.fromEntries(Object.keys(step).map((key) => [key, null])),
          epochtime: step.epochtime,
        }]),
      ],
    ])('accepts %s', async (_description, data) => {
      mockObservationResponses(data);

      const result = await getObservation({ latlon: '60,25' }, 'FI');

      expect(result[kind === 'hourly' ? 0 : 1]).toEqual(data);
      expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    });

    it.each<[string, unknown]>([
      ['array response', []],
      ['null response', null],
      ['missing data', undefined],
      ['invalid station identifier', { invalid: {} }],
      ['invalid distance', { 101: { Station: { aws: { invalid: [step] } } } }],
      ['missing required fields', stationObservations([{ epochtime: 1 }])],
      ['incorrect field type', stationObservations([{ ...step, epochtime: '1' }])],
      ['unexpected field', stationObservations([{ ...step, unexpected: 1 }])],
      ['invalid later timestep', stationObservations([step, { epochtime: 2 }])],
    ])('rejects %s and tracks the validation error', async (_description, data) => {
      mockObservationResponses(data);

      await expect(getObservation({ latlon: '60,25' }, 'FI')).rejects.toThrow(
        errorMessage
      );
      expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'Timeseries',
        expect.stringContaining(errorMessage)
      );
    });
  });

  it('returns hourly observations when daily observations are disabled', async () => {
    const hourly = stationObservations([observationStep]);
    mockAxiosClient.mockResolvedValueOnce({ data: hourly });

    await expect(getObservation({ latlon: '60,25' }, 'SE')).resolves.toEqual([
      hourly,
      {},
    ]);
    expect(mockAxiosClient).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
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
    mockConfigGet.mockImplementation((key: string) =>
      key === 'location'
        ? {
            keyword: 'extended_names',
            maxDistance: 20,
            useInKeyword: true,
          }
        : weatherConfig
    );
    mockAxiosClient
      .mockResolvedValueOnce({ data: { 123: [positionData] } })
      .mockResolvedValueOnce({ data: { 123: [{ name: 'Helsinki' }] } });

    await expect(getCurrentPosition(60.1, 24.9)).resolves.toEqual({
      123: [positionData],
    });
    expect(mockAxiosClient.mock.calls[0]).toEqual([
      {
        url: 'https://weather.example/timeseries',
        params: expect.objectContaining({
          latlon: '60.1,24.9',
          lang: 'en',
          inkeyword: 'extended_names',
          maxdistance: 20,
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

  describe('reverse geolocation validation', () => {
    it.each([
      ['negative geoid', { '-123': [positionData] }],
      ['null timezone', { 123: [{ ...positionData, localtz: null }] }],
    ])('accepts %s', async (_description, data) => {
      mockAxiosClient.mockResolvedValueOnce({ data });

      await expect(getCurrentPosition(60.1, 24.9)).resolves.toEqual(data);
      expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
    });

    it.each<[string, unknown]>([
      ['empty response', {}],
      ['empty location array', { 123: [] }],
      ['array response', []],
      ['null response', null],
      ['missing data', undefined],
      ['invalid geoid', { invalid: [positionData] }],
      ['geoid longer than twelve characters', { '1234567890123': [positionData] }],
      ['non-array locations', { 123: positionData }],
      ['missing required fields', { 123: [{ name: 'Helsinki' }] }],
      ['incorrect field type', { 123: [{ ...positionData, latitude: '60.1' }] }],
      ['latitude out of range', { 123: [{ ...positionData, latitude: 91 }] }],
      ['longitude out of range', { 123: [{ ...positionData, longitude: -181 }] }],
      ['invalid country code', { 123: [{ ...positionData, iso2: 'fi' }] }],
      ['empty timezone', { 123: [{ ...positionData, localtz: '' }] }],
      ['unexpected field', { 123: [{ ...positionData, unexpected: 1 }] }],
      ['invalid later location', { 123: [positionData, { name: 'Helsinki' }] }],
    ])('rejects %s and tracks the validation error', async (_description, data) => {
      mockAxiosClient.mockResolvedValueOnce({ data });
      const result = getCurrentPosition(60.1, 24.9);

      await expect(result).rejects.toThrow('Reverse geolocation validation failed:');
      expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
      expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
        'Error',
        'Timeseries',
        expect.stringContaining('Reverse geolocation validation failed:')
      );
      await expect(result).rejects.toThrow(mockTrackMatomoEvent.mock.calls[0][2]);
    });
  });
});
