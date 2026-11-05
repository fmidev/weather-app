import getMapStyle from '@network/MapStyleApi';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';

jest.mock('@utils/axiosClient', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@utils/matomo', () => ({ trackMatomoEvent: jest.fn() }));
const mockClient = jest.mocked(axiosClient);
const style = {
  version: 8,
  sources: { tiles: { type: 'vector', url: './tiles.json' } },
  layers: [
    { id: 'earth', type: 'fill', source: 'tiles', 'source-layer': 'earth' },
  ],
};

describe('MapStyleApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads through the existing cached HTTP client and resolves relative resources', async () => {
    mockClient.mockResolvedValue({ data: style });
    const result = await getMapStyle('https://maps.example/styles/base.json');
    expect(mockClient).toHaveBeenCalledWith(
      { url: 'https://maps.example/styles/base.json' },
      undefined,
      'Map'
    );
    expect(result.sources.tiles).toMatchObject({
      url: 'https://maps.example/styles/tiles.json',
    });
    expect(result.layers).toEqual(style.layers);
  });

  it.each([
    null,
    {},
    { ...style, version: 7 },
    { ...style, sources: null },
    { ...style, sources: { tiles: { type: 'invalid' } } },
    { ...style, layers: 'invalid' },
    { ...style, layers: [...style.layers, ...style.layers] },
    {
      ...style,
      layers: [{ id: 'missing-source', type: 'fill', source: 'unknown' }],
    },
    { ...style, layers: [{ id: 'invalid-type', type: 'invalid' }] },
  ])('rejects invalid style documents (%j)', async (data) => {
    mockClient.mockResolvedValue({ data });
    await expect(
      getMapStyle('https://maps.example/style.json')
    ).rejects.toThrow('Invalid MapLibre style document');
    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'Error',
      'Map',
      'Invalid MapLibre style document'
    );
  });

  it('propagates HTTP errors to the caller for fallback handling', async () => {
    const error = new Error('Network unavailable');
    mockClient.mockRejectedValueOnce(error);
    await expect(getMapStyle('https://maps.example/style.json')).rejects.toBe(
      error
    );
  });

  it('reports malformed resource definitions for fallback handling', async () => {
    mockClient.mockResolvedValue({ data: { ...style, sprite: {} } });
    await expect(getMapStyle('https://maps.example/style.json')).rejects.toThrow();
    expect(trackMatomoEvent).toHaveBeenCalledWith('Error', 'Map', expect.stringContaining('Invalid map style resources'));
  });
});
