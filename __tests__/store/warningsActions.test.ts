import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';

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
const rootReducer = combineReducers({ warnings: reducer });
const createWarningsStore = () => createStore(
  rootReducer,
  applyMiddleware(thunk as ThunkMiddleware<ReturnType<typeof rootReducer>, WarningsActionTypes>)
);

describe('fetchWarnings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    i18n.language = 'fi';
    mockGetWarnings.mockResolvedValue({ data });
  });

  it('loads initial warnings and saves the publication time from the API', async () => {
    const store = createWarningsStore();
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings.loading).toBe(true);
    await pending;
    expect(mockGetWarnings).toHaveBeenCalledWith(location);
    expect(store.getState().warnings).toMatchObject({
      data: { [location.id]: data }, updated: data.updated, loading: false, error: false,
    });
  });

  it('keeps the entire state and derived day data unchanged when the publication time is unchanged', async () => {
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previous = store.getState();
    const selectorState = { ...previous, location: { current: location } };
    const days = selectDailyWarningData(selectorState as Parameters<typeof selectDailyWarningData>[0]);
    // A fresh response object must not replace the stored data on the same timestamp.
    mockGetWarnings.mockResolvedValue({ data: { ...data, warnings: [...data.warnings] } });
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState()).toBe(previous);
    await pending;
    expect(mockGetWarnings).toHaveBeenCalledTimes(2);
    expect(store.getState()).toBe(previous);
    const nextSelectorState = { ...store.getState(), location: { current: location } };
    expect(selectDailyWarningData(nextSelectorState as Parameters<typeof selectDailyWarningData>[0])).toBe(days);
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

  it('clears a background error on a successful retry without replacing unchanged warning data', async () => {
    const store = createWarningsStore();
    await store.dispatch(fetchWarnings(location));
    const previousData = store.getState().warnings.data;
    mockGetWarnings.mockRejectedValueOnce({ code: 503, message: 'Unavailable' });
    await store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings.error).toBeTruthy();
    const pending = store.dispatch(fetchWarnings(location));
    expect(store.getState().warnings.loading).toBe(true);
    await pending;
    expect(store.getState().warnings).toMatchObject({ loading: false, error: false, updated: data.updated });
    expect(store.getState().warnings.data).toBe(previousData);
  });
});
