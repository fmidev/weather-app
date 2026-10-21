import { fetchForecast } from '@store/forecast/actions';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_ERROR,
  FETCH_FORECAST_SUCCESS,
} from '@store/forecast/types';

const mockGetForecast = jest.fn();

jest.mock('@network/WeatherApi', () => ({
  getForecast: (...args: any[]) => mockGetForecast(...args),
}));
jest.mock('@config', () => ({ Config: { get: jest.fn() } }));

describe('background forecast requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
