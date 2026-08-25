import React from 'react';
import { render } from '@testing-library/react-native';

import MemoizedWMSTile from '../../src/components/map/layers/MemoizedWMSTile';

const mockLayer = jest.fn<any, any[]>(() => null);
const mockRasterSource = jest.fn<any, any[]>(({ children }) => children);
const mockVectorSource = jest.fn<any, any[]>(({ children }) => children);
const mockWMSTile = jest.fn<any, any[]>(() => null);

jest.mock('@maplibre/maplibre-react-native', () => ({
  Layer: (props: any) => mockLayer(props),
  RasterSource: (props: any) => mockRasterSource(props),
  VectorSource: (props: any) => mockVectorSource(props),
}));

jest.mock('react-native-maps', () => ({
  WMSTile: (props: any) => mockWMSTile(props),
}));

describe('MemoizedWMSTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses a vector source and fill layer for MapLibre PBF tiles', () => {
    const urlTemplate = 'https://example.test/wms?format=pbf';

    render(
      <MemoizedWMSTile
        urlTemplate={urlTemplate}
        opacity={0.5}
        tileFormat="pbf"
        vectorLayers={[
          {
            id: 'precipitation',
            type: 'fill',
            'source-layer': 'precipitation_rate',
            paint: { 'fill-opacity': 0.8 },
          },
        ]}
        library="maplibre"
      />
    );

    expect(mockVectorSource).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringContaining('wms-source-'),
        tiles: [urlTemplate],
      })
    );
    expect(mockVectorSource.mock.calls[0][0]).not.toHaveProperty('minzoom');
    expect(mockVectorSource.mock.calls[0][0]).not.toHaveProperty('maxzoom');
    expect(mockRasterSource).not.toHaveBeenCalled();
    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'fill',
        'source-layer': 'precipitation_rate',
        paint: expect.objectContaining({
          'fill-opacity': 0.4,
        }),
      })
    );
  });

  it('preserves a data-driven opacity expression during animation', () => {
    const opacityExpression = [
      'interpolate',
      ['linear'],
      ['zoom'],
      4,
      0.25,
      10,
      0.8,
    ];

    render(
      <MemoizedWMSTile
        urlTemplate="https://example.test/wms?format=pbf"
        opacity={0.5}
        tileFormat="pbf"
        vectorLayers={[
          {
            id: 'precipitation',
            type: 'fill',
            'source-layer': 'precipitation_rate',
            paint: { 'fill-opacity': opacityExpression },
          },
        ]}
        library="maplibre"
      />
    );

    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        paint: expect.objectContaining({
          'fill-opacity': ['*', opacityExpression, 0.5],
        }),
      })
    );
  });

  it('keeps using a raster source for other MapLibre tile formats', () => {
    const urlTemplate = 'https://example.test/wms?format=image/png';

    render(
      <MemoizedWMSTile
        urlTemplate={urlTemplate}
        tileFormat="png"
        library="maplibre"
      />
    );

    expect(mockRasterSource).toHaveBeenCalledWith(
      expect.objectContaining({ tiles: [urlTemplate] })
    );
    expect(mockVectorSource).not.toHaveBeenCalled();
    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'raster' })
    );
  });

  it('sets the vector source maxzoom from the MVT configuration', () => {
    render(
      <MemoizedWMSTile
        urlTemplate="https://example.test/wms?format=pbf"
        tileFormat="pbf"
        mvt={{ maxZoom: 6 }}
        library="maplibre"
      />
    );

    expect(mockVectorSource).toHaveBeenCalledWith(
      expect.objectContaining({ minzoom: 1, maxzoom: 6 })
    );
  });

  it('adds a text layer for the configured PBF source layer', () => {
    const urlTemplate = 'https://example.test/wms?format=pbf';

    render(
      <MemoizedWMSTile
        urlTemplate={urlTemplate}
        opacity={0.5}
        tileFormat="pbf"
        mvt={{ value: 'temperature_numeric_pos' }}
        library="maplibre"
      />
    );

    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'symbol',
        'source-layer': 'temperature_numeric_pos',
        layout: expect.objectContaining({
          'text-field': ['to-string', ['get', 'text']],
          'text-font': ['Noto Sans Regular'],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          visibility: 'visible',
        }),
        paint: expect.objectContaining({
          'text-opacity': 0.5,
        }),
      })
    );
  });

  it('preloads inactive PBF text layers with zero opacity', () => {
    render(
      <MemoizedWMSTile
        urlTemplate="https://example.test/wms?format=pbf"
        opacity={0}
        tileFormat="pbf"
        mvt={{ value: 'temperature_numeric_pos' }}
        library="maplibre"
      />
    );

    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'symbol',
        layout: expect.objectContaining({
          visibility: 'visible',
        }),
        paint: expect.objectContaining({
          'text-opacity': 0,
        }),
      })
    );
  });

  it('uses the speed property for the wind arrow source layer', () => {
    render(
      <MemoizedWMSTile
        urlTemplate="https://example.test/wms?format=pbf"
        opacity={1}
        tileFormat="pbf"
        mvt={{
          value: 'windarrow_forecast.speed',
          valueAccuracy: 0,
          style: false,
        }}
        library="maplibre"
      />
    );

    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'symbol',
        'source-layer': 'windarrow_forecast',
        layout: expect.objectContaining({
          'text-field': [
            'to-string',
            ['round', ['to-number', ['get', 'speed']]],
          ],
        }),
      })
    );
  });

  it('adds a rotated wind arrow layer for the configured direction property', () => {
    render(
      <MemoizedWMSTile
        urlTemplate="https://example.test/wms?format=pbf"
        opacity={0.5}
        tileFormat="pbf"
        mvt={{
          style: false,
          windDirection: 'windarrow_forecast.direction',
          windDirectionFix: -135,
        }}
        library="maplibre"
      />
    );

    expect(mockLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'symbol',
        'source-layer': 'windarrow_forecast',
        layout: expect.objectContaining({
          'icon-image': 'mvt-wind-arrow',
          'icon-rotate': [
            '+',
            ['to-number', ['get', 'direction']],
            -135,
          ],
          'icon-rotation-alignment': 'map',
        }),
        paint: expect.objectContaining({
          'icon-opacity': 0.5,
        }),
      })
    );
  });
});
