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

export default defaultConfig;
