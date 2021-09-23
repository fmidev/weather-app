import { Selector, createSelector } from 'reselect';
import moment from 'moment';
import 'moment/locale/fi';

import { selectGeoid } from '@store/location/selector';
import { State } from '../types';
import { ForecastState, Error, WeatherData, TimestepData } from './types';

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
      const dayMax = Math.max(...dayArr.map((h) => h.temperature));
      const dayMin = Math.min(...dayArr.map((h) => h.temperature));
      const sumPrecipitation = dayArr
        .map((h) => h.precipitation1h)
        .reduce((acc, curr) => acc + curr, 0);

      const totalPrecipitation =
        Math.round((sumPrecipitation + Number.EPSILON) * 100) / 100;

      if (dayArr.length >= 16) {
        return { ...dayArr[15], dayMax, dayMin, totalPrecipitation };
      }
      return index === 0
        ? { ...dayArr[0], dayMax, dayMin, totalPrecipitation }
        : { ...dayArr[dayArr.length - 1], dayMax, dayMin, totalPrecipitation };
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
