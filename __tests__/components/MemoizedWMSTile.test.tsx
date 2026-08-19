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
});
