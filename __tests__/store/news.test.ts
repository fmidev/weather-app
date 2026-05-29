import moment from 'moment';

import reducer from '@store/news/reducer';
import * as selectors from '@store/news/selector';
import * as types from '@store/news/types';

const mockConfigGet = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

const recentNews: types.NewsItem = {
  createdAt: moment().subtract(1, 'day').toISOString(),
  id: 'recent',
  imageAlt: 'alt',
  imageUrl: null,
  language: 'en',
  showEditedDateTime: false,
  title: 'Recent news',
  type: 'article',
  updatedAt: moment().toISOString(),
};

const oldNews: types.NewsItem = {
  ...recentNews,
  createdAt: moment().subtract(10, 'days').toISOString(),
  id: 'old',
  title: 'Old news',
};

describe('news store', () => {
  beforeEach(() => {
    mockConfigGet.mockReturnValue({ outdated: 0 });
  });

  it('handles fetch lifecycle actions', () => {
    expect(reducer(undefined, { type: types.FETCH_NEWS })).toMatchObject({
      error: false,
      loading: true,
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_NEWS_SUCCESS,
        data: [recentNews],
        timestamp: 123,
      })
    ).toMatchObject({
      error: false,
      fetchSuccessTime: 123,
      fetchTimestamp: 123,
      loading: false,
      news: [recentNews],
    });

    expect(
      reducer(undefined, {
        type: types.FETCH_NEWS_ERROR,
        error: { code: 500, message: 'failed' },
        timestamp: 456,
      })
    ).toMatchObject({
      error: { code: 500, message: 'failed' },
      fetchTimestamp: 456,
      loading: false,
    });
  });

  it('selects news and filters outdated items when configured', () => {
    const state = {
      news: {
        error: false,
        fetchSuccessTime: 123,
        fetchTimestamp: 123,
        loading: false,
        news: [recentNews, oldNews],
      },
    } as any;

    expect(selectors.selectNews(state)).toEqual([recentNews, oldNews]);

    mockConfigGet.mockReturnValue({ outdated: 3 });
    expect(
      selectors.selectNews({
        ...state,
        news: { ...state.news },
      })
    ).toEqual([recentNews]);
    expect(selectors.selectLoading(state)).toBe(false);
    expect(selectors.selectError(state)).toBe(false);
  });
});
