import { Alert, AccessibilityInfo, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, check } from 'react-native-permissions';
import { TFunction } from 'react-i18next';

import { Location } from '@store/location/types';
import {
  TimeStepData as ForTimeStepData,
  TimeStepData,
} from '@store/forecast/types';
import { TimeStepData as ObsTimeStepData } from '@store/observation/types';
import { getCurrentPosition } from '@network/WeatherApi';
import { MomentObjectOutput } from 'moment';
import { Config } from '@config';
import { Rain } from './colors';

export const getGeolocation = (
  callback: (arg0: Location, arg1: boolean) => void,
  t: TFunction<string[] | string>,
  failSilently?: boolean
) => {
  check(
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
  ).then((result) => {
    if (result === 'granted') {
      return Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getCurrentPosition(latitude, longitude)
            .then((json) => {
              const geoid = Number(Object.keys(json)[0]);
              const item = Object.values(json)[0][0];
              const { name, localtz, iso2, country, region } = item;

              AccessibilityInfo.announceForAccessibility(
                `${t('navigation:locatedTo')} ${name}, ${region}`
              );

              callback(
                {
                  lat: latitude,
                  lon: longitude,
                  name,
                  area: iso2 === 'FI' && country === region ? '' : region,
                  id: geoid,
                  timezone: localtz,
                  country: iso2,
                },
                true
              );
            })
            .catch((e) => console.error(e));
        },
        (error) => {
          console.log('GEOLOCATION NOT AVAILABLE', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    }
    if (!failSilently) {
      Alert.alert(
        t('map:noLocationPermission'),
        t('map:noLocationPermissionHint'),
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
    }
    return {};
  });
};

export const getPrecipitationLevel = (amount: number): keyof Rain => {
  if (amount >= 0.1 && amount < 0.15) return 1;
  if (amount >= 0.15 && amount < 0.2) return 2;
  if (amount >= 0.2 && amount < 0.5) return 3;
  if (amount >= 0.5 && amount < 1.0) return 4;
  if (amount >= 1.0 && amount < 2.0) return 5;
  if (amount >= 2.0 && amount < 5.0) return 6;
  if (amount >= 5.0 && amount < 10.0) return 7;
  if (amount >= 10.0) return 8;
  return 0;
};

type DotOrComma = ',' | '.';

export const toStringWithDecimal = (
  input: number | undefined,
  separator: DotOrComma
): string => {
  if (Number.isNaN(input) || input === 0 || !input) return `0${separator}0`;
  if (Number.isInteger(input)) return `${input}${separator}0`;
  return input.toString().replace('.', separator);
};

export const getObservationCellValue = (
  item: ObsTimeStepData,
  param: keyof ObsTimeStepData,
  unit: string,
  decimal?: number,
  divider?: number
): string => {
  const divideWith = divider || 1;
  if (!item || !param) return '-';
  if (item[param] === null || item[param] === undefined) return '-';
  if (item[param] !== null && item[param] !== undefined)
    return `${(Number(item[param]) / divideWith)
      .toFixed(decimal || 0)
      .toString()
      .replace('.', ',')} ${unit}`.trim();
  return '-';
};

export const getParameterUnit = (
  param: keyof (ObsTimeStepData | ForTimeStepData)
): string => {
  switch (param) {
    case 'precipitation1h':
    case 'ri_10min':
      return 'mm';
    case 'humidity':
      return '%';
    case 'temperature':
    case 'dewPoint':
      return '°C';
    case 'windSpeedMS':
    case 'windGust':
      return 'm/s';
    case 'pressure':
      return 'hpa';
    case 'visibility':
      return 'km';
    case 'snowDepth':
      return 'cm';
    case 'windDirection':
      return '°';
    default:
      return '';
  }
};

// https://gist.github.com/johndyer/0dffbdd98c2046f41180c051f378f343
const getEaster = (year: number): [number, number] => {
  const f = Math.floor;
  // Golden Number - 1
  const G = year % 19;
  const C = f(year / 100);
  // related to Epact
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  // number of days from 21 March to the Paschal full moon
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  // weekday for the Paschal full moon
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  // number of days from 21 March to the Sunday on or before the Paschal full moon
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  return [month, day];
};

// midsummer is next Saturday following 19th of June
const getMidSummerDay = (year: number): number => {
  const o = new Date(year, 5, 19);
  const a = 19 - o.getDay() + 6;
  return a === 19 ? a + 7 : a;
};

export const getFeelsLikeIconName = (
  item: ForTimeStepData,
  momentObj: MomentObjectOutput
): string => {
  const shouldUseFinnishHolidays =
    Config.get('location')?.default?.country === 'FI';

  if (shouldUseFinnishHolidays) {
    const { years, months, date } = momentObj; // months are zero index: Jan = 0, Feb = 1 etc.
    const [easterM, easterD] = getEaster(years);
    const midsummerDay = getMidSummerDay(years);
    // holidays
    if (
      months + 1 === 6 &&
      (date === midsummerDay || date - 1 === midsummerDay)
    )
      return 'feels-like-juhannus';
    if (months + 1 === easterM && date === easterD) return 'feels-like-easter';
    if (months + 1 === 12 && date === 6) return 'feels-like-itsenaisyyspaiva';
    if (months + 1 === 3 && date === 8) {
      return 'feels-like-naistenpaiva';
    }
    if (months + 1 === 12 && date === 31) return 'feels-like-newyear';
    if (months + 1 === 12 && (date === 24 || date === 25))
      return 'feels-like-xmas';
    if (months + 1 === 5 && date === 1) return 'feels-like-vappu';
    if (months + 1 === 2 && date === 14) return 'feels-like-valentine';
  }

  // weather
  if (Number(item.windSpeedMS) >= 10) return 'feels-like-windy';
  if (Number(item.temperature) >= 30) return 'feels-like-hot';
  if (Number(item.temperature) <= -10) return 'feels-like-winter';
  if (Number(item.smartSymbol) >= 37 && Number(item.smartSymbol) <= 39)
    return 'feels-like-raining';
  return 'feels-like-basic';
};

export const isOdd = (num: number) => !!(num % 2);

/** Returns the index of 15:00 or nearest */
export const getIndexForDaySmartSymbol = (
  dayArray: TimeStepData[],
  dayIndex: number
): number => {
  if (dayArray.length === 24) {
    return 16;
  }
  const index = dayArray.findIndex((d) => {
    const dateObj = new Date(d.epochtime * 1000);
    const hours = dateObj.getHours();
    return hours === 15;
  });

  if (dayIndex === 0 && index < 0) {
    return 0;
  }
  if (index < 0) {
    return dayArray.length - 1;
  }
  return index;
};
