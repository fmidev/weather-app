import { Selector, createSelector } from 'reselect';
import moment from 'moment';
import 'moment/locale/fi';

import { selectGeoid } from '@store/location/selector';
import { Config } from '@config';
import { getIndexForDaySmartSymbol } from '@utils/helpers';
import { State } from '../types';
import { DisplayParameters, ForecastState, TimeStepData } from './types';
import constants, { DAY_LENGTH } from './constants';

const selectForecastDomain: Selector<State, ForecastState> = (state) =>
  state.forecast;

// To refresh forecast every hour
const selectHour: Selector<State> = () => new Date().getHours();

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

const selectAuroraBorealisData = createSelector(
  selectForecastDomain,
  (forecast) => forecast.auroraBorealisData
);

export const selectForecastAge = createSelector(
  selectForecastDomain,
  (forecast) => Date.now() - forecast.fetchSuccessTime
);

export const selectForecast = createSelector(
  [selectData, selectGeoid, selectHour],
  (items, geoid) => {
    const now = new Date();
    if (items) {
      const locationItems = items[!isNaN(geoid) ? geoid : 0];
      // Add modtime handling

      // filter out outdated items
      const filtered = locationItems?.filter(
        (i) => i.epochtime * 1000 > now.getTime()
      );

      return filtered || [];
    }
    return [];
  }
);

export const selectIsAuroraBorealisLikely = createSelector(
  [selectAuroraBorealisData, selectGeoid],
  (items, geoid) => {
    return items?.[geoid] || false
  }
);

export const selectNextHourForecast = createSelector(
  selectForecast,
  (forecast) => forecast && forecast[0]
);

export const selectNextHoursForecast = createSelector(
  selectForecast,
  (forecast) => forecast && forecast.slice(0, 12)
);

export const selectForecastInvalidData = createSelector(
  selectForecast,
  (forecast) =>
    forecast &&
    forecast.length > 0 &&
    forecast.every((timeStep) => timeStep.temperature === null)
);

export const selectForecastByDay = createSelector(
  [selectForecast],
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

export const selectIsWaningMoonPhase = createSelector(
  [selectForecast],
  (forecast) =>
    forecast &&
    forecast[23]?.moonPhase !== undefined &&
    forecast[0]?.moonPhase !== undefined &&
    forecast[23].moonPhase < forecast[0].moonPhase
)

export const selectHeaderLevelForecast = createSelector(
  selectForecastByDay,
  (forecastByDay) =>
    forecastByDay &&
    Object.keys(forecastByDay).map((key: string) => {
      const dayArr = forecastByDay[key];
      const tempArray = dayArr.map((h) => h.temperature || 0);
      const windArray = dayArr.map((h) => h.windSpeedMS || 0);

      // get forecasted min and max temps for current day
      const maxTemperature = Math.max(...tempArray);
      const minTemperature = Math.min(...tempArray);
      const maxWindSpeed = Math.max(...windArray);
      const minWindSpeed = Math.min(...windArray);

      // calculate total precipitation
      const sumPrecipitation = dayArr
        .map((h) => h.precipitation1h || 0)
        .reduce((acc, curr) => acc + curr, 0);

      const precipitationMissing = dayArr.every(item => item.precipitation1h === null);

      const roundedTotalPrecipitation =
        Math.round((sumPrecipitation + Number.EPSILON) * 100) / 100;
      const index = getIndexForDaySmartSymbol(dayArr);

      const { smartSymbol } = dayArr[index];
      const timeStamp = dayArr[0].epochtime;
      const precipitationArr = dayArr.map((h) => ({
        precipitation: h.precipitation1h,
        timestamp: h.epochtime,
      }));

      return {
        maxTemperature,
        minTemperature,
        maxWindSpeed,
        minWindSpeed,
        totalPrecipitation: roundedTotalPrecipitation,
        precipitationMissing,
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
    moment(`${forecast[0].modtime}Z`)
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
      [...data.flatMap(({ parameters }) => parameters), DAY_LENGTH].join('|')
    );
    return (
      forecast.displayParams.length > 0
        ? forecast.displayParams
        : (defaultParameters.map((parameter) => [
            constants.indexOf(String(parameter)),
            parameter,
          ]) as [number, DisplayParameters][])
    )
      .sort((a, b) => a[0] - b[0])
      .filter(([, param]) => regex.test(String(param)));
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
