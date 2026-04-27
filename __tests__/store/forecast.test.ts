import reducer from '@store/forecast/reducer';
import * as actions from '@store/forecast/actions';
import * as selectors from '@store/forecast/selectors';
import * as types from '@store/forecast/types';
import * as constants from '@store/forecast/constants';

const mockConfigGet = jest.fn();
const mockGetForecast = jest.fn();
const mockTrackMatomoEvent = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@network/WeatherApi', () => ({
  getForecast: (...args: any[]) => mockGetForecast(...args),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

const defaultParameters = [
  [0, constants.SMART_SYMBOL],
  [1, constants.TEMPERATURE],
  [3, constants.WIND_SPEED_AND_DIRECTION],
  [5, constants.PRECIPITATION_1H],
] as [number, string][];

const defaultState: types.ForecastState = {
  data: {},
  auroraBorealisData: {},
  loading: false,
  error: false,
  displayParams: [],
  displayFormat: 'table',
  chartDisplayParam: 'temperature',
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

describe('forecast reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockConfigGet.mockReturnValue({
      forecast: {
        data: [
          { parameters: [constants.SMART_SYMBOL, constants.TEMPERATURE], producer: 'harmonie' },
          { parameters: [constants.PRECIPITATION_1H], producer: 'ecmwf' },
        ],
        defaultParameters: [
          constants.SMART_SYMBOL,
          constants.TEMPERATURE,
          constants.PRECIPITATION_1H,
        ],
      },
    });
  });

  it('should handle FETCH_FORECAST', () => {
    expect(
      reducer({ ...defaultState, error: 'failed', loading: false }, {
        type: types.FETCH_FORECAST,
      })
    ).toMatchObject({
      error: false,
      loading: true,
    });
  });

  it('should handle FETCH_FORECAST_SUCCESS and merge datasets by epochtime', () => {
    const state = reducer(
        {
          ...defaultState,
          data: {
            99: [
              createStep({ epochtime: 10, temperature: 1 }),
            ],
          },
        },
        {
          type: types.FETCH_FORECAST_SUCCESS,
          data: {
            forecasts: [
              {
                99: [
                  createStep({ epochtime: 10, smartSymbol: 1 }),
                  createStep({ epochtime: 20, temperature: 2 }),
                ],
              },
              {
                99: [
                  createStep({ epochtime: 10, precipitation1h: 0.2 }),
                ],
              },
            ],
            isAuroraBorealisLikely: true,
          },
          timestamp: 123,
        }
      );

    expect(state).toMatchObject({
      auroraBorealisData: { 99: true },
      error: false,
      fetchSuccessTime: 123,
      fetchTimestamp: 123,
      loading: false,
    });
    expect(state.data?.[99]).toEqual([
      expect.objectContaining({
        epochtime: 10,
        precipitation1h: 0.2,
        smartSymbol: 1,
      }),
      expect.objectContaining({
        epochtime: 20,
        temperature: 2,
      }),
    ]);
  });

  it('should normalize nan geoid to zero on FETCH_FORECAST_SUCCESS', () => {
    expect(
      reducer(undefined, {
        type: types.FETCH_FORECAST_SUCCESS,
        data: {
          forecasts: [
            {
              nan: [createStep({ epochtime: 10, temperature: 3 })],
            },
          ],
          isAuroraBorealisLikely: false,
        },
        timestamp: 123,
      })
    ).toMatchObject({
      data: {
        0: [expect.objectContaining({ temperature: 3 })],
      },
    });
  });

  it('should handle FETCH_FORECAST_ERROR', () => {
    expect(
      reducer(undefined, {
        type: types.FETCH_FORECAST_ERROR,
        error: { code: 500, message: 'failed' },
        timestamp: 456,
      })
    ).toMatchObject({
      error: { code: 500, message: 'failed' },
      fetchTimestamp: 456,
      loading: false,
    });
  });

  it('should handle UPDATE_DISPLAY_PARAMS (add)', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_DISPLAY_PARAMS,
        param: [7, constants.DEW_POINT],
        defaultParameters: defaultParameters.map(
          ([, param]) => param
        ) as types.DisplayParameters[],
      })
    ).toMatchObject({
      displayParams: [...defaultParameters, [7, constants.DEW_POINT]],
    });
  });

  it('should handle UPDATE_DISPLAY_PARAMS (remove)', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_DISPLAY_PARAMS,
        param: [3, constants.WIND_SPEED_AND_DIRECTION],
        defaultParameters: defaultParameters.map(
          ([, param]) => param
        ) as types.DisplayParameters[],
      })
    ).toMatchObject({
      displayParams: [
        [0, constants.SMART_SYMBOL],
        [1, constants.TEMPERATURE],
        [5, constants.PRECIPITATION_1H],
      ],
    });
  });

  it('should handle RESTORE_DEFAULT_DISPLAY_PARAMS', () => {
    expect(
      reducer(
        { ...defaultState, displayParams: [[0, constants.SMART_SYMBOL]] },
        { type: types.RESTORE_DEFAULT_DISPLAY_PARAMS }
      )
    ).toMatchObject({
      displayParams: [],
    });
  });

  it('should handle display format and chart parameter updates', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_FORECAST_DISPLAY_FORMAT,
        value: 'chart',
      })
    ).toMatchObject({
      displayFormat: 'chart',
    });

    expect(
      reducer(undefined, {
        type: types.UPDATE_FORECAST_CHART_PARAMETER,
        value: 'temperature' as any,
      })
    ).toMatchObject({
      chartDisplayParam: 'temperature',
    });
  });

  it('selects valid forecast data and derived values', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-11-14T22:13:20Z'));
    const nowSeconds = Math.floor(Date.now() / 1000);
    const state = createState({
      data: {
        99: [
          createStep({
            epochtime: nowSeconds - 3600,
            modtime: '2023-11-14T21:00:00',
            temperature: 0,
          }),
          createStep({
            epochtime: nowSeconds + 3600,
            feelsLike: -1,
            modtime: '2023-11-14T21:00:00',
            moonPhase: 5,
            precipitation1h: 0.1,
            smartSymbol: 1,
            temperature: 2,
            windSpeedMS: 3,
          }),
          createStep({
            epochtime: nowSeconds + 7200,
            feelsLike: 4,
            modtime: '2023-11-14T21:00:00',
            precipitation1h: 0.3,
            smartSymbol: 2,
            temperature: 5,
            windSpeedMS: 7,
          }),
          ...Array.from({ length: 22 }).map((_, index) =>
            createStep({
              epochtime: nowSeconds + (index + 3) * 3600,
              modtime: '2023-11-14T21:00:00',
              moonPhase: index === 21 ? 1 : 5,
              smartSymbol: 1,
              temperature: 1,
            })
          ),
        ],
      },
      auroraBorealisData: { 99: true },
      displayFormat: 'chart',
      chartDisplayParam: 'temperature' as any,
      fetchSuccessTime: Date.now() - 500,
    });

    const forecast = selectors.selectForecast(state);

    expect(forecast).toHaveLength(24);
    expect(selectors.selectNextHourForecast(state)).toBe(forecast[0]);
    expect(selectors.selectNextHoursForecast(state)).toHaveLength(12);
    expect(selectors.selectForecastAge(state)).toBe(500);
    expect(selectors.selectIsAuroraBorealisLikely(state)).toBe(true);
    expect(selectors.selectForecastInvalidData(state)).toBe(false);
    expect(selectors.selectUniqueSmartSymbols(state)).toEqual([1, 2]);
    expect(selectors.selectDisplayFormat(state)).toBe('chart');
    expect(selectors.selectChartDisplayParameter(state)).toBe('temperature');
    expect(selectors.selectMinimumsAndMaximums(state)).toMatchObject({
      precipitationMax: 0.3,
      precipitationMin: 0,
      tempMax: 5,
      tempMin: 1,
      totalTempMax: 5,
      totalTempMin: -1,
    });
    expect(selectors.selectForecastByDay(state)).toBeTruthy();
    const headerLevelForecast = selectors.selectHeaderLevelForecast(state);
    expect(headerLevelForecast).toBeTruthy();
    expect(headerLevelForecast && headerLevelForecast[0]).toMatchObject({
      maxTemperature: 5,
      maxWindSpeed: 7,
      minTemperature: 1,
      minWindSpeed: 0,
      precipitationMissing: false,
      totalPrecipitation: 0.4,
    });
    expect(selectors.selectForecastLastUpdatedMoment(state)).toBeTruthy();
    expect(selectors.selectIsWaningMoonPhase(state)).toBe(true);
  });

  it('filters old forecasts and reports error when data is empty after loading', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-11-14T22:13:20Z'));
    const state = createState({
      data: {
        99: [
          createStep({
            epochtime: Math.floor(Date.now() / 1000) + 3600,
            modtime: '2023-11-12T00:00:00',
            temperature: 2,
          }),
        ],
      },
      loading: false,
    });

    expect(selectors.selectForecast(state)).toEqual([]);
    expect(selectors.selectError(state)).toBe(true);
  });

  it('selects display params from config and filters unavailable parameters', () => {
    const state = createState({
      displayParams: [
        [7, constants.DEW_POINT],
        [1, constants.TEMPERATURE],
        [999, 'unknown' as any],
      ],
    });

    expect(selectors.selectDisplayParams(state)).toEqual([
      [1, constants.TEMPERATURE],
    ]);
  });

  it('dispatches forecast actions including stale modtime retry', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-11-14T22:13:20Z'));
    const dispatch = jest.fn();
    const location = { geoid: 99 };
    mockGetForecast
      .mockResolvedValueOnce({
        forecasts: [
          {
            99: [
              createStep({
                modtime: '2023-11-12T00:00:00',
                temperature: 1,
              }),
            ],
          },
          {},
        ],
        isAuroraBorealisLikely: false,
      })
      .mockResolvedValueOnce({
        forecasts: [
          {
            99: [
              createStep({
                modtime: '2023-11-14T21:00:00',
                temperature: 3,
              }),
            ],
          },
        ],
        isAuroraBorealisLikely: false,
      });

    await actions.fetchForecast(location, 'FI')(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: types.FETCH_FORECAST });
    expect(mockGetForecast).toHaveBeenNthCalledWith(1, location, 'FI');
    expect(mockGetForecast).toHaveBeenNthCalledWith(2, location, 'FI', 'harmonie');
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Weather',
      expect.stringContaining('Old modtime')
    );
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: {
          forecasts: [
            {
              99: [expect.objectContaining({ temperature: 3 })],
            },
          ],
          isAuroraBorealisLikely: false,
        },
        type: types.FETCH_FORECAST_SUCCESS,
      })
    );
  });

  it('dispatches forecast error action when fetch fails', async () => {
    const dispatch = jest.fn();
    const error = { code: 500, message: 'failed' };
    mockGetForecast.mockRejectedValueOnce(error);

    await actions.fetchForecast({ geoid: 99 }, 'FI')(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: types.FETCH_FORECAST });
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error,
        type: types.FETCH_FORECAST_ERROR,
      })
    );
  });

  it('dispatches display setting actions', () => {
    const dispatch = jest.fn();

    actions.updateDisplayParams([1, constants.TEMPERATURE] as any)(dispatch);
    actions.restoreDefaultDisplayParams()(dispatch);
    actions.updateDisplayFormat('chart')(dispatch);
    actions.updateChartParameter('temperature' as any)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      defaultParameters: [
        constants.SMART_SYMBOL,
        constants.TEMPERATURE,
        constants.PRECIPITATION_1H,
      ],
      param: [1, constants.TEMPERATURE],
      type: types.UPDATE_DISPLAY_PARAMS,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.RESTORE_DEFAULT_DISPLAY_PARAMS,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_FORECAST_DISPLAY_FORMAT,
      value: 'chart',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_FORECAST_CHART_PARAMETER,
      value: 'temperature',
    });
  });
});

const createStep = (
  overrides: Partial<types.TimeStepData> = {}
): types.TimeStepData =>
  ({
    dark: 0,
    dayLength: 0,
    epochtime: 1_700_000_000,
    localtime: '2023-11-14T22:13:20',
    modtime: '2023-11-14T21:00:00',
    moonphase: 0,
    name: 'Helsinki',
    sunrise: '08:00',
    sunriseToday: 8,
    sunset: '16:00',
    sunsetToday: 16,
    ...overrides,
  } as types.TimeStepData);

const createState = (
  forecastOverrides: Partial<types.ForecastState> = {}
) =>
  ({
    forecast: {
      ...defaultState,
      ...forecastOverrides,
    },
    location: {
      current: {
        id: 99,
      },
    },
  } as any);
