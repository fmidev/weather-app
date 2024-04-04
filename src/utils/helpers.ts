import { Alert, AccessibilityInfo, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';
import { TFunction } from 'react-i18next';

import { Location } from '@store/location/types';
import {
  TimeStepData as ForTimeStepData,
  TimeStepData,
} from '@store/forecast/types';
import { TimeStepData as ObsTimeStepData } from '@store/observation/types';
import { getCurrentPosition } from '@network/WeatherApi';
import moment, { MomentObjectOutput } from 'moment';
import { Config } from '@config';
import { CapWarning, Severity } from '@store/warnings/types';
import { Rain } from './colors';
import { converter, toPrecision, UNITS } from './units';

const getPosition = (
  callback: (arg0: Location, arg1: boolean) => void,
  t: TFunction<string[] | string>
) =>
  Geolocation.getCurrentPosition(
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

const alertNoPermission = (t: TFunction<string[] | string>) =>
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
    if (result === RESULTS.GRANTED) {
      return getPosition(callback, t);
    }
    if (!failSilently && result === RESULTS.DENIED) {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      request(permission)
        .then((res) => {
          if (res === RESULTS.GRANTED) {
            getPosition(callback, t);
          }
          if (res === RESULTS.BLOCKED) {
            alertNoPermission(t);
          }
        })
        .catch((e) => console.error(e));
    }
    if (!failSilently && result === RESULTS.BLOCKED) {
      alertNoPermission(t);
    }
    return {};
  });
};

export const getPrecipitationLevel = (amount: number): keyof Rain => {
  if (amount >= 0.1 && amount < 0.15) return 1;
  if (amount >= 0.15 && amount < 0.3) return 2;
  if (amount >= 0.3 && amount < 0.5) return 3;
  if (amount >= 0.5 && amount < 1.0) return 4;
  if (amount >= 1.0 && amount < 2.0) return 5;
  if (amount >= 2.0 && amount < 5.0) return 6;
  if (amount >= 5.0 && amount < 10.0) return 7;
  if (amount >= 10.0) return 8;
  return 0;
};

