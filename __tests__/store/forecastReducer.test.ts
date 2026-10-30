import reducer from '@store/forecast/reducer';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_ERROR,
  FETCH_FORECAST_SUCCESS,
  FETCH_ALL_FORECASTS_SUCCESS,
  RETAIN_FORECAST_LOCATIONS,
} from '@store/forecast/types';
import type {
  ForecastActionTypes,
  ForecastState,
  TimeStepData,
} from '@store/forecast/types';

const primarySteps = [{ epochtime: 10, temperature: 5 } as TimeStepData];
const favoriteSteps = [{ epochtime: 10, temperature: 2 } as TimeStepData];

const createState = (loading: boolean): ForecastState => ({
  ...reducer(undefined, {} as ForecastActionTypes),
  data: { 1: primarySteps },
  auroraBorealisData: { 1: true },
  loading,
  error: 'primary forecast error',
  fetchTimestamp: 100,
  fetchSuccessTime: 50,
});

describe('forecast cache pruning', () => {
  it('prunes forecast and aurora data without changing preferences or request status', () => {
    const state = {
      ...createState(false),
      data: { 1: primarySteps, 2: favoriteSteps, 3: favoriteSteps },
      auroraBorealisData: { 1: true, 2: false, 4: true },
    };

    const updated = reducer(state, {
      type: RETAIN_FORECAST_LOCATIONS,
      locationIds: ['1', 2],
    });

    expect(updated).toEqual({
      ...state,
      data: { 1: primarySteps, 2: favoriteSteps },
      auroraBorealisData: { 1: true, 2: false },
    });
    expect(updated.data?.[1]).toBe(primarySteps);
    expect(updated.data?.[2]).toBe(favoriteSteps);
    expect(Object.keys(state.data)).toEqual(['1', '2', '3']);
    expect(Object.keys(state.auroraBorealisData)).toEqual(['1', '2', '4']);
  });

  it('keeps the same state when no cached locations need removing', () => {
    const state = createState(false);
    expect(
      reducer(state, { type: RETAIN_FORECAST_LOCATIONS, locationIds: [1, 2] })
    ).toBe(state);
  });

  it('handles missing cached data', () => {
    const state = {
      ...createState(false),
      data: undefined,
      auroraBorealisData: undefined,
    };
    expect(
      reducer(state, { type: RETAIN_FORECAST_LOCATIONS, locationIds: [1] })
    ).toBe(state);
  });

  it('stores and retains coordinate forecasts and aurora data under the same key', () => {
    const state = reducer(createState(false), {
      type: FETCH_FORECAST_SUCCESS,
      data: {
        location: { geoid: NaN, latlon: '60,25' },
        forecast: [favoriteSteps],
        isAuroraBorealisLikely: false,
      },
      timestamp: 200,
    });
    expect(state.auroraBorealisData?.[0]).toBe(false);
    expect(
      reducer(state, {
        type: RETAIN_FORECAST_LOCATIONS,
        locationIds: [NaN],
      })
    ).toEqual({
      ...state,
      data: { 0: favoriteSteps },
      auroraBorealisData: { 0: false },
    });
  });
});

describe('background forecasts in the forecast reducer', () => {
  it('stores full forecasts for the whole batch without changing aurora data or primary request status', () => {
    const state = createState(true);
    const data = { 2: favoriteSteps, 3: favoriteSteps };
    const updated = reducer(state, {
      type: FETCH_ALL_FORECASTS_SUCCESS,
      data,
      timestamp: 200,
      background: true,
    });

    expect(updated).toEqual({ ...state, data: { ...state.data, ...data } });
    expect(updated.data?.[1]).toBe(primarySteps);
    expect(updated.auroraBorealisData).toBe(state.auroraBorealisData);
    expect(state.data).toEqual({ 1: primarySteps });
  });

  it('completes a primary batch refresh and merges forecasts and aurora data for all locations', () => {
    const state = createState(true);
    const updated = reducer(state, {
      type: FETCH_ALL_FORECASTS_SUCCESS,
      data: { 1: favoriteSteps, 2: favoriteSteps },
      auroraBorealisData: { 1: false },
      timestamp: 200,
    });

    expect(updated).toEqual({
      ...state,
      data: { 1: favoriteSteps, 2: favoriteSteps },
      auroraBorealisData: { 1: false },
      fetchTimestamp: 200,
      fetchSuccessTime: 200,
      loading: false,
      error: false,
    });
  });

  it('keeps a prefetched forecast visible while refreshing the selected location', () => {
    const updated = reducer(createState(true), {
      type: FETCH_FORECAST,
      hasCachedData: true,
    });
    expect(updated.loading).toBe(false);
    expect(updated.error).toBe(false);
    expect(updated.data?.[1]).toBe(primarySteps);
  });

  it.each([true, false])(
    'preserves the primary loading=%s state when a favorite request starts or fails',
    (loading) => {
      const state = createState(loading);

      expect(reducer(state, { type: FETCH_FORECAST, background: true })).toBe(
        state
      );
      expect(
        reducer(state, {
          type: FETCH_FORECAST_ERROR,
          background: true,
          error: { code: 503, message: 'favorite unavailable' },
          timestamp: 200,
        })
      ).toBe(state);
    }
  );

  it.each([true, false])(
    'merges favorites into data while preserving primary loading=%s and request status',
    (loading) => {
      const state = createState(loading);

      const updated = reducer(state, {
        type: FETCH_FORECAST_SUCCESS,
        background: true,
        data: {
          location: { geoid: 2 },
          forecast: [favoriteSteps],
          isAuroraBorealisLikely: false,
        },
        timestamp: 200,
      });

      expect(updated).toEqual({
        ...state,
        data: { 1: primarySteps, 2: favoriteSteps },
        auroraBorealisData: { 1: true, 2: false },
      });
      expect(updated.data?.[1]).toBe(primarySteps);
      expect(state.data).toEqual({ 1: primarySteps });
    }
  );
});
