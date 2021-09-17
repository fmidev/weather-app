import { Selector, createSelector } from 'reselect';
import moment from 'moment';
import 'moment/locale/fi';

import { State } from '../types';
import { ForecastState, Error, WeatherData, TimestepData } from './types';
import { selectGeoid } from '../general/selectors';

const selectForecastDomain: Selector<State, ForecastState> = (state) =>
  state.forecast;

export const selectLoading = createSelector<State, ForecastState, boolean>(
  selectForecastDomain,
  (forecast) => forecast.loading
);

export const selectError = createSelector<
  State,
  ForecastState,
  Error | boolean | string
>(selectForecastDomain, (forecast) => forecast.error);

const selectData = createSelector<State, ForecastState, WeatherData>(
  selectForecastDomain,
  (forecast) => forecast.data
);

export const selectForecast = createSelector(
  [selectData, selectGeoid],
  (items, geoid) => items[geoid] || []
);

export const selectForecastByDay = createSelector(
  selectForecast,
  (forecast) =>
    forecast &&
    forecast.length > 0 &&
    forecast.reduce((acc: { [key: string]: any }, curr: TimestepData): {
      [key: string]: TimestepData[];
    } => {
      const day = moment.unix(curr.epochtime).format('D.M.');
      if (acc[day]) {
        return { ...acc, [day]: acc[day].concat(curr) };
      }
      return { ...acc, [day]: [curr] };
    }, {})
);

export const selectHeaderLevelForecast = createSelector(
  selectForecastByDay,
  (forecastByDay) =>
    forecastByDay &&
    Object.keys(forecastByDay).map((key: string, index: number) => {
      const dayArr = forecastByDay[key];
      if (dayArr.length >= 16) {
        return dayArr[15];
      }
      return index === 0 ? dayArr[0] : dayArr[dayArr.length - 1];
    })
);

export const selectForecastLastUpdatedMoment = createSelector(
  selectForecast,
  (forecast) =>
    forecast[0] && forecast[0].modtime && moment(forecast[0].modtime)
);

export const selectMinimumsAndMaximums = createSelector(
  selectForecast,
  (forecast) => {
    if (forecast.length === 0) return {};
    let totalTempArray = [] as number[];
    let tempArray = [] as number[];
    let precipitationArray = [] as number[];

    forecast.forEach((f) => {
      totalTempArray = totalTempArray.concat([f.temperature, f.feelsLike]);
      tempArray = tempArray.concat(f.temperature);
      precipitationArray = precipitationArray.concat(f.precipitation1h);
    });

    const totalTempMax = Math.max(...totalTempArray);
    const totalTempMin = Math.min(...totalTempArray);
    const tempMax = Math.max(...tempArray);
    const tempMin = Math.min(...tempArray);
    const precipitationMax = Math.max(...precipitationArray);
    const precipitationMin = Math.min(...precipitationArray);

    return {
      totalTempMax,
      totalTempMin,
      tempMax,
      tempMin,
      precipitationMax,
      precipitationMin,
    };
  }
);
