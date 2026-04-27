import reducer from '@store/announcements/reducer';
import * as selectors from '@store/announcements/selectors';
import * as types from '@store/announcements/types';

const announcement = {
  id: '1',
  title: 'Crisis title',
  text: 'Crisis text',
  type: 'Crisis',
} as any;

const maintenance = {
  id: '2',
  title: 'Maintenance title',
  text: 'Maintenance text',
  type: 'Maintenance',
} as any;

describe('announcements store', () => {
  it('handles fetch lifecycle actions', () => {
    expect(
      reducer(undefined, { type: types.FETCH_ANNOUNCEMENTS })
    ).toMatchObject({
      error: false,
      loading: true,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_ANNOUNCEMENTS_SUCCESS,
        data: [announcement],
        timestamp: 123,
      })
    ).toMatchObject({
      data: [announcement],
      error: false,
      fetchSuccessTime: 123,
      fetchTimestamp: 123,
      loading: false,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_ANNOUNCEMENTS_ERROR,
        error: { code: 500, message: 'failed' },
        timestamp: 456,
      })
    ).toMatchObject({
      error: { code: 500, message: 'failed' },
      fetchTimestamp: 456,
      loading: false,
    });
  });

  it('selects announcement state, crisis and maintenance items', () => {
    const state = {
      announcements: {
        data: [announcement, maintenance],
        error: false,
        fetchSuccessTime: 123,
        fetchTimestamp: 123,
        loading: false,
      },
    } as any;

    expect(selectors.selectAnnouncements(state)).toEqual([
      announcement,
      maintenance,
    ]);
    expect(selectors.selectCrisis(state)).toBe(announcement);
    expect(selectors.selectMaintenance(state)).toBe(maintenance);
    expect(selectors.selectLoading(state)).toBe(false);
    expect(selectors.selectError(state)).toBe(false);
    expect(selectors.selectFetchTimestamp(state)).toBe(123);
  });
});
