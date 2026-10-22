import reducer from '@store/forecast/reducer';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_ERROR,
  FETCH_FORECAST_SUCCESS,
  FETCH_FAVORITE_FORECASTS_SUCCESS,
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

describe('background forecasts in the forecast reducer', () => {
  it('stores full forecasts for the whole batch without changing aurora data or primary request status', () => {
    const state = createState(true);
    const data = { 2: favoriteSteps, 3: favoriteSteps };
    const updated = reducer(state, {
      type: FETCH_FAVORITE_FORECASTS_SUCCESS,
      data,
    });

    expect(updated).toEqual({ ...state, data: { ...state.data, ...data } });
    expect(updated.data?.[1]).toBe(primarySteps);
    expect(updated.auroraBorealisData).toBe(state.auroraBorealisData);
    expect(state.data).toEqual({ 1: primarySteps });
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
