import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import moment from 'moment-timezone';

import i18n from '@i18n';
import getWarnings from '@network/WarningsApi';
import { fetchWarnings } from '@store/warnings/actions';
import reducer from '@store/warnings/reducer';
import { selectDailyWarningData } from '@store/warnings/selectors';
import { Location } from '@store/location/types';
import { WarningsActionTypes, WarningsData } from '@store/warnings/types';

jest.mock('@i18n', () => ({ __esModule: true, default: { language: 'fi' } }));
jest.mock('@network/WarningsApi', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@network/CapWarningsApi', () => ({ __esModule: true, default: jest.fn() }));

const location: Location = {
  id: 99, name: 'Helsinki', area: 'Uusimaa', lat: 60.17, lon: 24.94,
  country: 'FI', timezone: 'Europe/Helsinki',
};
const data: WarningsData = {
  updated: '2026-10-08T09:00:00Z',
  error: 0,
  warnings: [{
    type: 'wind', language: 'fi', severity: 'Moderate', description: 'Wind warning',
    duration: { startTime: '2026-10-08T09:00:00Z', endTime: '2026-10-09T09:00:00Z' },
  }],
};
const mockGetWarnings = jest.mocked(getWarnings);
const deferredResponse = () => {
  let resolve!: (response: { data: WarningsData }) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<{ data: WarningsData }>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const rootReducer = combineReducers({ warnings: reducer });
const createWarningsStore = () => createStore(
  rootReducer,
  applyMiddleware(thunk as ThunkMiddleware<ReturnType<typeof rootReducer>, WarningsActionTypes>)
);

describe('fetchWarnings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 9, 8, 12).getTime());
    i18n.language = 'fi';
    mockGetWarnings.mockResolvedValue({ data });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    moment.tz.setDefault();
  });

  it('loads initial warnings and saves the publication time from the API', async () => {
    const store = createWarningsStore();
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings.loading).toBe(true);
    await pending;
    expect(mockGetWarnings).toHaveBeenCalledWith(location, expect.any(AbortController));
    expect(store.getState().warnings).toMatchObject({
      data: { [location.id]: data }, updated: data.updated, loading: false, error: false,
    });
  });

  it('refreshes the success time while preserving warning data and the day list for unchanged responses', async () => {
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previous = store.getState();
    const selectorState = { ...previous, location: { current: location } };
    const days = selectDailyWarningData(selectorState as Parameters<typeof selectDailyWarningData>[0]);
    // A fresh response object must not replace the stored data on the same timestamp.
    mockGetWarnings.mockResolvedValue({ data: { ...data, warnings: [...data.warnings] } });
    const refreshTime = new Date(2026, 9, 8, 15).getTime();
    jest.spyOn(Date, 'now').mockReturnValue(refreshTime);
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState()).toBe(previous);
    await pending;
    expect(mockGetWarnings).toHaveBeenCalledTimes(2);
    const next = store.getState();
    expect(next.warnings.fetchSuccessTime).toBe(refreshTime);
    expect(next.warnings.fetchSuccessTime).toBeGreaterThan(previous.warnings.fetchSuccessTime);
    expect(next.warnings.fetchTimestamp).toBe(previous.warnings.fetchTimestamp);
    expect(next.warnings.data).toBe(previous.warnings.data);
    expect(next.warnings.data[location.id]).toBe(data);
    expect(next.warnings.updated).toBe(data.updated);
    const nextSelectorState = { ...next, location: { current: location } };
    expect(selectDailyWarningData(nextSelectorState as Parameters<typeof selectDailyWarningData>[0])).toBe(days);
  });

  it.each([
    {
      timezone: 'UTC',
      beforeMidnight: Date.parse('2026-10-08T23:59:00Z'),
      afterMidnight: Date.parse('2026-10-09T00:01:00Z'),
      previousDay: Date.parse('2026-10-08T00:00:00Z'),
      nextDay: Date.parse('2026-10-09T00:00:00Z'),
      lastDay: Date.parse('2026-10-13T00:00:00Z'),
    },
    {
      timezone: 'Europe/Helsinki',
      beforeMidnight: Date.parse('2026-10-08T20:59:00Z'),
      afterMidnight: Date.parse('2026-10-08T21:01:00Z'),
      previousDay: Date.parse('2026-10-07T21:00:00Z'),
      nextDay: Date.parse('2026-10-08T21:00:00Z'),
      lastDay: Date.parse('2026-10-12T21:00:00Z'),
    },
  ])('advances the five-day window after midnight without replacing unchanged warning data ($timezone)', async ({
    timezone, beforeMidnight, afterMidnight, previousDay, nextDay, lastDay,
  }) => {
    moment.tz.setDefault(timezone);
    jest.spyOn(Date, 'now').mockReturnValue(beforeMidnight);
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previous = store.getState();
    const selectorState = { ...previous, location: { current: location } };
    const days = selectDailyWarningData(selectorState as Parameters<typeof selectDailyWarningData>[0]);

    jest.spyOn(Date, 'now').mockReturnValue(afterMidnight);
    mockGetWarnings.mockResolvedValue({ data: { ...data, warnings: [...data.warnings] } });
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState()).toBe(previous);
    await pending;

    const next = store.getState();
    expect(next.warnings.data).toBe(previous.warnings.data);
    expect(next.warnings.data[location.id]).toBe(data);
    expect(next.warnings.updated).toBe(data.updated);
    expect(next.warnings.fetchTimestamp).toBe(afterMidnight);
    expect(next.warnings.fetchSuccessTime).toBe(afterMidnight);
    expect(next.warnings.loading).toBe(false);
    const nextSelectorState = { ...next, location: { current: location } };
    const nextDays = selectDailyWarningData(nextSelectorState as Parameters<typeof selectDailyWarningData>[0]);
    expect(nextDays).not.toBe(days);
    expect(nextDays).toHaveLength(5);
    expect(days[0].date).toBe(previousDay);
    expect(nextDays[0].date).toBe(nextDay);
    expect(nextDays[4].date).toBe(lastDay);
  });

  it('saves a new publication time and response without toggling background loading', async () => {
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previous = store.getState();
    const updated = { ...data, updated: '2026-10-08T10:00:00Z', warnings: [] };
    mockGetWarnings.mockResolvedValue({ data: updated });
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState()).toBe(previous);
    await pending;
    expect(store.getState().warnings).toMatchObject({
      data: { [location.id]: updated }, updated: updated.updated, loading: false, error: false,
    });
    expect(store.getState()).not.toBe(previous);
  });

  it.each(['location', 'coordinates', 'language'])('stores a new %s response even with the same publication time', async (context) => {
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previous = store.getState();
    let nextLocation = location;
    if (context === 'location') nextLocation = { ...location, id: 100 };
    if (context === 'coordinates') nextLocation = { ...location, lat: 61.5 };
    if (context === 'language') i18n.language = 'en';
    const response = { ...data, warnings: [] };
    mockGetWarnings.mockResolvedValue({ data: response });
    await store.dispatch(fetchWarnings(nextLocation));
    expect(store.getState()).not.toBe(previous);
    expect(store.getState().warnings.data[nextLocation.id]).toBe(response);
    expect(store.getState().warnings.updated).toBe(data.updated);
  });

  it('finishes loading on an initial fetch error and recovers on retry', async () => {
    const store = createWarningsStore();
    const error = { code: 503, message: 'Unavailable' };
    mockGetWarnings.mockRejectedValueOnce(error);
    await store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings).toMatchObject({ loading: false, error, updated: undefined });
    await store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings).toMatchObject({ loading: false, error: false, updated: data.updated });
  });

  it.each(['same context', 'coordinates', 'language', 'country'])(
    'cancels the previous request and ignores its late success (%s)', async (context) => {
      const store = createWarningsStore();
      const oldResponse = deferredResponse();
      mockGetWarnings.mockReturnValueOnce(oldResponse.promise);
      const oldRequest = store.dispatch(fetchWarnings(location));
      const oldController = mockGetWarnings.mock.calls[0][1]!;
      let nextLocation = location;
      if (context === 'coordinates') nextLocation = { ...location, lat: 61.5 };
      if (context === 'country') nextLocation = { ...location, country: 'SE' };
      if (context === 'language') i18n.language = 'en';
      const latestData = { ...data, updated: '2026-10-08T10:00:00Z', warnings: [] };
      mockGetWarnings.mockResolvedValueOnce({ data: latestData });

      await store.dispatch(fetchWarnings(nextLocation));
      expect(oldController.signal.aborted).toBe(true);
      expect(mockGetWarnings.mock.calls[1][1]!.signal.aborted).toBe(false);
      const latestState = store.getState();
      expect(latestState.warnings.data[location.id]).toBe(latestData);

      // Resolve despite cancellation to exercise the independent stale-response guard.
      oldResponse.resolve({ data });
      await oldRequest;
      expect(store.getState()).toBe(latestState);
    }
  );

  it.each(['cancellation', 'network error'])(
    'ignores an old %s after the latest request succeeds', async (errorType) => {
      const store = createWarningsStore();
      const oldResponse = deferredResponse();
      mockGetWarnings.mockReturnValueOnce(oldResponse.promise);
      const oldRequest = store.dispatch(fetchWarnings(location));
      await store.dispatch(fetchWarnings(location));
      const latestState = store.getState();

      oldResponse.reject({
        code: errorType === 'cancellation' ? 'ERR_CANCELED' : 'ERR_NETWORK',
        message: errorType,
      });
      await oldRequest;
      expect(store.getState()).toBe(latestState);
    }
  );

  it('keeps the latest request active when an older request finishes', async () => {
    const store = createWarningsStore();
    const first = deferredResponse();
    const second = deferredResponse();
    mockGetWarnings.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const firstRequest = store.dispatch(fetchWarnings(location));
    const secondRequest = store.dispatch(fetchWarnings(location));
    const pendingState = store.getState();
    first.reject({ code: 'ERR_CANCELED' });
    await firstRequest;
    expect(store.getState()).toBe(pendingState);
    expect(store.getState().warnings.loading).toBe(true);

    await store.dispatch(fetchWarnings(location));
    expect(mockGetWarnings.mock.calls[1][1]!.signal.aborted).toBe(true);
    const latestState = store.getState();
    second.resolve({ data: { ...data, warnings: [] } });
    await secondRequest;
    expect(store.getState()).toBe(latestState);
  });

  it('keeps requests in separate stores independent', async () => {
    const firstStore = createWarningsStore();
    const secondStore = createWarningsStore();
    const first = deferredResponse();
    mockGetWarnings.mockReturnValueOnce(first.promise);
    const firstRequest = firstStore.dispatch(fetchWarnings(location));
    await secondStore.dispatch(fetchWarnings(location));
    expect(mockGetWarnings.mock.calls[0][1]!.signal.aborted).toBe(false);
    first.resolve({ data });
    await firstRequest;
    expect(firstStore.getState().warnings.data[location.id]).toBe(data);
    expect(secondStore.getState().warnings.data[location.id]).toBe(data);
  });

  it('clears a background error on a successful retry without replacing unchanged warning data', async () => {
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previousData = store.getState().warnings.data;
    const previousSuccessTime = store.getState().warnings.fetchSuccessTime;
    jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 9, 8, 13).getTime());
    mockGetWarnings.mockRejectedValueOnce({ code: 503, message: 'Unavailable' });
    await store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings.error).toBeTruthy();
    expect(store.getState().warnings.fetchSuccessTime).toBe(previousSuccessTime);
    const retryTime = new Date(2026, 9, 8, 14).getTime();
    jest.spyOn(Date, 'now').mockReturnValue(retryTime);
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings.loading).toBe(true);
    await pending;
    expect(store.getState().warnings).toMatchObject({ loading: false, error: false, updated: data.updated });
    expect(store.getState().warnings.data).toBe(previousData);
    expect(store.getState().warnings.fetchSuccessTime).toBe(retryTime);
  });
});
