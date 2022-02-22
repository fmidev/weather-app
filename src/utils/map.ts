import moment from 'moment';
import proj4 from 'proj4';
import { parse } from 'fast-xml-parser';

import { MapOverlay } from '@store/map/types';
import { Config, MapLayer, TimeseriesSource, WMSSource } from '@config';

import axiosClient from './axiosClient';

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
  Dimension:
    | {
        text: string;
        name: string;
        default: string;
        units: string;
      }
    | {
        text: string;
        name: string;
        default: string;
        units: string;
      }[];
};

const round = (unix: number, step: number): number =>
  Math.floor(unix / step) * step;

export const getSliderMinUnix = (
  layerId: number | undefined,
  overlay: MapOverlay | undefined
): number => {
  let reference = moment.utc().unix();
  const { layers } = Config.get('map');
  const layer = layers.find((l) => l.id === layerId);
  if (!layerId || !layer) return reference;
  const { times } = layer;
  const stepSeconds = getSliderStepSeconds(times.timeStep);

  reference = Math.ceil(reference / stepSeconds) * stepSeconds;

  if (!overlay || !overlay.observation) return reference;
  const { observation } = overlay;
  const observationStart = moment(observation?.start).unix();
  const observationEnd = moment(observation?.end).unix();

  if (observationEnd < reference) {
    reference = Math.ceil(observationEnd / stepSeconds) * stepSeconds;
  }

  if (!times.observation) return reference;

  const steps = times.observation - 1;
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

  if (observationEnd < reference) {
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

export const getSliderStepSeconds = (sliderStep: number): number =>
  ([15, 30, 60, 180].includes(sliderStep) ? sliderStep : 15) * 60;

export const getOverlayData = async (activeOverlay: number) => {
  const { sources, layers } = Config.get('map');
  const [overlay] = layers.filter(
    ({ id }) => !activeOverlay || activeOverlay === id
  );

  if (overlay.type === 'Timeseries') {
    return getTimeseriesData(sources, overlay);
  }
  return getWMSLayerUrlsAndBounds();
};

const getTimeseriesData = async (
  sources: { [name: string]: string },
  overlay: MapLayer
): Promise<Map<number, MapOverlay> | undefined> => {
  const overlayMap = new Map();
  const toReturn = { type: 'Timeseries' } as MapOverlay;
  const [layer] = overlay.sources as TimeseriesSource[];

  const params = {
    timeStep: overlay.times.timeStep,
    timeSteps: overlay.times.forecast,
    param: [
      'lonlat',
      'population',
      'name',
      'epochtime',
      ...layer.parameters,
    ].join(','),
    keyword:
      typeof layer.keyword === 'string'
        ? layer.keyword
        : layer.keyword.join(','),
    format: 'json',
    producer: layer.producer || 'default',
    attributes: 'lonlat,population,name',
  };

  const url = `${sources[layer.source]}/timeseries`;
  const { data } = await axiosClient({ url, params });

  Object.assign(toReturn, {
    data,
    [layer.type]: {
      start: layer.type === 'observation' ? Infinity : undefined,
      end: layer.type === 'observation' ? undefined : Infinity,
    },
  });

  overlayMap.set(overlay.id, toReturn);

  return overlayMap;
};

const getWMSLayerUrlsAndBounds = async (): Promise<
  Map<number, MapOverlay> | undefined
> => {
  const capabilitiesData = new Map();
  const overlayMap = new Map();

  const { sources, layers } = Config.get('map');

  const wmsLayers = layers
    .filter((layer) => layer.type === 'WMS')
    .map((tmp) => ({ ...tmp, sources: tmp.sources as WMSSource[] }));

  const allLayerNames = wmsLayers
    .map((layer) => layer.sources.map((lSrc) => lSrc.layer))
    .flat();

  await Promise.all(
    Object.entries(sources).map(async ([src, url]) => {
      const { data } = await axiosClient({
        url: `${url}/wms`,
        params: { service: 'WMS', request: 'GetCapabilities' },
      });

      const parsedResponse = parse(data, {
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

  wmsLayers.forEach((layer) => {
    const toReturn = { type: 'WMS' } as MapOverlay;

    layer.sources.forEach((layerSrc) => {
      const wmsLayer = capabilitiesData
        .get(layerSrc.source)
        .find((src: WmsLayer) => src.Name === layerSrc.layer);

      const { BoundingBox } = wmsLayer;
      const steps = Array.isArray(wmsLayer.Dimension)
        ? wmsLayer.Dimension[0].text.split(/[,/]/)
        : wmsLayer.Dimension.text.split(/[,/]/);

      const layerStart = steps[0];
      const layerEnd = steps.length > 3 ? steps[steps.length - 1] : steps[1];

      const boundingBox84 = BoundingBox.find(
        (box: BoundingBox) => box.CRS === 'CRS:84'
      );

      const { minx, miny, maxx, maxy } = layerSrc.boundingBox || boundingBox84;
      const [numMinX, numMinY, numMaxX, numMaxY] = [
        Number(minx),
        Number(miny),
        Number(maxx),
        Number(maxy),
      ];
      const [minX, minY] = proj4('WGS84', 'EPSG:3857', [
        numMinX,
        numMinY < -85 ? 85 : numMinY,
      ]);
      const [maxX, maxY] = proj4('WGS84', 'EPSG:3857', [
        numMaxX,
        numMaxY > 85 ? 85 : numMaxY,
      ]);

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
        width: '1454',
        height: '2304',
        format: 'image/png',
        srs: 'EPSG:3857',
        crs: 'EPSG:3857',
        styles: '',
        ...layerSrc.customParameters,
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
