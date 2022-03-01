import { Selector, createSelector } from 'reselect';
import moment from 'moment';
import 'moment/locale/fi';

import { selectGeoid } from '@store/location/selector';
import { Config } from '@config';
import { getIndexForDaySmartSymbol } from '@utils/helpers';
import { State } from '../types';
import { ForecastState, TimeStepData } from './types';

const selectForecastDomain: Selector<State, ForecastState> = (state) =>
  state.forecast;

export const selectLoading = createSelector(
  selectForecastDomain,
  (forecast) => forecast.loading
);

export const selectError = createSelector(
  selectForecastDomain,
  (forecast) => forecast.error
);

const selectData = createSelector(
  selectForecastDomain,
  (forecast) => forecast.data
);

const selectFetchTimestamp = createSelector(
  selectForecastDomain,
  (forecast) => forecast.fetchTimestamp
);

export const selectForecast = createSelector(
  [selectData, selectGeoid, selectFetchTimestamp],
  (items, geoid, timestamp) => {
    if (items) {
      const locationItems = items[geoid];
      // filter out outdated items
      const filtered = locationItems?.filter(
        (i) => i.epochtime * 1000 > timestamp
      );

      return filtered || [];
    }
    return [];
  }
);

export const selectNextHourForecast = createSelector(
  selectForecast,
  (forecast) => forecast && forecast[0]
);

export const selectForecastByDay = createSelector(
  selectForecast,
  (forecast) =>
    forecast &&
    forecast.length > 0 &&
    forecast.reduce(
      (
        acc: { [key: string]: any },
        curr: TimeStepData
      ): {
        [key: string]: TimeStepData[];
      } => {
        const day = moment.unix(curr.epochtime).format('D.M.');
        if (acc[day]) {
          return { ...acc, [day]: acc[day].concat(curr) };
        }
        return { ...acc, [day]: [curr] };
      },
      {}
    )
);

export const selectHeaderLevelForecast = createSelector(
  selectForecastByDay,
  (forecastByDay) =>
    forecastByDay &&
    Object.keys(forecastByDay).map((key: string, dayIndex: number) => {
      const dayArr = forecastByDay[key];
      const tempArray = dayArr.map((h) => h.temperature || 0);
      // get forecasted min and max temps for current day
      const maxTemperature = Math.max(...tempArray);
      const minTemperature = Math.min(...tempArray);
      // calculate total precipitation
      const sumPrecipitation = dayArr
        .map((h) => h.precipitation1h || 0)
        .reduce((acc, curr) => acc + curr, 0);

      const roundedTotalPrecipitation =
        Math.round((sumPrecipitation + Number.EPSILON) * 100) / 100;
      const index = getIndexForDaySmartSymbol(dayArr, dayIndex);

      const { smartSymbol } = dayArr[index];
      const timeStamp = dayArr[0].epochtime;
      const precipitationArr = dayArr.map((h) => ({
        precipitation: h.precipitation1h,
        timestamp: h.epochtime,
      }));

      return {
        maxTemperature,
        minTemperature,
        totalPrecipitation: roundedTotalPrecipitation,
        timeStamp,
        smartSymbol,
        precipitationData: precipitationArr,
      };
    })
);

export const selectForecastLastUpdatedMoment = createSelector(
  selectForecast,
  (forecast) =>
    forecast &&
    forecast.length > 0 &&
    // forecast[0] &&
    forecast[0].modtime &&
    moment(forecast[0].modtime)
);

export const selectMinimumsAndMaximums = createSelector(
  selectForecast,
  (forecast) => {
    if (forecast.length === 0) return {};
    let totalTempArray = [] as number[];
    let tempArray = [] as number[];
    let precipitationArray = [] as number[];

    forecast.forEach((f) => {
      totalTempArray = totalTempArray.concat([
        f.temperature || 0,
        f.feelsLike || 0,
      ]);
      tempArray = tempArray.concat(f.temperature || 0);
      precipitationArray = precipitationArray.concat(f.precipitation1h || 0);
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
export const selectDisplayParams = createSelector(
  selectForecastDomain,
  (forecast) => {
    const { data, defaultParameters } = Config.get('weather').forecast;
    const regex = new RegExp(
      data.flatMap(({ parameters }) => parameters).join('|')
    );

    return (
      forecast.displayParams.length > 0
        ? forecast.displayParams
        : (
            defaultParameters.map((parameter, index) => [index, parameter]) as [
              number,
              string
            ][]
          ).sort((a, b) => a[0] - b[0])
    ).filter(([, param]) => regex.test(param));
  }
);

export const selectUniqueSmartSymbols = createSelector(
  selectForecast,
  (forecast) => [...new Set(forecast.map((f) => f.smartSymbol))]
);

export const selectDisplayFormat = createSelector(
  selectForecastDomain,
  (forecast) => forecast.displayFormat
);

export const selectChartDisplayParameter = createSelector(
  selectForecastDomain,
  (forecast) => forecast.chartDisplayParam
);
