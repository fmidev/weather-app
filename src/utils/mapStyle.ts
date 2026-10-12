import { URL } from 'react-native-url-polyfill';
import type {
  StyleSpecification,
  SourceSpecification,
} from '@maplibre/maplibre-react-native';
import type { MapStyle } from '@config';

export const DEFAULT_WMS_BEFORE_ID = 'places_region';

export const getMapStyleUrl = (
  config: MapStyle | undefined,
  dark: boolean,
  language: string
) =>
  config
    ? config.url +
      (dark ? config.darkStyle : config.lightStyle).replace(
        /\{lang\}/g,
        language
      )
    : undefined;

const resolveUrl = (value: string, styleUrl: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : new URL(value, styleUrl).href.replace(/%7B/gi, '{').replace(/%7D/gi, '}');

// Inline styles lose their document URL, so make resource URLs absolute first.
export const resolveMapStyleUrls = (
  style: StyleSpecification,
  styleUrl: string
): StyleSpecification => ({
  ...style,
  ...(style.glyphs ? { glyphs: resolveUrl(style.glyphs, styleUrl) } : {}),
  ...(style.sprite
    ? {
        sprite:
          typeof style.sprite === 'string'
            ? resolveUrl(style.sprite, styleUrl)
            : style.sprite.map((sprite) => ({
                ...sprite,
                url: resolveUrl(sprite.url, styleUrl),
              })),
      }
    : {}),
  sources: Object.fromEntries(
    Object.entries(style.sources).map(([id, source]) => [
      id,
      {
        ...source,
        ...('url' in source && typeof source.url === 'string'
          ? { url: resolveUrl(source.url, styleUrl) }
          : {}),
        ...('tiles' in source && source.tiles
          ? { tiles: source.tiles.map((tile) => resolveUrl(tile, styleUrl)) }
          : {}),
        ...(source.type === 'geojson' && typeof source.data === 'string'
          ? { data: resolveUrl(source.data, styleUrl) }
          : {}),
        ...(source.type === 'video'
          ? { urls: source.urls.map((url) => resolveUrl(url, styleUrl)) }
          : {}),
      },
    ])
  ),
});

const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const uniqueOverlayId = (id: string, reserved: Set<string>) => {
  let candidate = `overlay-${id}`;
  while (reserved.has(candidate)) candidate = `overlay-${candidate}`;
  reserved.add(candidate);
  return candidate;
};

export const mergeMapStyles = (
  base: StyleSpecification,
  overlay: StyleSpecification
) => {
  // A native style has one global font endpoint and sprite definition. Never
  // silently replace resources used by the base map with incompatible ones.
  if (base.glyphs && overlay.glyphs && base.glyphs !== overlay.glyphs) {
    throw new Error('Base and overlay map styles must use the same glyphs URL');
  }
  if (
    base.sprite &&
    overlay.sprite &&
    canonicalJson(base.sprite) !== canonicalJson(overlay.sprite)
  ) {
    throw new Error(
      'Base and overlay map styles must use the same sprite definition'
    );
  }

  const sources: Record<string, SourceSpecification> = { ...base.sources };
  const reservedSources = new Set([
    ...Object.keys(base.sources),
    ...Object.keys(overlay.sources),
  ]);
  const sourceIds = new Map<string, string>();
  Object.entries(overlay.sources).forEach(([id, source]) => {
    const targetId =
      sources[id] && canonicalJson(sources[id]) !== canonicalJson(source)
        ? uniqueOverlayId(id, reservedSources)
        : id;
    sourceIds.set(id, targetId);
    if (!sources[targetId]) sources[targetId] = source;
  });

  const baseLayerIds = new Set(base.layers.map(({ id }) => id));
  const reservedLayers = new Set([
    ...baseLayerIds,
    ...overlay.layers.map(({ id }) => id),
  ]);
  const overlayLayers = overlay.layers.map((layer) => ({
    ...layer,
    id: baseLayerIds.has(layer.id)
      ? uniqueOverlayId(layer.id, reservedLayers)
      : layer.id,
    ...('source' in layer
      ? { source: sourceIds.get(layer.source) ?? layer.source }
      : {}),
  }));

  const style: StyleSpecification = {
    ...base,
    ...(overlay.glyphs ? { glyphs: overlay.glyphs } : {}),
    ...(overlay.sprite ? { sprite: overlay.sprite } : {}),
    sources,
    layers: [...base.layers, ...overlayLayers],
  };
  return { style, beforeId: overlayLayers[0]?.id };
};
