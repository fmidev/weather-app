import { Platform } from 'react-native';
import moment from 'moment';
import { XMLParser } from 'fast-xml-parser';
import { LogManager } from "@maplibre/maplibre-react-native";

import { MapOverlay } from '@store/map/types';
import { Config, MapLayer, TimeseriesSource, WMSSource } from '@config';
import i18n from '@i18n';
import type { MapLibrary } from '@store/settings/types';

import axiosClient from './axiosClient';
import packageJSON from '../../package.json';

type BoundingBox = {
  CRS?: string;
  minx: string;
  miny: string;
  maxx: string;
  maxy: string;
};

type WmsDimension = {
  text: string;
  name: string;
  default: string;
  units: string;
};

type RawWmsLayer = {
  Name?: string;
  Title?: string;
  Abstract?: string;
  CRS?: string | string[];
  BoundingBox?: BoundingBox | BoundingBox[];
  Dimension?: WmsDimension | WmsDimension[];
  Layer?: RawWmsLayer | RawWmsLayer[];
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
  ([5, 15, 30, 60, 180].includes(sliderStep) ? sliderStep : 15) * 60;

export const getOverlayData = async (activeOverlay: number, library: MapLibrary) => {
  const { sources, layers } = Config.get('map');
  const [overlay] = layers.filter(
    ({ id }) => !activeOverlay || activeOverlay === id
  );

  if (overlay.type === 'Timeseries') {
    return getTimeseriesData(sources, overlay);
  }
  return getWMSLayerUrlsAndBounds(sources, overlay, library);
};

export const getTimeseriesData = async (
  sources: { [name: string]: string },
  overlay: MapLayer
): Promise<Map<number, MapOverlay> | undefined> => {
  const overlayMap = new Map();
  const toReturn = { type: 'Timeseries' } as MapOverlay;
  const [layer] = overlay.sources as TimeseriesSource[];
  const { language } = i18n;

  const now = moment().unix();

  const params = {
    timeStep: overlay.times.timeStep,
    starttime: now - (now % 3600) + 3600, // round to next hour
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
    who: `${packageJSON.name}-${Platform.OS}`,
  };

  const url = `${sources[layer.source]}/timeseries`;
  const { data } = await axiosClient({ url, params }, undefined, 'Timeseries');

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

const normalizeToArray = <T>(value?: T | T[]): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const flattenLayers = (root: RawWmsLayer): WmsLayer[] => {
  const result: WmsLayer[] = [];
  const visit = (
    layer: RawWmsLayer,
    inheritedDimension?: WmsDimension | WmsDimension[]
  ) => {
    const effectiveDimension = layer.Dimension ?? inheritedDimension;

    if (layer.Name && layer.Title && effectiveDimension) {
      result.push({
        Name: layer.Name,
        Title: layer.Title,
        Abstract: layer.Abstract ?? '',
        CRS: normalizeToArray(layer.CRS),
        BoundingBox: normalizeToArray(layer.BoundingBox),
        Dimension: effectiveDimension,
      });
    }

    const children = layer.Layer;
    if (Array.isArray(children)) {
      children.forEach((child) => visit(child, effectiveDimension));
    } else if (children) {
      visit(children, effectiveDimension);
    }
  };

  visit(root, root.Dimension);
  return result;
};

type TimeBounds = { layerStart: string; layerEnd: string };

const parseWmsTimeBounds = (dimText: string): TimeBounds => {
  const segments = dimText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    throw new Error('WMS time dimension is empty');
  }

  const parseSegment = (seg: string) => {
    // segment can be in formats:
    // - start/end/period
    // - start/end
    // - individual time step
    const parts = seg.split('/').map((p) => p.trim()).filter(Boolean);

    if (parts.length === 1) {
      return { start: parts[0], end: parts[0] };
    }

    // start/end(/period)
    return { start: parts[0], end: parts[1] };
  };

  const first = parseSegment(segments[0]);
  const last = parseSegment(segments[segments.length - 1]);

  return { layerStart: first.start, layerEnd: last.end };
};

export const getWMSLayerUrlsAndBounds = async (
  sources: { [name: string]: string },
  overlay: MapLayer,
  library: MapLibrary
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

  const options = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
    ignoreNameSpace: false,
    textNodeName: 'text',
  };

  const parser = new XMLParser(options);

  await Promise.all(
    activeSources.map(async (src) => {
      const { data } = await axiosClient({
        url: `${sources[src]}/wms`,
        params: {
          service: 'WMS',
          request: 'GetCapabilities',
          layout: 'recursive',
          enableintervals: '1',
          who: `${packageJSON.name}-${Platform.OS}`,
          ...(src.includes('smartmet')
            ? {
                namespace: `/${[
                  ...new Set(
                    allLayerNames.map((layerName) =>
                      layerName.substring(0, layerName.lastIndexOf(':'))
                    )
                  ),
                ].join('|')}/`
              }
            : {}),
        },
      }, undefined, 'WMS');

      const parsedResponse = parser.parse(data);

      const rootLayer: RawWmsLayer = parsedResponse.WMS_Capabilities.Capability.Layer;
      const allLayers = flattenLayers(rootLayer);
      const filteredLayers = allLayers.filter((L: WmsLayer) =>
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

      const dimensionArray: WmsDimension[] = Array.isArray(wmsLayer.Dimension)
        ? wmsLayer.Dimension : wmsLayer.Dimension
        ? [wmsLayer.Dimension as WmsDimension] : [];

      const timeDimension = dimensionArray.find((dim) => dim.name === 'time') ?? dimensionArray[0];
      const { layerStart, layerEnd } = parseWmsTimeBounds(timeDimension.text);

      const referenceTimeDimension = dimensionArray.find(
        (dim) => dim.name === 'reference_time'
      );

      let referenceTime: string | undefined;
      if (referenceTimeDimension) {
        referenceTime = referenceTimeDimension.default;
      }

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
        bbox: library === 'maplibre' ? '{bbox-epsg-3857}' : '{minX},{minY},{maxX},{maxY}',
        width: library === 'maplibre' ? '256' : '{width}',
        height: library === 'maplibre' ? '256' : '{height}',
        format: `image/${layer.tileFormat ?? 'png'}`,
        srs: 'EPSG:3857',
        crs: 'EPSG:3857',
        ...customParameters,
        ...(referenceTime ? { reference_time: referenceTime } : {}),
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
        tileSize:
          typeof layer.tileSize === 'object'
            ? layer.tileSize[Platform.OS]
            : layer.tileSize,
      });
    });

    overlayMap.set(layer.id, toReturn);
  });

  return overlayMap;
};

