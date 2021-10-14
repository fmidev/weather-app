// @ts-ignore
import DynamicConfig from '@config/DynamicConfig';
import { ConfigType } from '@config';

const defaultConfig: ConfigType = {
  dynamicConfig: {
    enabled: true,
    apiUrl: 'apiUrl',
    interval: 1,
  },
  location: {
    default: {
      name: 'Helsinki',
      area: 'Suomi',
      lat: 60.16952,
      lon: 24.93545,
      id: 658225,
    },
    apiUrl: 'locationApiUrl',
    keyword: 'keyword_name',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    latitudeDelta: 0.15,
    sources: {
      server1: 'server1Url',
      server2: 'server2Url',
    },
    layers: [
      {
        id: 1,
        name: { fi: 'fiName', sv: 'svName', en: 'enName' },
        legend: 'urlString',
        sources: [
          {
            source: 'server1',
            layer: 'layerName',
            type: 'forecast',
          },
        ],
        times: {
          60: { forecast: 8 },
          30: { forecast: 4 },
        },
      },
      {
        id: 7,
        name: { en: 'enName' },
        legend: 'urlString',
        sources: [
          {
            source: 'server1',
            layer: 'layerName1',
            type: 'observation',
          },
          {
            source: 'server2',
            layer: 'layerName2',
            type: 'forecast',
          },
        ],
        times: {
          60: { observation: 4, forecast: 4 },
        },
      },
    ],
  },
  weather: {
    apiUrl: 'weatherApiUrl',
    forecast: {
      timePeriod: 'data',
      producer: 'default',
      parameters: ['Temperature'],
    },
    observation: {
      enabled: true,
      numberOfStations: 10,
      producer: 'observation_producer',
      timePeriod: 24,
      parameters: ['Temperature'],
    },
  },
  warnings: {
    enabled: true,
    apiUrl: 'warningsApiUrl',
  },
  settings: {
    languages: ['fi', 'sv', 'en'],
    units: {
      Temperature: ['C', 'F'],
    },
  },
};

describe('Modify arrays', () => {
  it('Value list', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        settings: { languages: ['extra'] },
      })
    ).toMatchObject({
      settings: { languages: ['fi', 'sv', 'en', 'extra'] },
    });
  });

  it('Object list append', () => {
    const result = DynamicConfig.mergeObject(
      JSON.parse(JSON.stringify(defaultConfig)),
      {
        map: {
          layers: [{ ...defaultConfig.map.layers[0], ...{ id: 9 } }],
        },
      }
    );
    expect(result.map.layers[2]).toMatchObject({
      ...defaultConfig.map.layers[0],
      ...{ id: 9 },
    });
    expect(result.map.layers.length).toBe(3);
  });

  it('Object list edit', () => {
    const result = DynamicConfig.mergeObject(
      JSON.parse(JSON.stringify(defaultConfig)),
      {
        map: {
          layers: [
            {
              id: 7,
              legend: 'newUrl',
              sources: [
                {
                  source: 'server3',
                  layer: 'layerName1',
                },
              ],
            },
          ],
        },
      }
    );
    expect(result.map.layers[1]).toMatchObject({
      ...defaultConfig.map.layers[1],
      ...{
        legend: 'newUrl',
        sources: [
          {
            ...defaultConfig.map.layers[1].sources[0],
            ...{ source: 'server3' },
          },
          defaultConfig.map.layers[1].sources[1],
        ],
      },
    });
    expect(result.map.layers.length).toBe(2);
    expect(result).not.toMatchObject(defaultConfig);
  });
});

describe('Modify Objects', () => {
  it('Edit first level', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        dynamicConfig: { interval: 300 },
      })
    ).toMatchObject({
      dynamicConfig: { interval: 300 },
    });
  });

  it('Edit second level', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        weather: { observation: { enabled: false } },
      })
    ).toMatchObject({
      weather: { observation: { enabled: false } },
    });
  });

  it('Add new key', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        map: { sources: { server3: 'server3Url' } },
      })
    ).toMatchObject({
      map: {
        sources: { ...defaultConfig.map.sources, ...{ server3: 'server3Url' } },
      },
    });
  });
});

describe('Merge checks', () => {
  it('Set object to array', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        map: {
          layers: [
            { ...defaultConfig.map.layers[0], ...{ id: 1, sources: {} } },
          ],
        },
        settings: { languages: {} },
      })
    ).toEqual(defaultConfig);
  });

  it('Set array to object', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        map: [],
      })
    ).toEqual(defaultConfig);
  });

  it('Set empty object', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        dynamicConfig: {},
        map: {
          layers: [
            { ...defaultConfig.map.layers[0], ...{ id: 1, sources: [{}] } },
          ],
        },
      })
    ).toEqual(defaultConfig);
  });

  it('Set empty array', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        settings: { languages: [] },
      })
    ).toEqual(defaultConfig);
  });

  it('Set wrong value type', () => {
    expect(
      DynamicConfig.mergeObject(JSON.parse(JSON.stringify(defaultConfig)), {
        dynamicConfig: {
          enabled: 'true',
          apiUrl: 1,
          interval: '1',
        },
      })
    ).toEqual(defaultConfig);
  });
});
