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
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

type BaseTimes = {
  timeStep: number;
  observation?: number;
  forecast?: number;
};

type Times = RequireAtLeastOne<BaseTimes, 'forecast' | 'observation'>;

type Layer = {
  id: number;
  type: string;
  name: { [lang: string]: string };
  times: Times;
};

// 60 minutes = 3600 seconds
const STEP_60 = 3600;
// 30 minutes = 1800 seconds
const STEP_30 = 1800;
// 15 minutes = 900 seconds
const STEP_15 = 900;

export const getSliderMaxUnix = (layerId: number | undefined): number => {
  const now = moment.utc().unix();
  const layer: Layer | undefined = configJSON?.map?.layers.find(
    (l) => l.id === layerId
  );
  if (!layerId || !layer) return now;

  const { times } = layer;

  const stepSeconds = getSliderStepSeconds(times.timeStep);

  const steps = times.forecast || 0;

  return now + steps * stepSeconds;
};

export const getSliderMinUnix = (layerId: number | undefined): number => {
  const now = moment.utc().unix();
  const layer: Layer | undefined = configJSON?.map?.layers.find(
    (l) => l.id === layerId
  );
  if (!layerId || !layer) return now;

  const { times } = layer;

  const stepSeconds = getSliderStepSeconds(times.timeStep);

  const steps = times.observation || 0;

  return now - steps * stepSeconds;
};

export const getSliderStepSeconds = (sliderStep: number): number => {
  if (sliderStep === 60) return STEP_60;
  if (sliderStep === 30) return STEP_30;
  return STEP_15;
};

export const getWMSLayerUrlsAndBounds = async (): Promise<
  Map<number, MapOverlay> | undefined
> => {
  const capabilitiesData = new Map();
  const overlayMap = new Map();

  const sources = configJSON.map?.sources as { [key: string]: string };
  const layers = configJSON.map?.layers.filter((layer) => layer.type === 'WMS');
  const allLayerNames = layers
    .map((layer) => layer.sources.map((lSrc) => lSrc.layer))
    .flat();

  await Promise.all(
    Object.entries(sources).map(async ([src, url]) => {
      const capabilitiesUrl = `${url}&request=GetCapabilities`;

      const textRes = await fetch(capabilitiesUrl).then((res) => res.text());

      const parsedResponse = parse(textRes, {
        attributeNamePrefix: '',
        ignoreAttributes: false,
        ignoreNameSpace: false,
        textNodeName: 'text',
      });

      const {
        WMS_Capabilities: {
          Capability: {
            Layer: { Layer },
          },
        },
      } = parsedResponse;

      const filteredLayers = Layer.filter((L: WmsLayer) =>
        allLayerNames.includes(L.Name)
      );

      capabilitiesData.set(src, filteredLayers);
    })
  );

  layers.forEach((layer) => {
    const toReturn = {} as MapOverlay;

    layer.sources.forEach((layerSrc) => {
      const wmsLayer = capabilitiesData
        .get(layerSrc.source)
        .find((src: WmsLayer) => src.Name === layerSrc.layer);

      const { BoundingBox } = wmsLayer;
      const [layerStart, layerEnd] = Array.isArray(wmsLayer.Dimension)
        ? wmsLayer.Dimension[0].text.split('/')
        : wmsLayer.Dimension.text.split('/');

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

      const url = sources[layerSrc.source];

      const query = new URLSearchParams({
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        transparent: 'true',
        layers: layerSrc.layer,
        bbox,
        width: '727',
        height: '1152',
        format: 'image/png',
        srs: 'EPSG:3857',
        opacity: '60',
      });

      const overlayUrl = `${url}${query.toString()}`;

      if (layerSrc.type === 'observation') {
        Object.assign(toReturn, {
          observation: {
            bounds: overlayBounds,
            url: overlayUrl,
            start: layerStart,
            end: layerEnd,
          },
        });
      }
      if (layerSrc.type === 'forecast') {
        Object.assign(toReturn, {
          forecast: {
            bounds: overlayBounds,
            url: overlayUrl,
            start: layerStart,
            end: layerEnd,
          },
        });
      }
    });

    overlayMap.set(layer.id, toReturn);
  });

  return overlayMap;
};
