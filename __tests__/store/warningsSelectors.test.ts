import * as selectors from '@store/warnings/selectors';
import { State } from '@store/types';
import { CapWarning, Warning, WarningsData } from '@store/warnings/types';

jest.mock('@store/location/selector', () => ({
  selectGeoid: (state: State) => state.location.current?.id,
}));

const warning = {
  duration: {
    startTime: '2026-04-27T06:00:00Z',
    endTime: '2026-04-27T18:00:00Z',
  },
  severity: 'Severe',
  type: 'wind',
} as Warning;

const warningsData: WarningsData = {
  error: 0,
  updated: '2026-04-27T09:00:00Z',
  warnings: [warning],
};
const capWarning = { identifier: 'cap-1' } as CapWarning;

const createState = (fetchTimestamp: number): State => ({
  location: { current: { id: 99 } },
  warnings: {
    capData: [capWarning],
    data: { 99: warningsData },
    error: false,
    fetchSuccessTime: 1000,
    fetchTimestamp,
    loading: false,
    updated: warningsData.updated,
    updatedRequestKey: 'location-99-fi',
  },
} as unknown as State);

describe('warnings selectors', () => {
  afterEach(() => jest.restoreAllMocks());

  it('selects warnings for current location and CAP data', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2000);
    const state = createState(Date.parse('2026-04-27T09:00:00Z'));

    expect(selectors.selectWarnings(state)).toEqual([warning]);
    expect(selectors.selectUpdated(state)).toBe('2026-04-27T09:00:00Z');
    expect(selectors.selectWarningsAge(state)).toBe(1000);
    expect(selectors.selectCapWarningData(state)).toEqual([capWarning]);
    expect(selectors.selectFetchSuccessTime(state)).toBe(1000);
    expect(selectors.selectDailyWarningData(state)[0]).toMatchObject({
      count: 1,
      type: 'wind',
      warnings: [warning],
    });
  });

  it('keeps the daily warning list reference when the fetch time changes within the same local day', () => {
    const state = createState(new Date(2026, 3, 27, 9).getTime());
    const days = selectors.selectDailyWarningData(state);
    const next = {
      ...state,
      warnings: { ...state.warnings, fetchTimestamp: new Date(2026, 3, 27, 18).getTime() },
    };

    expect(selectors.selectDailyWarningData(next)).toBe(days);
    expect(days[0].date).toBe(new Date(2026, 3, 27).getTime());
  });

  describe('selectLocationWarnings', () => {
    const now = Date.parse('2026-04-27T21:00:00Z');

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now);
    });

    it.each([
      ['recent data', '2026-04-27T20:00:00Z', true],
      ['exactly twelve hours old', '2026-04-27T09:00:00Z', true],
      ['older than twelve hours', '2026-04-27T08:59:59.999Z', false],
      ['a timezone offset at the age limit', '2026-04-27T12:00:00+03:00', true],
      ['an invalid publication time', 'invalid', false],
      ['a missing publication time', '', false],
    ])('filters %s using its publication time', (_description, updated, included) => {
      const state = createState(now);
      const data = { ...warningsData, updated: updated as string };
      state.warnings.data = { 99: data };

      expect(selectors.selectLocationWarnings(state)).toEqual(included ? { 99: data } : {});
      expect(state.warnings.data[99]).toBe(data);
    });

    it('filters each location separately and keeps fresh empty warning lists', () => {
      const state = createState(now);
      const expired = { ...warningsData, updated: '2026-04-26T21:00:00Z' };
      const empty = { ...warningsData, warnings: [] };
      state.warnings.data = { 99: warningsData, 100: expired, 101: empty, 102: undefined };

      const result = selectors.selectLocationWarnings(state);
      expect(result).toEqual({ 99: warningsData, 101: empty });
      expect(result[99]).toBe(warningsData);
      expect(result[101]).toBe(empty);
      expect(state.warnings.data[100]).toBe(expired);
      expect(selectors.selectWarnings(state)).toEqual(warningsData.warnings);
    });

    it('expires data as time advances with the same Redux state', () => {
      const state = createState(now);
      expect(selectors.selectLocationWarnings(state)).toEqual({ 99: warningsData });

      jest.mocked(Date.now).mockReturnValue(now + 1);
      expect(selectors.selectLocationWarnings(state)).toEqual({});
    });

    it('preserves the result reference while the retained warnings stay the same', () => {
      const state = createState(now);
      const expired = { ...warningsData, updated: '2026-04-26T21:00:00Z' };
      const recent = { ...warningsData, updated: '2026-04-27T20:00:00Z' };
      state.warnings.data = { 99: recent, 100: expired };
      const result = selectors.selectLocationWarnings(state);

      jest.mocked(Date.now).mockReturnValue(now + 1);
      expect(selectors.selectLocationWarnings(state)).toBe(result);
      expect(selectors.selectLocationWarnings({ ...state })).toBe(result);
    });
  });

  it('recalculates the five-day window when the local day changes', () => {
    const state = createState(new Date(2026, 3, 27, 23, 59).getTime());
    const days = selectors.selectDailyWarningData(state);
    const next = {
      ...state,
      warnings: { ...state.warnings, fetchTimestamp: new Date(2026, 3, 28, 0, 1).getTime() },
    };
    const nextDays = selectors.selectDailyWarningData(next);

    expect(next.warnings.data).toBe(state.warnings.data);
    expect(nextDays).not.toBe(days);
    expect(nextDays).toHaveLength(5);
    expect(nextDays[0].date).toBe(new Date(2026, 3, 28).getTime());
    expect(nextDays[4].date).toBe(new Date(2026, 4, 2).getTime());
  });
});
