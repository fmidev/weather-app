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
      country: 'FI',
      timezone: 'Europe/Helsinki',
    },
    apiUrl: 'locationApiUrl',
    keyword: 'keyword_name',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    updateInterval: 5,
    latitudeDelta: 0.15,
    sources: {
      server1: 'server1Url',
      server2: 'server2Url',
    },
    layers: [
      {
        id: 1,
        type: 'WMS',
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
          timeStep: 15,
          observation: 12,
          forecast: 8,
        },
      },
      {
        id: 7,
        type: 'WMS',
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
          timeStep: 15,
          observation: 12,
          forecast: 8,
        },
      },
    ],
  },
  weather: {
    apiUrl: 'weatherApiUrl',
    forecast: {
      updateInterval: 5,
      timePeriod: 'data',
      producer: 'default',
      parameters: ['Temperature'],
    },
    observation: {
      updateInterval: 5,
      enabled: true,
      numberOfStations: 10,
      producer: 'observation_producer',
      timePeriod: 24,
      parameters: ['Temperature'],
    },
  },
  warnings: {
    enabled: true,
    updateInterval: 5,
    apiUrl: { FI: 'warningsApiUrl' },
  },
  settings: {
    languages: ['fi', 'sv', 'en'],
    units: {
      Temperature: ['C', 'F'],
    },
  },
};

export default defaultConfig;
