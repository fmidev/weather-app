import moment from 'moment';
import proj4 from 'proj4';
import { parse } from 'fast-xml-parser';

import { MapOverlay } from '@store/map/types';

import { Config } from '@config';

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

// 60 minutes = 3600 seconds
const STEP_60 = 3600;
// 30 minutes = 1800 seconds
const STEP_30 = 1800;
// 15 minutes = 900 seconds
const STEP_15 = 900;

const round = (unix: number, step: number): number =>
  Math.floor(unix / step) * step;
export const getSliderMinUnix = (
  layerId: number | undefined,
  overlay: MapOverlay | undefined
): number => {
  const reference = moment.utc().unix();
  if (!overlay || !overlay.observation) return reference;
  const { observation } = overlay;
  const observationStart = moment(observation?.start).unix();

  const { layers } = Config.get('map');
  const layer = layers.find((l) => l.id === layerId);
  if (!layerId || !layer) return reference;

  const { times } = layer;
  if (!times.observation) return reference;

  const stepSeconds = getSliderStepSeconds(times.timeStep);

  const steps = times.observation;
  const min = reference - steps * stepSeconds;

  return min < observationStart ? observationStart : round(min, stepSeconds);
};

export const getSliderMaxUnix = (
  layerId: number | undefined,
  overlay: MapOverlay | undefined
): number => {
  let reference = moment.utc().unix();
  if (!overlay) return reference;
  const { observation, forecast } = overlay;
  const observationEnd = moment(observation?.end).unix();
  const forecastEnd = moment(forecast?.end).unix();
  console.log(observation?.end);
  if (observationEnd < reference) {
    console.log('observationEnd < reference');
    reference = observationEnd;
  }
  const { layers } = Config.get('map');
  const layer = layers.find((l) => l.id === layerId);
  if (!layerId || !layer) return reference;
  const { times } = layer;
  if (!times.forecast) return reference;

  const stepSeconds = getSliderStepSeconds(times.timeStep);
  const steps = times.forecast;
  const max = reference + steps * stepSeconds;
  return max > forecastEnd ? forecastEnd : round(max, stepSeconds);
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

  const { sources, layers } = Config.get('map');

  const wmsLayers = layers.filter((layer) => layer.type === 'WMS');
  const allLayerNames = wmsLayers
    .map((layer) => layer.sources.map((lSrc) => lSrc.layer))
    .flat();

  await Promise.all(
    Object.entries(sources).map(async ([src, url]) => {
      const capabilitiesUrl = `${url}/wms?service=WMS&request=GetCapabilities`;

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
        crs: 'EPSG:3857',
        styles: '',
      });

      const overlayUrl = `${url}/wms?${query.toString()}`;

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
