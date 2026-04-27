import reducer from '@store/warnings/reducer';
import * as selectors from '@store/warnings/selectors';
import * as types from '@store/warnings/types';

jest.mock('@store/location/selector', () => ({
  selectGeoid: (state: any) => state.location.current.id,
}));

const warning = {
  duration: {
    endTime: '2026-04-27T18:00:00Z',
    startTime: '2026-04-27T06:00:00Z',
  },
  severity: 'Severe',
  type: 'wind',
} as types.Warning;

const warningsData: types.WarningsData = {
  error: 0,
  updated: '2026-04-27T09:00:00Z',
  warnings: [warning],
};

const capWarning = {
  identifier: 'cap-1',
  info: {
    area: [],
    category: 'Met',
    certainty: 'Likely',
    description: 'Wind',
    event: 'Wind',
    expires: new Date('2026-04-28T00:00:00Z'),
    headline: 'Wind warning',
    instruction: '',
    language: 'en',
    onset: new Date('2026-04-27T00:00:00Z'),
    responseType: '',
    severity: 'Severe',
    urgency: 'Expected',
  } as any,
  msgType: 'Alert',
  references: '',
  scope: 'Public',
  sender: 'sender',
  sent: new Date('2026-04-27T00:00:00Z'),
  status: 'Actual',
} as types.CapWarning;

describe('warnings store', () => {
  it('handles warning fetch lifecycle actions', () => {
    expect(reducer(undefined, { type: types.FETCH_WARNINGS })).toMatchObject({
      error: false,
      loading: true,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_WARNINGS_SUCCESS,
        data: warningsData,
        id: 99,
        timestamp: 123,
      })
    ).toMatchObject({
      data: { 99: warningsData },
      error: false,
      fetchSuccessTime: 123,
      fetchTimestamp: 123,
      loading: false,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_WARNINGS_ERROR,
        error: { code: 500, message: 'failed' },
        timestamp: 456,
      })
    ).toMatchObject({
      error: { code: 500, message: 'failed' },
      fetchTimestamp: 456,
      loading: false,
    });
  });

  it('handles CAP warnings success', () => {
    expect(
      reducer(undefined, {
        type: types.FETCH_CAP_WARNINGS_SUCCESS,
        data: [capWarning],
        timestamp: 789,
      })
    ).toMatchObject({
      capData: [capWarning],
      error: false,
      fetchSuccessTime: 789,
      fetchTimestamp: 789,
      loading: false,
    });
  });

  it('selects warnings for current location and CAP data', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2000);
    const state = {
      location: {
        current: { id: 99 },
      },
      warnings: {
        capData: [capWarning],
        data: { 99: warningsData },
        error: false,
        fetchSuccessTime: 1000,
        fetchTimestamp: Date.parse('2026-04-27T09:00:00Z'),
        loading: false,
      },
    } as any;

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
});
