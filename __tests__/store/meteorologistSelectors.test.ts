import * as selectors from '@store/meteorologist/selector';
import type { MeteorologistSnapshot } from '@store/meteorologist/types';
import type { State } from '@store/types';

const now = Date.parse('2026-04-27T21:00:00Z');
const snapshot: MeteorologistSnapshot = {
  date: '2026-04-27T09:00:00Z',
  hasAlert: true,
  text: 'Windy',
  title: 'Forecast',
};

const createState = (data: MeteorologistSnapshot | null = snapshot): State => ({
  meteorologist: {
    snapshot: data,
    error: false,
    loading: false,
    fetchTimestamp: now,
    fetchSuccessTime: now,
  },
} as State);

describe('meteorologist selectors', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['recent data', '2026-04-27T20:00:00Z', true],
    ['exactly twelve hours old', '2026-04-27T09:00:00Z', true],
    ['older than twelve hours', '2026-04-27T08:59:59.999Z', false],
    ['a timezone offset at the age limit', '2026-04-27T12:00:00+03:00', true],
    ['an invalid publication time', 'invalid', false],
    ['a missing publication time', '', false],
  ])('filters %s using the publication time rather than the fetch time', (_description, date, included) => {
    const data = { ...snapshot, date: date as string };
    const state = createState(data);

    expect(selectors.selectMeteorologistSnapshot(state)).toBe(included ? data : null);
    expect(state.meteorologist.snapshot).toBe(data);
  });

  it('returns null when no snapshot has been loaded', () => {
    expect(selectors.selectMeteorologistSnapshot(createState(null))).toBeNull();
  });

  it('expires the snapshot as time advances with the same Redux state', () => {
    const state = createState();
    expect(selectors.selectMeteorologistSnapshot(state)).toBe(snapshot);

    jest.mocked(Date.now).mockReturnValue(now + 1);
    expect(selectors.selectMeteorologistSnapshot(state)).toBeNull();
  });

  it('preserves the reference to a fresh snapshot while time advances', () => {
    const data = { ...snapshot, date: '2026-04-27T20:00:00Z' };
    const state = createState(data);
    expect(selectors.selectMeteorologistSnapshot(state)).toBe(data);

    jest.mocked(Date.now).mockReturnValue(now + 1000);
    expect(selectors.selectMeteorologistSnapshot(state)).toBe(data);
  });

  it('keeps fresh data available during a refresh or after a refresh error', () => {
    const state = createState();
    state.meteorologist.loading = true;
    expect(selectors.selectLoading(state)).toBe(true);
    expect(selectors.selectError(state)).toBe(false);
    expect(selectors.selectMeteorologistSnapshot(state)).toBe(snapshot);

    const failedState = {
      ...state,
      meteorologist: { ...state.meteorologist, loading: false, error: 'network' },
    };
    expect(selectors.selectLoading(failedState)).toBe(false);
    expect(selectors.selectError(failedState)).toBe('network');
    expect(selectors.selectMeteorologistSnapshot(failedState)).toBe(snapshot);
  });
});
