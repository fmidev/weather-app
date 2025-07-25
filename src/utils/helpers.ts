import { Alert, AccessibilityInfo, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  PERMISSIONS,
  checkMultiple,
  request,
  RESULTS,
} from 'react-native-permissions';
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
import { CapInfo, CapWarning, Severity } from '@store/warnings/types';
import { Rain } from '../assets/colors';
import { converter, toPrecision, UNITS } from './units';
import { UnitMap } from '@store/settings/types';

const getPosition = (
  callback: (arg0: Location, arg1: boolean) => void,
  t: TFunction<string[] | string>
) =>
  Geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude } = position.coords;
      latitude = roundCoordinates(latitude);
      longitude = roundCoordinates(longitude);

      getCurrentPosition(latitude, longitude)
        .then((json) => {
          const geoid = Number(Object.keys(json)[0]);
          const item = Object.values(json)[0][0];
          const { name, localtz, iso2, country, region } = item;

          AccessibilityInfo.announceForAccessibility(
            geoid
              ? `${t('navigation:locatedTo')} ${name}, ${region}`
              : `${t('navigation:locatedTo')} ${name}`
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
      enableHighAccuracy: Platform.OS === 'ios', // iOS only
      timeout: 15000,
      maximumAge: 60000,
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

export const getGeolocation = async (
  callback: (arg0: Location, arg1: boolean) => void,
  t: TFunction<string[] | string>,
  failSilently?: boolean
) => {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: true, // Let react-native-permissions handle this
    enableBackgroundLocationUpdates: false,
    locationProvider: 'playServices',
  });

  const permissions =
    Platform.OS === 'ios'
      ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
      : [
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ];
  const results = await checkMultiple(permissions);
  const values = Object.values(results);

  if (values.some((value) => value === RESULTS.GRANTED)) {
    return getPosition(callback, t);
  }
  if (!failSilently && values.every((value) => value === RESULTS.DENIED)) {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION; // User can choose also ACCESS_COARSE_LOCATION
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
  if (!failSilently && values.every((value) => value === RESULTS.BLOCKED)) {
    alertNoPermission(t);
  }
  return {};
};

export const getPrecipitationLevel = (
  amount: number,
  unit = 'mm'
): keyof Rain => {
  if (amount >= converter(unit, 0.1) && amount < converter(unit, 0.15))
    return 1;
  if (amount >= converter(unit, 0.15) && amount < converter(unit, 0.3))
    return 2;
  if (amount >= converter(unit, 0.3) && amount < converter(unit, 0.5)) return 3;
  if (amount >= converter(unit, 0.5) && amount < converter(unit, 1.0)) return 4;
  if (amount >= converter(unit, 1.0) && amount < converter(unit, 2.0)) return 5;
  if (amount >= converter(unit, 2.0) && amount < converter(unit, 5.0)) return 6;
  if (amount >= converter(unit, 5.0) && amount < converter(unit, 10.0))
    return 7;
  if (amount >= converter(unit, 10.0)) return 8;

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
  decimalSeparator: ',' | '.' = ',',
  t?: (key: string) => string,
): string => {
  const unitAbb = unit.replace('°', ''); // get rid of ° in temperature units
  const unitParameterObject = UNITS.find((x) =>
    x.unitTypes.find((unitDefinition) => unitDefinition.unitAbb === unitAbb)
  );
  const translatedUnit = t ? t(unitAbb) : unitAbb;

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
      : converter(unit, dividedValue);
    if (value === null) return '-';

    return `${(unitParameterObject
      ? value
      : Number(value).toFixed(decimals || 0)
    )
      .toString()
      .replace('.', decimalSeparator)} ${showUnit ? translatedUnit : ''}`.trim();
  }
  return '-';
};

export const getLatestObservationAvoidingMissingValues = (
  data: ObsTimeStepData[]
): ObsTimeStepData | undefined => {
  const TEN_MINUTES = 10 * 60;
  if (data.length === 0) return undefined;

  let latest = data[0];

  for (const parameter of Object.keys(latest) as (keyof ObsTimeStepData)[]) {
    if (latest[parameter] === null) {
      const timeStepWithValue = data.find(
        (item) =>
          item[parameter] !== null &&
          latest.epochtime - item.epochtime < TEN_MINUTES
      );
      if (timeStepWithValue) {
        // @ts-ignore
        latest[parameter] = timeStepWithValue[parameter];
      }
    }
  }

  return latest;
};

export const getParameterUnit = (
  param: keyof (ObsTimeStepData | ForTimeStepData),
  units?: UnitMap,
  t?: (key: string) => string
): string => {
  const { wind, temperature, precipitation, pressure } =
    Config.get('settings').units;
  switch (param) {
    case 'precipitation1h':
    case 'ri_10min':
      return t ? t(units?.precipitation.unitAbb ?? precipitation) : units?.precipitation.unitAbb ?? precipitation;
    case 'humidity':
      return '%';
    case 'temperature':
    case 'dewPoint':
      return t ? `°${ t(units?.temperature.unitAbb ?? temperature) }` : `°${ units?.temperature.unitAbb ?? temperature}`;
    case 'windSpeedMS':
    case 'windGust':
      return t ? t(units?.wind.unitAbb ?? wind) : units?.wind.unitAbb ?? wind;
    case 'pressure':
      return t ? t(units?.pressure.unitAbb ?? pressure) : units?.pressure.unitAbb ?? pressure;
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

export const formatAccessibleTemperature = (
  val: string | number | undefined | null,
  t: (key: string) => string): string  => {
  if (val === null || val === undefined || val === '') return '-';

  const num = Number(val);
  if (isNaN(num)) return '-';

  const valuePart =
    num < 0 ? `${t('forecast:minus')} ${Math.abs(num)}` : `${num}`;
  return `${valuePart}`;
}

// https://gist.github.com/johndyer/0dffbdd98c2046f41180c051f378f343
const getEaster = (year: number): Date => {
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

  return new Date(year, month - 1, day);
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
    const now = new Date();
    const easterSunday = getEaster(years);
    const goodFriday = new Date(
      easterSunday.getTime() - 2 * 24 * 60 * 60 * 1000
    );
    const tuesdayAfterEaster = new Date(
      easterSunday.getTime() + 2 * 24 * 60 * 60 * 1000
    );
    const midsummerDay = getMidSummerDay(years);
    // holidays
    if (
      months + 1 === 6 &&
      (date === midsummerDay || date - 1 === midsummerDay)
    )
      return 'feels-like-juhannus';
    if (now >= goodFriday && now < tuesdayAfterEaster)
      return 'feels-like-easter';
    if (months + 1 === 12 && date === 6) return 'feels-like-itsenaisyyspaiva';
    if (months + 1 === 3 && date === 8) {
      return 'feels-like-naistenpaiva';
    }
    if (months + 1 === 12 && date === 31) return 'feels-like-newyear';
    if (months + 1 === 12 && date >= 24 && date <= 26) return 'feels-like-xmas';
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
export const getIndexForDaySmartSymbol = (dayArray: TimeStepData[]): number => {
  const index = dayArray.findIndex(
    (item) => item.localtime.substring(9, 11) === '15'
  );

  if (index > -1) return index;

  const firstHour = parseInt(dayArray[0].localtime.substring(9, 11), 10);
  return firstHour < 15 ? dayArray.length - 1 : 0;
};

const severities: Severity[] = ['Moderate', 'Severe', 'Extreme'];

const getSeveritiesForTimePeriod = (
  warnings: CapWarning[],
  start: moment.Moment,
  end: moment.Moment
) => {
  const severitiesForTimePeriod = warnings
    ?.filter((warning) => {
      const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
      const effective = moment(info.effective);
      const expires = moment(info.expires);
      const beginsDuringPeriod = effective.isBetween(start, end);
      const endsDuringPeriod = expires.isBetween(start, end);
      const periodContained = effective.isBefore(start) && expires.isAfter(end);
      return beginsDuringPeriod || endsDuringPeriod || periodContained;
    })
    .map((warning) => {
      const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;
      return severities.indexOf(info.severity) + 1
    });

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

// Rounds coordinates to maximum 4 decimal places
export const roundCoordinates = (value: number): number => {
  const stringValue = value.toString();
  const items = stringValue.split('.');

  // Return original value if maximum 4 decimal places
  if (items.length === 2 && items[1].length <= 4) return value;

  return +(Math.round(parseFloat(value + 'e+4')) + 'e-4');
};

export const uppercaseFirst = (str: string) => str ? str[0].toUpperCase() + str.slice(1) : '';

export const selectCapInfoByLanguage = (infos: Array<CapInfo>, language: string):CapInfo => {
  const info = infos.find((item) => {
    const [l] = item.language.split('-');
    return l === language;
  });

  if (info) {
    return info
  }
  return infos[0];
}
