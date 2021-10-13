import moment from 'moment';
import proj4 from 'proj4';
import { parse } from 'fast-xml-parser';

import { MapOverlay } from '@store/map/types';
import configJSON from '@utils/config.json';

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
export const getRainRadarUrlsAndBounds = async (): Promise<
  MapOverlay | undefined
> => {
  const toReturn = {
    observation: {
      bounds: undefined,
      url: undefined,
      end: undefined,
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
        const [layerStart, layerEnd] = rainRadarLayer.Dimension.text.split('/');
        console.log('LAYER:START-END', layer.type, layerStart, layerEnd);
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
          toReturn.observation.end = layerEnd;
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
