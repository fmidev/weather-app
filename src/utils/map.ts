import moment from 'moment';
import { parse } from 'fast-xml-parser';

import { MapOverlay } from '@store/map/types';
import { Config, MapLayer, TimeseriesSource, WMSSource } from '@config';
import i18n from '@i18n';

import axiosClient from './axiosClient';
import packageJSON from '../../package.json';

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
  if (!layerId || !layer) return 0;
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
  if (!overlay) return 0;
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
  return getWMSLayerUrlsAndBounds(sources, overlay);
};

const getTimeseriesData = async (
  sources: { [name: string]: string },
  overlay: MapLayer
): Promise<Map<number, MapOverlay> | undefined> => {
  const overlayMap = new Map();
  const toReturn = { type: 'Timeseries' } as MapOverlay;
  const [layer] = overlay.sources as TimeseriesSource[];
  const { language } = i18n;

  const params = {
    timeStep: overlay.times.timeStep,
    starttime: moment().unix(),
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
    lang: language,
    producer: layer.producer || 'default',
    attributes: 'lonlat,population,name',
    who: packageJSON.name,
  };

  const url = `${sources[layer.source]}/timeseries`;
  const { data } = await axiosClient({ url, params });

  Object.assign(toReturn, {
    data,
    order: [
      ...new Set(
        Object.keys(data)
          .sort(
            (a, b) =>
              Number(Object.keys(data[a])[0]) - Number(Object.keys(data[b])[0])
          )
          .reverse()
      ),
    ],
    [layer.type]: {
      start: layer.type === 'observation' ? Infinity : undefined,
      end: layer.type === 'observation' ? undefined : Infinity,
    },
    step: overlay.times.timeStep,
  });

  overlayMap.set(overlay.id, toReturn);

  return overlayMap;
};

const getWMSLayerUrlsAndBounds = async (
  sources: { [name: string]: string },
  overlay: MapLayer
): Promise<Map<number, MapOverlay> | undefined> => {
  const capabilitiesData = new Map();
  const overlayMap = new Map();

  const layers = [overlay];

  const wmsLayers = layers
    .filter((layer) => layer.type === 'WMS')
    .map((tmp) => ({ ...tmp, sources: tmp.sources as WMSSource[] }));

  const allLayerNames = wmsLayers
    .map((layer) => layer.sources.map((lSrc) => lSrc.layer))
    .flat();

  const activeSources = [
    ...new Set(overlay.sources.map(({ source }) => source)),
  ];

  await Promise.all(
    activeSources.map(async (src) => {
      const { data } = await axiosClient({
        url: `${sources[src]}/wms`,
        params: {
          service: 'WMS',
          request: 'GetCapabilities',
          layout: 'flat',
          who: packageJSON.name,
          ...(src.includes('smartmet')
            ? {
                namespace: `/${allLayerNames
                  .map((layerName) =>
                    layerName.substring(0, layerName.lastIndexOf(':'))
                  )
                  .join('|')}/`,
              }
            : {}),
        },
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

      let filteredLayers = [];
      if (Array.isArray(Layer)) {
        // there is a list of layers
        filteredLayers = Layer.filter((L: WmsLayer) =>
          allLayerNames.includes(L.Name)
        );
      } else if (allLayerNames.includes(Layer.Name)) {
        // layer is the only layer returned
        filteredLayers.push(Layer);
      }

      capabilitiesData.set(src, filteredLayers);
    })
  );

  wmsLayers.forEach((layer) => {
    const toReturn = { type: 'WMS' } as MapOverlay;

    layer.sources.forEach((layerSrc) => {
      const wmsLayer = capabilitiesData
        .get(layerSrc.source)
        .find((src: WmsLayer) => src.Name === layerSrc.layer);

      const steps = Array.isArray(wmsLayer.Dimension)
        ? wmsLayer.Dimension[0].text.split(/[,/]/)
        : wmsLayer.Dimension.text.split(/[,/]/);

      const layerStart = steps[0];
      const layerEnd = steps.length > 3 ? steps[steps.length - 1] : steps[1];

      const url = sources[layerSrc.source];

      const { styles, ...customParameters } = {
        styles: '',
        ...layerSrc.customParameters,
      };

      const query = new URLSearchParams({
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        transparent: 'true',
        layers: layerSrc.layer,
        bbox: '{minX},{minY},{maxX},{maxY}',
        width: '{width}',
        height: '{height}',
        format: 'image/png',
        srs: 'EPSG:3857',
        crs: 'EPSG:3857',
        ...customParameters,
      });

      const overlayUrl = decodeURIComponent(`${url}/wms?${query.toString()}`);

      Object.assign(toReturn, {
        [layerSrc.type]: {
          url: overlayUrl,
          start: layerStart,
          end: layerEnd,
          styles,
        },
        step: layer.times.timeStep,
        tileSize: layer.tileSize,
      });
    });

    overlayMap.set(layer.id, toReturn);
  });

  return overlayMap;
};
