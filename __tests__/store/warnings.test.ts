import reducer from '@store/warnings/reducer';
import * as types from '@store/warnings/types';

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
        requestKey: 'location-99-fi',
      })
    ).toMatchObject({
      data: { 99: warningsData },
      error: false,
      fetchSuccessTime: 123,
      fetchTimestamp: 123,
      loading: false,
      updated: warningsData.updated,
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
    const state = reducer(undefined, {
      type: types.FETCH_WARNINGS_SUCCESS,
      data: warningsData,
      id: 99,
      timestamp: 123,
      requestKey: 'location-99-fi',
    });
    expect(
      reducer(state, {
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
      updated: warningsData.updated,
      updatedRequestKey: 'location-99-fi',
    });
  });
});
