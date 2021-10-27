import { Alert } from 'react-native';
import moment from 'moment';
import Geolocation from 'react-native-geolocation-service';
import { TFunction } from 'react-i18next';

import { Location } from '@store/location/types';
import { getCurrentPosition } from '@network/WeatherApi';
import {
  RAIN_1,
  RAIN_2,
  RAIN_3,
  RAIN_4,
  RAIN_5,
  RAIN_6,
  RAIN_7,
  TRANSPARENT,
} from './colors';

// 60 minutes = 3600 seconds
const STEP_60 = 3600;
// 30 minutes = 1800 seconds
const STEP_30 = 1800;
// 15 minutes = 900 seconds
const STEP_15 = 900;

export const getSliderMaxUnix = (sliderStep: number): number => {
  const now = moment.utc().unix();

  if (sliderStep === 60) {
    return now + 5 * STEP_60;
  }
  if (sliderStep === 30) {
    return now + 5 * STEP_30;
  }
  return now + 5 * STEP_15;
};

export const getSliderMinUnix = (sliderStep: number): number => {
  const now = moment.utc().unix();

  if (sliderStep === 60) {
    return now - 5 * STEP_60;
  }
  if (sliderStep === 30) {
    return now - 5 * STEP_30;
  }
  return now - 18 * STEP_15;
};

export const getSliderStepSeconds = (sliderStep: number): number => {
  if (sliderStep === 60) return STEP_60;
  if (sliderStep === 30) return STEP_30;
  return STEP_15;
};

export const getGeolocation = (
  callback: (arg0: Location, arg1: boolean) => void,
  t: TFunction<string[] | string>
) =>
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getCurrentPosition(latitude, longitude)
        .then((json) => {
          const geoid = Number(Object.keys(json)[0]);
          const vals: {
            name: string;
            latitude: number;
            longitude: number;
            region: string;
          }[][] = Object.values(json);

          const { name, region } = vals[0][0];
          callback(
            {
              lat: latitude,
              lon: longitude,
              name,
              area: region,
              id: geoid,
            },
            true
          );
        })
        .catch((e) => console.error(e));
    },
    (error) => {
      console.log('GEOLOCATION NOT AVAILABLE', error);
      if (error.code === 1) {
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
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }
  );

export const getPrecipitationColorOrTransparent = (amount: number): string => {
  if (amount >= 0.1 && amount < 0.2) return RAIN_1;
  if (amount >= 0.2 && amount < 0.5) return RAIN_2;
  if (amount >= 0.5 && amount < 1) return RAIN_3;
  if (amount >= 1 && amount < 2) return RAIN_4;
  if (amount >= 2 && amount < 5) return RAIN_5;
  if (amount >= 5 && amount < 10) return RAIN_6;
  if (amount >= 10) return RAIN_7;
  return TRANSPARENT;
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
