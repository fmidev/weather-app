import { fetchAllForecasts, fetchForecast } from '@store/forecast/actions';
import type { Location } from '@store/location/types';
import type { State } from '@store/types';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_ERROR,
  FETCH_FORECAST_SUCCESS,
  FETCH_ALL_FORECASTS_SUCCESS,
} from '@store/forecast/types';

const mockGetForecast = jest.fn();
const mockGetAllForecasts = jest.fn();
const mockGetAuroraBorealisLikelihood = jest.fn();

const currentLocation = { id: 1, lat: 60.1, lon: 24.9, country: 'FI' } as Location;
const getState = () => ({
  location: { current: currentLocation },
  forecast: { data: {} },
}) as unknown as State;

jest.mock('@network/WeatherApi', () => ({
  getForecast: (...args: any[]) => mockGetForecast(...args),
  getAllForecasts: (...args: any[]) => mockGetAllForecasts(...args),
  getAuroraBorealisLikelihood: (...args: any[]) =>
    mockGetAuroraBorealisLikelihood(...args),
}));
jest.mock('@config', () => ({
  Config: { get: () => ({ forecast: { maxAge: 24 } }) },
}));
jest.mock('@utils/helpers', () => ({ getIndexForDaySmartSymbol: jest.fn() }));

describe('forecast requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuroraBorealisLikelihood.mockReset().mockResolvedValue(false);
  });

  it('loads all favorites together and dispatches their result as one update', async () => {
    const locations = [
      { id: 2, lat: 61.5, lon: 23.8 },
      { id: 3, lat: 59, lon: 18 },
    ] as Location[];
    const data = { 2: [], 3: [] };
    mockGetAllForecasts.mockResolvedValueOnce(data);
    const dispatch = jest.fn();

    await fetchAllForecasts(locations)(dispatch, getState);

    expect(mockGetAllForecasts).toHaveBeenCalledTimes(1);
    expect(mockGetAllForecasts).toHaveBeenCalledWith(locations);
    expect(mockGetForecast).not.toHaveBeenCalled();
    expect(dispatch.mock.calls).toEqual([
      [{ type: FETCH_FORECAST, background: true }],
      [{ type: FETCH_ALL_FORECASTS_SUCCESS, data, timestamp: expect.any(Number), background: true }],
    ]);
    expect(mockGetAuroraBorealisLikelihood).not.toHaveBeenCalled();
  });

  it('loads the selected location and favorites in one request and updates primary status and aurora data', async () => {
    const locations = [currentLocation, { id: 2, lat: 61, lon: 24 } as Location];
    const data = { 1: [], 2: [] };
    mockGetAllForecasts.mockResolvedValueOnce(data);
    mockGetAuroraBorealisLikelihood.mockResolvedValueOnce(true);
    const dispatch = jest.fn();

    await fetchAllForecasts(locations)(dispatch, getState);

    expect(mockGetAllForecasts).toHaveBeenCalledTimes(1);
    expect(mockGetAllForecasts).toHaveBeenCalledWith(locations);
    expect(mockGetForecast).not.toHaveBeenCalled();
    expect(mockGetAuroraBorealisLikelihood).toHaveBeenCalledWith(
      { latlon: '60.1,24.9' },
      'FI'
    );
    expect(dispatch.mock.calls).toEqual([
      [{ type: FETCH_FORECAST }],
      [{
        type: FETCH_ALL_FORECASTS_SUCCESS,
        data,
        auroraBorealisData: { 1: true },
        timestamp: expect.any(Number),
      }],
    ]);
  });

  it.each(['fresh', 'stale', 'past', 'missing'])(
    'uses the selected location cache when a batch refresh starts (%s)',
    async (status) => {
      const now = Date.now();
      const state = getState();
      state.forecast.data = status === 'missing' ? {} : {
        1: [{
          epochtime: (now + (status === 'past' ? -3600000 : 3600000)) / 1000,
          modtime: new Date(now - (status === 'stale' ? 48 : 1) * 3600000)
            .toISOString().replace('Z', ''),
        } as any],
      };
      mockGetAllForecasts.mockResolvedValueOnce({ 1: [] });
      const dispatch = jest.fn();

      await fetchAllForecasts([currentLocation])(dispatch, () => state);

      expect(dispatch).toHaveBeenNthCalledWith(1,
        status === 'fresh'
          ? { type: FETCH_FORECAST, hasCachedData: true }
          : { type: FETCH_FORECAST }
      );
    }
  );

  it('reports batch failures for the selected location as primary forecast errors', async () => {
    const error = new Error('offline');
    mockGetAllForecasts.mockRejectedValueOnce(error);
    const dispatch = jest.fn();

    await fetchAllForecasts([currentLocation])(dispatch, getState);

    expect(dispatch).toHaveBeenLastCalledWith({
      type: FETCH_FORECAST_ERROR,
      error,
      timestamp: expect.any(Number),
    });
  });

  it('stores coordinate location aurora information under the forecast cache key', async () => {
    const location = { ...currentLocation, id: NaN };
    const state = getState();
    state.location.current = location;
    mockGetAllForecasts.mockResolvedValueOnce({ 0: [] });
    const dispatch = jest.fn();

    await fetchAllForecasts([location])(dispatch, () => state);

    expect(dispatch).toHaveBeenLastCalledWith({
      type: FETCH_ALL_FORECASTS_SUCCESS,
      data: { 0: [] },
      auroraBorealisData: { 0: false },
      timestamp: expect.any(Number),
    });
  });

  it('keeps a failed batch request in the background', async () => {
    const error = new Error('offline');
    mockGetAllForecasts.mockRejectedValueOnce(error);
    const dispatch = jest.fn();

    await fetchAllForecasts([{ id: 2, lat: 61, lon: 24 }] as Location[])(
      dispatch, getState
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
    await fetchAllForecasts([])(dispatch, getState);
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockGetAllForecasts).not.toHaveBeenCalled();
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
