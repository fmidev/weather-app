import React from 'react';
import { render } from '@testing-library/react-native';

import MemoizedWMSTile from '../../src/components/map/layers/MemoizedWMSTile';

const mockLayer = jest.fn<any, any[]>(() => null);
const mockRasterSource = jest.fn<any, any[]>(({ children }) => children);

jest.mock('@maplibre/maplibre-react-native', () => ({
  Layer: (props: any) => mockLayer(props),
  RasterSource: (props: any) => mockRasterSource(props),
}));

jest.mock('react-native-maps', () => ({
  WMSTile: () => null,
}));

describe('MemoizedWMSTile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps MapLibre ids stable when the themed tile URL changes', () => {
    const tileId = '2025-01-01T00:00:00.000Z';
    const { rerender } = render(
      <MemoizedWMSTile
        tileId={tileId}
        urlTemplate="https://example.test/wms?styles=light"
        library="maplibre"
      />
    );

    rerender(
      <MemoizedWMSTile
        tileId={tileId}
        urlTemplate="https://example.test/wms?styles=dark"
        library="maplibre"
      />
    );

    expect(mockRasterSource).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: `wms-source-${tileId}`,
        tiles: ['https://example.test/wms?styles=dark'],
      })
    );
    expect(mockLayer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: `wms-layer-${tileId}`,
        source: `wms-source-${tileId}`,
      })
    );
  });
});
