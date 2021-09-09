import { Alert } from 'react-native';
import moment from 'moment';
import Geolocation from 'react-native-geolocation-service';
import { TFunction } from 'react-i18next';
import Config from 'react-native-config';

import { Location } from '@store/settings/types';

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

const timeSeriesUrl = `https://data.fmi.fi/fmi-apikey/${Config.API_KEY}/timeseries?param=geoid,name,latitude,longitude,region,country&timesteps=2&format=json&attributes=geoid`;

export const getGeolocation = (
  callback: (arg0: Location, arg1: boolean) => void,
  t: TFunction<string[] | string>
) =>
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetch(`${timeSeriesUrl}&latlon=${latitude},${longitude}`)
        .then((res) => res.json())
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
