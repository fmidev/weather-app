import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { NewsState } from './types';
import { Config } from '@config';
import moment from 'moment';

const selectNewsDomain: Selector<State, NewsState> = (
  state
) => state.news;

export const selectLoading = createSelector(
  selectNewsDomain,
  (news) => news.loading
);

export const selectError = createSelector(
  selectNewsDomain,
  (news) => news.error
);

export const selectNews = createSelector(
  selectNewsDomain,
  (news) => {
    const { outdated } = Config.get('news');
    if (!outdated || outdated === 0) {
      return news.news;
    }
    return news.news.filter(
      (item) => !moment(item.createdAt).isBefore(moment().subtract(outdated, 'days'))
    );
  }
);
