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
