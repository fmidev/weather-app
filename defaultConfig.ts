import { ConfigType } from '@config';
const defaultConfig: ConfigType = {
  dynamicConfig: {
    enabled: false,
  },
  location: {
    default: {
      name: 'Kingston',
      area: '',
      lat: 17.99702,
      lon: -76.79358,
      id: 3489854,
      country: 'JM',
      timezone: 'America/Jamaica',
    },
    apiUrl:
      'https://data.metservice.gov.jm/autocomplete',
    keyword: 'extended_names',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    updateInterval: 5,
    sources: {
      smartmet: 'https://data.metservice.gov.jm',
    },
    layers: [
      {
        id: 1,
        type: 'WMS',
        name: {
          en: 'TEST',
          fi: 'TEST',
          sv: 'TEST',
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'gfs:surface:temperature',
            type: 'forecast',
          },
        ],
        times: { timeStep: 60, forecast: 12 },
      },
    ],
  },
  weather: {
    apiUrl: 'https://data.metservice.gov.jm/timeseries',
    forecast: {
      updateInterval: 15,
      timePeriod: 'data',
      data: [
        {
          producer: 'gfs_world_surface',
          parameters: [
            'temperature',
            'relativeHumidity',
            'smartSymbol',
            'windDirection',
            'windSpeedMS',
            'hourlymaximumgust',
            'precipitation1h',
          ],
        },
      ],
      defaultParameters: ['smartSymbol', 'temperature', 'windSpeedMSwindDirection', 'precipitation1h'],
    },
    observation: {
      enabled: false,
    },
  },
  warnings: {
    enabled: true,
    updateInterval: 5,
    webViewUrl: 'https://alert.metservice.gov.jm',
    apiUrl: {
      EN: 'https://alert.metservice.gov.jm/v1/warnings'
    },
  },
  settings: {
    languages: ['en'],
    units: {
      temperature: 'C',
      precipitation: 'mm',
      wind: 'km/h',
      pressure: 'hPa',
    },
  },
  announcements: {
    enabled: false,
  },
  socialMediaLinks: [],
};
export default defaultConfig;
