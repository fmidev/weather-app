import type { StyleSpecification } from '@maplibre/maplibre-react-native';
import axiosClient from '@utils/axiosClient';
import { resolveMapStyleUrls } from '@utils/mapStyle';
import { trackMatomoEvent } from '@utils/matomo';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isMapStyle = (value: unknown): value is StyleSpecification => {
  if (
    !isRecord(value) ||
    value.version !== 8 ||
    !isRecord(value.sources) ||
    !Array.isArray(value.layers)
  )
    return false;
  const sourceTypes = [
    'vector',
    'raster',
    'raster-dem',
    'geojson',
    'image',
    'video',
  ];
  const layerTypes = [
    'background',
    'fill',
    'line',
    'symbol',
    'raster',
    'circle',
    'fill-extrusion',
    'heatmap',
    'hillshade',
    'color-relief',
  ];
  const sources = value.sources;
  const layerIds = new Set<string>();
  return (
    Object.values(sources).every(
      (source) => isRecord(source) && sourceTypes.includes(String(source.type))
    ) &&
    value.layers.every((layer) => {
      if (
        !isRecord(layer) ||
        typeof layer.id !== 'string' ||
        !layer.id ||
        layerIds.has(layer.id) ||
        !layerTypes.includes(String(layer.type))
      )
        return false;
      if (
        layer.type !== 'background' &&
        (typeof layer.source !== 'string' || !sources[layer.source])
      )
        return false;
      layerIds.add(layer.id);
      return true;
    })
  );
};

const getMapStyle = async (url: string): Promise<StyleSpecification> => {
  const { data } = await axiosClient({ url }, undefined, 'Map');
  if (!isMapStyle(data)) {
    const error = new Error('Invalid MapLibre style document');
    trackMatomoEvent('Error', 'Map', error.message);
    throw error;
  }
  try {
    return resolveMapStyleUrls(data, url);
  } catch (error) {
    trackMatomoEvent('Error', 'Map', `Invalid map style resources: ${String(error)}`);
    throw error;
  }
};

export default getMapStyle;