export const getWindDirection = (dataValue: number | undefined): number => {
  const useCardinals = Config.get('weather').useCardinalsForWindDirection;
  let direction = 0;
  if (useCardinals) {
    const tempDir = dataValue || 0;
    if ((tempDir >= 338 && tempDir <= 360) || (tempDir >= 0 && tempDir <= 22)) {
      direction = 0; // N
    } else if (tempDir >= 23 && tempDir <= 67) {
      direction = 45; // NE
    } else if (tempDir >= 68 && tempDir <= 112) {
      direction = 90; // E
    } else if (tempDir >= 113 && tempDir <= 157) {
      direction = 135; // SE
    } else if (tempDir >= 158 && tempDir <= 202) {
      direction = 180; // S
    } else if (tempDir >= 203 && tempDir <= 247) {
      direction = 225; // SW
    } else if (tempDir >= 248 && tempDir <= 292) {
      direction = 270; // W
    } else if (tempDir >= 293 && tempDir <= 337) {
      direction = 315; // NW
    }
    // for some reason icon is pointing NW instead of N => +45
    // wind value needs 180 degree switch to show correctly where wind is coming from
    direction = direction + 45 - 180;
  } else {
    direction = (dataValue || 0) + 45 - 180;
  }
  return direction;
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

const minusParams = [
  'temperature',
  'dewPoint',
  'minimumTemperature',
  'maximumTemperature',
  'minimumGroundTemperature06',
];

export const convertValueToUnitPrecision = (
  unit: string,
  unitAbb: string,
  val: number | undefined | null,
  decimals?: number
) => {
  const result =
    val || val === 0
      ? toPrecision(unit, unitAbb, converter(unitAbb, val), decimals)
      : null;
  return result;
};

export const getObservationCellValue = (
  item: ObsTimeStepData,
  param: keyof ObsTimeStepData,
  unit: string,
  decimals?: number,
  divider?: number,
  showUnit?: boolean,
  decimalSeparator: ',' | '.' = ','
): string => {
  const unitAbb = unit.replace('°', ''); // get rid of ° in temperature units
  const unitParameterObject = UNITS.find((x) =>
    x.unitTypes.find((unitDefinition) => unitDefinition.unitAbb === unitAbb)
  );

  const divideWith = divider || 1;
  if (!item || !param) return '-';
  if (item[param] === null || item[param] === undefined) return '-';
  if (!minusParams.includes(param) && Number(item[param]) < 0) return '-';
  if (item[param] !== null && item[param] !== undefined) {
    const dividedValue = Number(item[param]) / divideWith;
    const value = unitParameterObject
      ? convertValueToUnitPrecision(
          unitParameterObject.parameterName,
          unitAbb,
          Number(dividedValue),
          decimals
        )
      : dividedValue;
    if (!value) return '-';

    return `${(unitParameterObject
      ? value
      : Number(value).toFixed(decimals || 0)
    )
      .toString()
      .replace('.', decimalSeparator)} ${showUnit ? unit : ''}`.trim();
  }
  return '-';
};

export const getParameterUnit = (
  param: keyof (ObsTimeStepData | ForTimeStepData)
): string => {
  const { wind, temperature, precipitation, pressure } =
    Config.get('settings').units;
  switch (param) {
    case 'precipitation1h':
    case 'ri_10min':
      return precipitation;
    case 'humidity':
      return '%';
    case 'temperature':
    case 'dewPoint':
      return `°${temperature}`;
    case 'windSpeedMS':
    case 'windGust':
      return wind;
    case 'pressure':
      return pressure;
    case 'visibility':
      return 'km';
    case 'snowDepth':
      return 'cm';
    case 'windDirection':
      return '°';
    case 'cloudHeight':
      return 'km';
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
    return 14; // choose 14:00 (2.00 PM) local time as the default time
  }
  if (dayArray.length >= 10) {
    return 14 - (24 - dayArray.length); // choose index of 14:00 if available from a list with fewer than 24 hourly forecasts
  }
  const index = dayArray.findIndex((d) => {
    const dateObj = new Date(d.epochtime * 1000);
    const hours = dateObj.getHours();
    return hours === 14;
  });

  if (dayIndex === 0 && index < 0) {
    return 0;
  }
  if (index < 0) {
    return dayArray.length - 1;
  }
  return index;
};

const severities: Severity[] = ['Moderate', 'Severe', 'Extreme'];

const getSeveritiesForTimePeriod = (
  warnings: CapWarning[],
  start: moment.Moment,
  end: moment.Moment
) => {
  const severitiesForTimePeriod = warnings
    ?.filter((warning) => {
      const effective = moment(warning.info.effective);
      const expires = moment(warning.info.expires);
      const beginsDuringPeriod = effective.isBetween(start, end);
      const endsDuringPeriod = expires.isBetween(start, end);
      const periodContained = effective.isBefore(start) && expires.isAfter(end);
      return beginsDuringPeriod || endsDuringPeriod || periodContained;
    })
    .map((warning) => severities.indexOf(warning.info.severity) + 1);

  const maxSeverity = Math.max(...(severitiesForTimePeriod ?? [0]));
  return maxSeverity;
};
export const getSeveritiesForDays = (
  warnings: CapWarning[] | undefined,
  dates: number[]
) => {
  if (!warnings) return [];

  const dailySeverities: number[][] = [];
  dates.forEach((date) => {
    const daySeverities: number[] = [];

    const startMomentObject = moment(date);
    startMomentObject.hour(0).minute(0);
    const endMomentObject = startMomentObject.clone().add(6, 'hours');
    daySeverities.push(
      Math.max(
        0,
        getSeveritiesForTimePeriod(warnings, startMomentObject, endMomentObject)
      )
    );

    startMomentObject.add(6, 'hours');
    endMomentObject.add(6, 'hours');
    daySeverities.push(
      Math.max(
        0,
        getSeveritiesForTimePeriod(warnings, startMomentObject, endMomentObject)
      )
    );

    startMomentObject.add(6, 'hours');
    endMomentObject.add(6, 'hours');

    daySeverities.push(
      Math.max(
        0,
        getSeveritiesForTimePeriod(warnings, startMomentObject, endMomentObject)
      )
    );

    startMomentObject.add(6, 'hours');
    endMomentObject.add(6, 'hours');

    daySeverities.push(
      Math.max(
        0,
        getSeveritiesForTimePeriod(warnings, startMomentObject, endMomentObject)
      )
    );

    dailySeverities.push(daySeverities);
  });
  return dailySeverities;
};
