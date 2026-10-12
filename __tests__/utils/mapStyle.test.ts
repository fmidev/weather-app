import type { StyleSpecification } from '@maplibre/maplibre-react-native';
import {
  getMapStyleUrl,
  mergeMapStyles,
  resolveMapStyleUrls,
} from '@utils/mapStyle';

const base: StyleSpecification = {
  version: 8,
  glyphs: 'https://maps.example/fonts/{fontstack}/{range}.pbf',
  sources: {
    shared: { type: 'vector', url: 'https://maps.example/tiles.json' },
  },
  layers: [
    { id: 'earth', type: 'fill', source: 'shared', 'source-layer': 'earth' },
  ],
};
const overlay: StyleSpecification = {
  ...base,
  layers: [
    { id: 'roads', type: 'line', source: 'shared', 'source-layer': 'roads' },
    {
      id: 'places',
      type: 'symbol',
      source: 'shared',
      'source-layer': 'places',
      layout: { 'text-field': ['get', 'name'] },
    },
  ],
};

describe('map styles', () => {
  it.each([
    [false, 'fi', 'https://maps.example/light_fi.json'],
    [true, 'sv', 'https://maps.example/dark_sv.json'],
  ])(
    'selects the configured theme and language (%s, %s)',
    (dark, language, expected) => {
      expect(
        getMapStyleUrl(
          {
            url: 'https://maps.example/',
            lightStyle: 'light_{lang}.json',
            darkStyle: 'dark_{lang}.json',
          },
          dark,
          language
        )
      ).toBe(expected);
      expect(getMapStyleUrl(undefined, dark, language)).toBeUndefined();
    }
  );

  it('appends overlay layers in order, shares identical sources and preserves the inputs', () => {
    const originalBase = JSON.stringify(base);
    const originalOverlay = JSON.stringify(overlay);
    const result = mergeMapStyles(base, {
      ...overlay,
      sources: {
        shared: { url: 'https://maps.example/tiles.json', type: 'vector' },
      },
    });
    expect(result.style.layers.map(({ id }) => id)).toEqual([
      'earth',
      'roads',
      'places',
    ]);
    expect(Object.keys(result.style.sources)).toEqual(['shared']);
    expect(result.style.sources.shared).toBe(base.sources.shared);
    expect(result.beforeId).toBe('roads');
    expect(result.style.glyphs).toBe(base.glyphs);
    expect(JSON.stringify(base)).toBe(originalBase);
    expect(JSON.stringify(overlay)).toBe(originalOverlay);
  });

  it('renames conflicting sources and layers without changing vector source-layer names', () => {
    const result = mergeMapStyles(base, {
      ...overlay,
      sources: {
        shared: { type: 'vector', url: 'https://other.example/tiles.json' },
        'overlay-shared': {
          type: 'vector',
          url: 'https://third.example/tiles.json',
        },
      },
      layers: [
        {
          id: 'earth',
          type: 'line',
          source: 'shared',
          'source-layer': 'roads',
        },
        {
          id: 'overlay-earth',
          type: 'line',
          source: 'overlay-shared',
          'source-layer': 'roads',
        },
      ],
    });
    expect(result.style.sources.shared).toBe(base.sources.shared);
    expect(result.style.sources['overlay-overlay-shared']).toEqual({
      type: 'vector',
      url: 'https://other.example/tiles.json',
    });
    expect(result.style.layers[1]).toMatchObject({
      id: 'overlay-overlay-earth',
      source: 'overlay-overlay-shared',
      'source-layer': 'roads',
    });
    expect(result.style.layers[2]).toMatchObject({
      id: 'overlay-earth',
      source: 'overlay-shared',
    });
    expect(result.beforeId).toBe('overlay-overlay-earth');
  });

  it('handles an empty overlay without an insertion target', () => {
    const result = mergeMapStyles(base, {
      version: 8,
      sources: {},
      layers: [],
    });
    expect(result.style.layers).toEqual(base.layers);
    expect(result.beforeId).toBeUndefined();
  });

  it('uses overlay resources when the base has none', () => {
    const { style } = mergeMapStyles(
      { version: 8, sources: {}, layers: [] },
      { ...overlay, sprite: 'https://maps.example/sprite' }
    );
    expect(style.glyphs).toBe(overlay.glyphs);
    expect(style.sprite).toBe('https://maps.example/sprite');
  });

  it('rejects incompatible global font and sprite resources instead of breaking base layers', () => {
    expect(() =>
      mergeMapStyles(base, {
        ...overlay,
        glyphs: 'https://other.example/fonts/{fontstack}/{range}.pbf',
      })
    ).toThrow('same glyphs URL');
    expect(() =>
      mergeMapStyles(
        { ...base, sprite: 'https://maps.example/sprite' },
        { ...overlay, sprite: 'https://other.example/sprite' }
      )
    ).toThrow('same sprite definition');
  });

  it('resolves relative resources and preserves tile/font placeholders and absolute custom URLs', () => {
    const style: StyleSpecification = {
      version: 8,
      glyphs: '../fonts/{fontstack}/{range}.pbf',
      sprite: './sprite',
      sources: {
        vector: { type: 'vector', url: '../tiles.json' },
        raster: {
          type: 'raster',
          tiles: ['../tiles/{z}/{x}/{y}.png?bbox={bbox-epsg-3857}'],
        },
        geojson: { type: 'geojson', data: './points.json' },
        inline: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        },
        image: {
          type: 'image',
          url: './image.png',
          coordinates: [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        },
        custom: {
          type: 'vector',
          url: 'pmtiles://https://maps.example/world.pmtiles',
        },
      },
      layers: [],
    };
    const normalized = resolveMapStyleUrls(
      style,
      'https://maps.example/styles/base.json'
    );
    expect(normalized.glyphs).toBe(
      'https://maps.example/fonts/{fontstack}/{range}.pbf'
    );
    expect(normalized.sprite).toBe('https://maps.example/styles/sprite');
    expect(normalized.sources.vector).toMatchObject({
      url: 'https://maps.example/tiles.json',
    });
    expect(normalized.sources.raster).toMatchObject({
      tiles: [
        'https://maps.example/tiles/{z}/{x}/{y}.png?bbox={bbox-epsg-3857}',
      ],
    });
    expect(normalized.sources.geojson).toMatchObject({
      data: 'https://maps.example/styles/points.json',
    });
    expect(normalized.sources.inline).toEqual(style.sources.inline);
    expect(normalized.sources.image).toMatchObject({
      url: 'https://maps.example/styles/image.png',
    });
    expect(normalized.sources.custom).toEqual(style.sources.custom);
    expect(style.glyphs).toBe('../fonts/{fontstack}/{range}.pbf');
  });

  it('resolves sprite arrays and video resources relative to their own style document', () => {
    const normalized = resolveMapStyleUrls(
      {
        version: 8,
        sprite: [{ id: 'default', url: './sprite' }],
        sources: {
          video: {
            type: 'video',
            urls: ['./video.mp4'],
            coordinates: [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
            ],
          },
        },
        layers: [],
      },
      'https://maps.example/overlay/style.json'
    );
    expect(normalized.sprite).toEqual([
      { id: 'default', url: 'https://maps.example/overlay/sprite' },
    ]);
    expect(normalized.sources.video).toMatchObject({
      urls: ['https://maps.example/overlay/video.mp4'],
    });
  });
});