export const configureMapLibreLogging = () => {
  LogManager.onLog((event) => {
    const { tag, message } = event;

    const shouldSuppress =
      tag === "Mbgl" &&
      message.includes("Failed to load tile")

    return shouldSuppress;
  });

  LogManager.start();
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type BBox = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

export const getBoundingBox = (coordinates: Coordinate[]): BBox | null => {
  if (coordinates.length === 0) {
    return null;
  }

  return coordinates.reduce<BBox>(
    (bbox, { latitude, longitude }) => ({
      minLatitude: Math.min(bbox.minLatitude, latitude),
      maxLatitude: Math.max(bbox.maxLatitude, latitude),
      minLongitude: Math.min(bbox.minLongitude, longitude),
      maxLongitude: Math.max(bbox.maxLongitude, longitude),
    }),
    {
      minLatitude: coordinates[0].latitude,
      maxLatitude: coordinates[0].latitude,
      minLongitude: coordinates[0].longitude,
      maxLongitude: coordinates[0].longitude,
    }
  );
};

export const isPointInsideBoundingBox = (point: Coordinate, bbox: BBox) =>
  point.latitude >= bbox.minLatitude &&
  point.latitude <= bbox.maxLatitude &&
  point.longitude >= bbox.minLongitude &&
  point.longitude <= bbox.maxLongitude;

