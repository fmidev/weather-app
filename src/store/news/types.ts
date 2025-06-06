export const FETCH_NEWS = 'FETCH_NEWS';
export const FETCH_NEWS_SUCCESS = 'FETCH_NEWS_SUCCESS';
export const FETCH_NEWS_ERROR = 'FETCH_NEWS_ERROR';

interface FetchNews {
  type: typeof FETCH_NEWS;
}

interface FetchNewsSuccess {
  type: typeof FETCH_NEWS_SUCCESS;
  data: NewsItem[];
  timestamp: number;
}

interface FetchNewsError {
  type: typeof FETCH_NEWS_ERROR;
  error: Error;
  timestamp: number;
}

export type NewsActionTypes =
  | FetchNews
  | FetchNewsSuccess
  | FetchNewsError;

export interface Error {
  code: number;
  message: string;
}

export interface NewsItem {
  id: string;
  type: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string;
  createdAt: string;
  updatedAt: string;
  language: string;
}

export interface NewsState {
  news: NewsItem[];
  loading: boolean;
  error: boolean | Error | string;
  fetchTimestamp: number;
  fetchSuccessTime: number;
}