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

type TimesMap = {
  [key: string]: { observation: number; forecast: number } | undefined;
};

// 60 minutes = 3600 seconds
const STEP_60 = 3600;
// 30 minutes = 1800 seconds
const STEP_30 = 1800;
// 15 minutes = 900 seconds
const STEP_15 = 900;

export const getSliderMaxUnix = (sliderStep: number): number => {
  const now = moment.utc().unix();
  const times = configJSON?.map?.times as TimesMap;
  const forecastSteps = times[sliderStep.toString()]?.forecast || 5;

  if (sliderStep === 60) {
    return now + forecastSteps * STEP_60;
  }
  if (sliderStep === 30) {
    return now + forecastSteps * STEP_30;
  }
  return now + forecastSteps * STEP_15;
};

export const getSliderMinUnix = (sliderStep: number): number => {
  const now = moment.utc().unix();
  const times = configJSON?.map?.times as TimesMap;
  const observationSteps = times[sliderStep.toString()]?.observation || 5;

  if (sliderStep === 60) {
    return now - observationSteps * STEP_60;
  }
  if (sliderStep === 30) {
    return now - observationSteps * STEP_30;
  }
  return now - observationSteps * STEP_15;
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

type BoundingBox = {
  CRS?: string;
  minx: string;
  miny: string;
  maxx: string;
  maxy: string;
};

type WmsLayer = {
  Name: string;
  Title: string;
  Abstract: string;
  CRS: string[];
  BoundingBox: BoundingBox[];
  Dimension: {
    text: string;
    name: string;
    default: string;
    units: string;
  };
};

export const getRainRadarUrlsAndBounds = async (): Promise<
  MapOverlay | undefined
> => {
  const toReturn = {
    observation: {
      bounds: undefined,
      url: undefined,
    },
    forecast: {
      bounds: undefined,
      url: undefined,
      start: undefined,
    },
  } as MapOverlay;

  const sources = configJSON.map?.sources as { [key: string]: string };
  const layers = configJSON.map?.layers?.find((layer) => layer.type === 'rain')
    ?.sources as {
    source: string;
    layer: string;
    type: string;
  }[];

  const rainRadarSources = Object.entries(sources)
    .map(([key, value]) => layers.some((l) => l.source === key) && value)
    .filter((x) => !!x);

  await Promise.all(
    rainRadarSources.map(async (url) => {
      const capabilitiesUrl = `${url}&request=GetCapabilities`;
      const textRes = await fetch(capabilitiesUrl).then((res) => res.text());

      const obj = parse(textRes, {
        attributeNamePrefix: '',
        ignoreAttributes: false,
        ignoreNameSpace: false,
        textNodeName: 'text',
      });

      // layers array is nested in the response as Layer
      const {
        WMS_Capabilities: {
          Capability: {
            Layer: { Layer },
          },
        },
      } = obj;

      layers.forEach((layer) => {
        const rainRadarLayer = Layer.find(
          (l: WmsLayer) => l.Name === layer.layer
        );

        const { BoundingBox } = rainRadarLayer;
        const [layerStart] = rainRadarLayer.Dimension.text.split('/');

        const boundingBox84 = BoundingBox.find(
          (box: BoundingBox) => box.CRS === 'CRS:84'
        );
        const { minx, miny, maxx, maxy } = boundingBox84;
        const [numMinX, numMinY, numMaxX, numMaxY] = [
          Number(minx),
          Number(miny),
          Number(maxx),
          Number(maxy),
        ];
        const [minX, minY] = proj4('WGS84', 'EPSG:3857', [numMinX, numMinY]);
        const [maxX, maxY] = proj4('WGS84', 'EPSG:3857', [numMaxX, numMaxY]);

        const bbox = `${minX},${minY},${maxX},${maxY}`;

        const overlayBounds = {
          bottomLeft: [numMinY, numMinX],
          bottomRight: [numMinY, numMaxX],
          topLeft: [numMaxY, numMinX],
          topRight: [numMaxY, numMaxX],
        } as { [key: string]: [number, number] };

        const query = new URLSearchParams({
          service: 'WMS',
          version: '1.3.0',
          request: 'GetMap',
          transparent: 'true',
          layers: layer.layer,
          bbox,
          width: '727',
          height: '1152',
          format: 'image/png',
          srs: 'EPSG:3857',
        });

        const overlayUrl = `${url}${query.toString()}`;

        if (layer.type === 'observation') {
          toReturn.observation.bounds = overlayBounds;
          toReturn.observation.url = overlayUrl;
        }
        if (layer.type === 'forecast') {
          toReturn.forecast.bounds = overlayBounds;
          toReturn.forecast.url = overlayUrl;
          toReturn.forecast.start = layerStart;
        }
      });
    })
  );

  return toReturn;
};
