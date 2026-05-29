jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: (...args: any[]) => {
      const globalMock = globalThis as any;
      if (!globalMock.__mockAxiosCreate) {
        globalMock.__mockAxiosCreate = jest.fn(() => ({ axios: 'instance' }));
      }
      return globalMock.__mockAxiosCreate(...args);
    },
  },
}));

jest.mock('axios-cache-interceptor', () => ({
  setupCache: (...args: any[]) => {
    const globalMock = globalThis as any;
    if (!globalMock.__mockCachedAxios) {
      globalMock.__mockCachedAxios = jest.fn();
    }
    if (!globalMock.__mockSetupCache) {
      globalMock.__mockSetupCache = jest.fn(() => globalMock.__mockCachedAxios);
    }
    return globalMock.__mockSetupCache(...args);
  },
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => {
    const globalMock = globalThis as any;
    if (!globalMock.__mockTrackMatomoEvent) {
      globalMock.__mockTrackMatomoEvent = jest.fn();
    }
    return globalMock.__mockTrackMatomoEvent(...args);
  },
}));

import axiosClient from '@utils/axiosClient';

const mockAxiosInstance = (globalThis as any).__mockAxiosCreate as jest.Mock;
const mockCachedAxios = (globalThis as any).__mockCachedAxios as jest.Mock;
const mockSetupCache = (globalThis as any).__mockSetupCache as jest.Mock;
const mockTrackMatomoEvent = (((globalThis as any).__mockTrackMatomoEvent =
  (globalThis as any).__mockTrackMatomoEvent || jest.fn()) as jest.Mock);

describe('axiosClient', () => {
  beforeEach(() => {
    mockCachedAxios.mockReset();
    mockTrackMatomoEvent.mockClear();
    jest.useRealTimers();
  });

  it('creates cached axios instance on module load', () => {
    expect(mockAxiosInstance).toHaveBeenCalledTimes(1);
    expect(mockSetupCache).toHaveBeenCalledWith(
      mockAxiosInstance.mock.results[0].value
    );
  });

  it('calls cached axios with signal and cache config, omitting timeout from request config', async () => {
    const response = { data: { ok: true }, status: 200 };
    mockCachedAxios.mockResolvedValueOnce(response);

    await expect(
      axiosClient({
        params: { q: 'helsinki' },
        timeout: 123,
        url: 'https://example.test/weather',
      })
    ).resolves.toBe(response);

    expect(mockCachedAxios).toHaveBeenCalledWith({
      cache: { cacheTakeover: false },
      params: { q: 'helsinki' },
      signal: expect.any(AbortSignal),
      url: 'https://example.test/weather',
    });
    expect(mockCachedAxios.mock.calls[0][0]).not.toHaveProperty('timeout');
  });

  it('uses provided AbortController signal', async () => {
    const response = { data: 'ok' };
    const abortController = new AbortController();
    mockCachedAxios.mockResolvedValueOnce(response);

    await expect(
      axiosClient({ url: 'https://example.test' }, abortController)
    ).resolves.toBe(response);

    expect(mockCachedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        signal: abortController.signal,
      })
    );
  });

  it('aborts request after configured timeout', async () => {
    jest.useFakeTimers();
    let resolveRequest!: (value: unknown) => void;
    mockCachedAxios.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const request = axiosClient({
      timeout: 50,
      url: 'https://example.test/slow',
    });
    const signal = mockCachedAxios.mock.calls[0][0].signal as AbortSignal;

    expect(signal.aborted).toBe(false);
    jest.advanceTimersByTime(50);
    expect(signal.aborted).toBe(true);

    resolveRequest({ data: 'late' });
    await expect(request).resolves.toEqual({ data: 'late' });
  });

  it('tracks timeout errors with analytics action', async () => {
    const error = { code: 'ECONNABORTED' };
    mockCachedAxios.mockRejectedValueOnce(error);

    await expect(
      axiosClient({ url: 'https://example.test' }, undefined, 'Weather')
    ).rejects.toBe(error);

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Weather',
      'Timeout'
    );
  });

  it('tracks response header error message when available', async () => {
    const error = {
      response: {
        headers: {
          'X-Smartmet-Error': 'Invalid producer',
        },
        status: 400,
      },
    };
    mockCachedAxios.mockRejectedValueOnce(error);

    await expect(
      axiosClient({ url: 'https://example.test' }, undefined, 'Timeseries')
    ).rejects.toBe(error);

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Timeseries',
      '400: Invalid producer'
    );
  });

  it('tracks response error object when no header error exists', async () => {
    const error = {
      response: {
        headers: {},
        status: 500,
      },
    };
    mockCachedAxios.mockRejectedValueOnce(error);

    await expect(axiosClient({ url: 'https://example.test' })).rejects.toBe(
      error
    );

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Not specified',
      error
    );
  });

  it('tracks network errors unless ignoreError400 param is set', async () => {
    const error = { message: 'Network down' };
    mockCachedAxios.mockRejectedValueOnce(error);

    await expect(
      axiosClient({ url: 'https://example.test' }, undefined, 'Autocomplete')
    ).rejects.toBe(error);

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Autocomplete',
      'Network error: Network down'
    );

    mockTrackMatomoEvent.mockClear();
    mockCachedAxios.mockRejectedValueOnce(error);

    await expect(
      axiosClient({
        params: { ignoreError400: true },
        url: 'https://example.test',
      })
    ).rejects.toBe(error);

    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });
});
