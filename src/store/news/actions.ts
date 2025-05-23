import { Dispatch } from 'react';
import getNews from '@network/NewsApi';
import {
  Error,
  FETCH_NEWS,
  FETCH_NEWS_SUCCESS,
  FETCH_NEWS_ERROR,
  NewsActionTypes,
} from './types';

const fetchNews =
  (language: string) => (dispatch: Dispatch<NewsActionTypes>) => {
    dispatch({ type: FETCH_NEWS });

    getNews(language)
      .then((data) => {
        dispatch({
          type: FETCH_NEWS_SUCCESS,
          data,
          timestamp: Date.now(),
        });
      })
      .catch((error: Error) => {
        dispatch({
          type: FETCH_NEWS_ERROR,
          error,
          timestamp: Date.now(),
        });
      });
  };

export default fetchNews;
export { fetchNews };