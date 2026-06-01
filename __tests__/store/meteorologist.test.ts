import reducer from '@store/meteorologist/reducer';
import * as selectors from '@store/meteorologist/selector';
import * as types from '@store/meteorologist/types';

const snapshot: types.MeteorologistSnapshot = {
  date: '2026-04-27T09:00:00Z',
  hasAlert: true,
  text: 'Windy',
  title: 'Forecast',
};

describe('meteorologist store', () => {
  it('handles fetch lifecycle actions', () => {
    expect(reducer(undefined, { type: types.FETCH_SNAPSHOT })).toMatchObject({
      error: false,
      loading: true,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_SNAPSHOT_SUCCESS,
        data: snapshot,
        timestamp: 123,
      })
    ).toMatchObject({
      error: false,
      fetchSuccessTime: 123,
      fetchTimestamp: 123,
      loading: false,
      snapshot,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_SNAPSHOT_ERROR,
        error: { code: 500, message: 'failed' },
        timestamp: 456,
      })
    ).toMatchObject({
      error: { code: 500, message: 'failed' },
      fetchTimestamp: 456,
      loading: false,
    });
  });

  it('selects meteorologist state', () => {
    const state = {
      meteorologist: {
        error: false,
        fetchSuccessTime: 123,
        fetchTimestamp: 123,
        loading: false,
        snapshot,
      },
    } as any;

    expect(selectors.selectMeteorologistSnapshot(state)).toBe(snapshot);
    expect(selectors.selectLoading(state)).toBe(false);
    expect(selectors.selectError(state)).toBe(false);
  });
});
