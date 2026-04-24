import fs from 'fs';
import path from 'path';

jest.mock('@maplibre/maplibre-react-native', () => ({
  LogManager: {
    onLog: jest.fn(),
    start: jest.fn(),
  },
}));

import {
  getTimeseriesData,
  getWMSLayerUrlsAndBounds,
} from '../../src/utils/map';

import axiosClient from '../../src/utils/axiosClient';

jest.mock('../../src/utils/axiosClient', () => jest.fn());

describe('map helper functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse WMS GetCapabilities and build layer url + time bounds', async () => {
    const xml = fs.readFileSync(
      path.join(__dirname, '../data/GetCapabilities.xml'),
      'utf8'
    );

    (axiosClient as jest.Mock).mockResolvedValueOnce({ data: xml });

    const sources = {
      smartmet: 'https://example.test',
    };

    const overlay = {
      id: 42,
      type: 'WMS',
      name: {
        en: 'Precipitation and lightnings 5min.',
        fi: 'Sade ja salamat 5min.',
        sv: 'Regn och blixt 5min.',
      },
      times: {
        timeStep: 60,
        forecast: 8,
      },
      tileSize: 256,
      sources: [
        {
          source: 'smartmet',
          layer: 'weatherapp:scandinavia:precipitationForecast',
          type: 'forecast',
          customParameters: {
            styles: 'Mobile_dark',
          },
        },
      ],
    } as any;

    const result = await getWMSLayerUrlsAndBounds(sources, overlay, 'maplibre');
    const parsedOverlay = result?.get(42);

    expect(axiosClient).toHaveBeenCalledTimes(1);
    expect(parsedOverlay?.type).toBe('WMS');
    expect(parsedOverlay?.step).toBe(60);
    expect(parsedOverlay?.forecast?.start).toBe('2026-02-26T07:00:00Z');
    expect(parsedOverlay?.forecast?.end).toBe('2026-03-13T00:00:00Z');
    expect(parsedOverlay?.forecast?.styles).toBe('Mobile_dark');
    expect(parsedOverlay?.forecast?.url).toContain(
      'layers=weatherapp:scandinavia:precipitationForecast'
    );
    expect(parsedOverlay?.forecast?.url).toContain(
      'reference_time=2026-03-03T07:40:00Z'
    );
  });

  it('should get timeseries data for map markers', async () => {
    const timeseriesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/timeseries.json'), 'utf8')
    );

    (axiosClient as jest.Mock).mockResolvedValueOnce({ data: timeseriesData });

    const sources = {
      smartmet: 'https://example.test',
    };

  const overlay = {
      id: 8,
      type: "Timeseries",
      name: {
        en: "Weather forecast on map",
        fi: "Sääennuste kartalla",
        sv: "Vädersymbolen på kartan"
      },
      sources: [
        {
          source: "smartmet",
          type: "forecast",
          parameters: [
            "smartSymbol",
            "temperature",
            "windSpeedMS",
            "windDirection"
          ],
          keyword: ["weather_app"]
        }
      ],
      times: {
        timeStep: 60,
        forecast: 8
      },
      tileSize: {
        android: 256,
        ios: 1024
      },
      tileFormat: "png"
    } as any;

    const now = Math.floor(Date.now() / 1000);
    const result = await getTimeseriesData(sources, overlay);
    const parsedOverlay = result?.get(8);

    expect(axiosClient).toHaveBeenCalledTimes(1);
    const [requestOptions, , analyticsAction] = (axiosClient as jest.Mock).mock.calls[0];
    expect(requestOptions.url).toBe('https://example.test/timeseries');
    expect(requestOptions.params.starttime % 3600).toBe(0);
    expect(requestOptions.params.starttime).toBeGreaterThan(now);
    expect(requestOptions.params.starttime).toBeLessThanOrEqual(now + 3600);
    expect(requestOptions.params.param).toContain('lonlat,population,name,epochtime');
    expect(analyticsAction).toBe('Timeseries');

    expect(parsedOverlay?.type).toBe('Timeseries');
    expect(parsedOverlay?.data).toBe(timeseriesData);

    const helsinki =
      parsedOverlay?.data?.['24.93545, 60.16952']?.['558457']?.Helsinki?.[0];
    expect(helsinki).toEqual({
      epochtime: 1772528400,
      smartSymbol: 57,
      temperature: 0,
      windSpeedMS: 5,
      windDirection: 213,
    });
  });
});
