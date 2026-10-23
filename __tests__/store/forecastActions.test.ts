import { fetchFavoriteForecasts, fetchForecast } from '@store/forecast/actions';
import type { Location } from '@store/location/types';
import type { State } from '@store/types';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_ERROR,
  FETCH_FORECAST_SUCCESS,
  FETCH_FAVORITE_FORECASTS_SUCCESS,
} from '@store/forecast/types';

const mockGetForecast = jest.fn();
const mockGetFavoriteForecasts = jest.fn();

jest.mock('@network/WeatherApi', () => ({
  getForecast: (...args: any[]) => mockGetForecast(...args),
  getFavoriteForecasts: (...args: any[]) => mockGetFavoriteForecasts(...args),
}));
jest.mock('@config', () => ({
  Config: { get: () => ({ forecast: { maxAge: 24 } }) },
}));
jest.mock('@utils/helpers', () => ({ getIndexForDaySmartSymbol: jest.fn() }));

describe('background forecast requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads all favorites together and dispatches their result as one update', async () => {
    const locations = [
      { id: 2, lat: 61.5, lon: 23.8 },
      { id: 3, lat: 59, lon: 18 },
    ] as Location[];
    const data = { 2: [], 3: [] };
    mockGetFavoriteForecasts.mockResolvedValueOnce(data);
    const dispatch = jest.fn();

    await fetchFavoriteForecasts(locations)(dispatch);

    expect(mockGetFavoriteForecasts).toHaveBeenCalledTimes(1);
    expect(mockGetFavoriteForecasts).toHaveBeenCalledWith(locations);
    expect(mockGetForecast).not.toHaveBeenCalled();
    expect(dispatch.mock.calls).toEqual([
      [{ type: FETCH_FORECAST, background: true }],
      [{ type: FETCH_FAVORITE_FORECASTS_SUCCESS, data }],
    ]);
  });

  it('keeps a failed batch request in the background', async () => {
    const error = new Error('offline');
    mockGetFavoriteForecasts.mockRejectedValueOnce(error);
    const dispatch = jest.fn();

    await fetchFavoriteForecasts([{ id: 2, lat: 61, lon: 24 }] as Location[])(
      dispatch
    );

    expect(dispatch).toHaveBeenLastCalledWith({
      type: FETCH_FORECAST_ERROR,
      background: true,
      error,
      timestamp: expect.any(Number),
    });
  });

  it('does not fetch or dispatch for an empty favorite list', async () => {
    const dispatch = jest.fn();
    await fetchFavoriteForecasts([])(dispatch);
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockGetFavoriteForecasts).not.toHaveBeenCalled();
  });

  it.each(['fresh', 'stale', 'past', 'missing'])(
    'uses a %s cached forecast when refreshing a selected favorite',
    async (status) => {
      const now = Date.now();
      const location = { geoid: 2, latlon: '61.5,23.8' };
      const step = {
        epochtime: (now + (status === 'past' ? -3600000 : 3600000)) / 1000,
        modtime: new Date(now - (status === 'stale' ? 48 : 1) * 3600000)
          .toISOString()
          .replace('Z', ''),
      };
      const state = {
        forecast: { data: status === 'missing' ? {} : { 2: [step] } },
      } as unknown as State;
      mockGetForecast.mockResolvedValueOnce({
        location,
        forecast: [],
        isAuroraBorealisLikely: false,
      });
      const dispatch = jest.fn();
      await fetchForecast(location, 'FI')(dispatch, () => state);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        status === 'fresh'
          ? { type: FETCH_FORECAST, hasCachedData: true }
          : { type: FETCH_FORECAST }
      );
    }
  );

  it('marks both request and success as background actions', async () => {
    const location = { geoid: 2, latlon: '61.5,23.8' };
    const data = { location, forecast: [], isAuroraBorealisLikely: false };
    mockGetForecast.mockResolvedValueOnce(data);
    const dispatch = jest.fn();

    await fetchForecast(location, 'FI', { background: true })(dispatch);

    expect(mockGetForecast).toHaveBeenCalledWith(location, 'FI');
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: FETCH_FORECAST,
      background: true,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: FETCH_FORECAST_SUCCESS,
      background: true,
      data,
      timestamp: expect.any(Number),
    });
  });

  it('marks a failed favorite request as a background error', async () => {
    const error = { code: 503, message: 'unavailable' };
    mockGetForecast.mockRejectedValueOnce(error);
    const dispatch = jest.fn();

    await fetchForecast({ geoid: 2 }, 'SE', { background: true })(dispatch);

    expect(dispatch).toHaveBeenLastCalledWith({
      type: FETCH_FORECAST_ERROR,
      background: true,
      error,
      timestamp: expect.any(Number),
    });
  });
});
