import { ConfigType } from '@config';

const defaultConfig: ConfigType = {
  dynamicConfig: {
    enabled: false,
  },
  location: {
    default: {
      name: 'Tbilisi',
      area: '',
      lat: 41.69143,
      lon: 44.83412,
      id: 611717,
      country: 'GE',
      timezone: 'Asia/Tbilisi',
    },
    apiUrl:
      // 'https://data.fmi.fi/fmi-apikey/a75b8c99-3ae7-4f55-a129-3cd6d2053280/autocomplete', // DEV
      'https://data.nea.gov.ge/autocomplete', // PROD
    keyword: 'extended_names',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    updateInterval: 5,
    sources: {
      smartmet:
       'https://data.nea.gov.ge/', // PROD
      // 'https://data.fmi.fi/fmi-apikey/a75b8c99-3ae7-4f55-a129-3cd6d2053280', // DEV
      // 'http://rhel8.dev.fmi.fi:8153', // devdev
      geoserver:
        'https://wms.fmi.fi/fmi-apikey/dcdf302a-bb42-49bc-ab5e-819c55a387a5/geoserver',
    },
    infoBottomSheet: {
      url: 'https://geosaaga-api.s3.eu-north-1.amazonaws.com/map_{layer}_{lang}.md',
    },
    layers: [
     {
        id: 1,
        type: 'WMS',
        name: {
          en: 'Temperature',
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'ecmwf:surface:temperature',
            type: 'forecast',
            customParameters: {
              'l.attributes.opacity': 0.6,
            },
          },
        ],
        times: {
          timeStep: 180,
          forecast: 24,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
      },
      {
        id: 2,
        type: 'WMS',
        name: {
          en: 'Precipitation',
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'ecmwf:surface:precipitation',
            type: 'forecast',
            customParameters: {
              'l.attributes.opacity': 0.6,
            },
          },
        ],
        times: {
          timeStep: 180,
          forecast: 24,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
      },
    ],
  },
  weather: {
    layout: 'fmi',
    apiUrl:
      //'https://data.fmi.fi/fmi-apikey/a75b8c99-3ae7-4f55-a129-3cd6d2053280/timeseries', // DEV
      'https://data.nea.gov.ge/timeseries', // PROD
    useCardinalsForWindDirection: false,
    forecast: {
      updateInterval: 15,
      timePeriod: 'data',
      data: [
        {
          producer: 'default',
          parameters: [
            'temperature',
            'dewPoint',
            'smartSymbol',
            'windDirection',
            'windSpeedMS',
            'pop',
            'hourlymaximumgust',
            'humidity',
            'pressure',
            'precipitation1h',
            'windCompass8',
          ],
        },
        { producer: 'uv', parameters: ['uvCumulated'] },
      ],
      defaultParameters: [
        'smartSymbol',
        'temperature',
        'windSpeedMSwindDirection',
        'precipitation1h',
        'dayLength',
      ],
      excludeDayDuration: false,
      excludePolarNightAndMidnightSun: true,
    },
    observation: {
      enabled: false,
      updateInterval: 1,
      numberOfStations: 10,
      producer: { FI: 'observations_fmi', default: 'foreign' },
      timePeriod: 72,
      parameters: [
        'dewPoint',
        'humidity',
        'precipitation1h',
        'pressure',
        'ri_10min',
        'snowDepth',
        'temperature',
        'totalCloudCover',
        'visibility',
        'windCompass8',
        'windDirection',
        'windGust',
        'windSpeedMS',
      ],
      dailyProducers: ['observations_fmi'],
      dailyParameters: [
        'rrday',
        'maximumTemperature',
        'minimumTemperature',
        'minimumGroundTemperature06',
        'snowDepth06',
      ],
    },
  },
  warnings: {
    enabled: true,
    useCapView: false,
    capViewSettings: {
      mapHeight: 500,
      numberOfDays: 5,
      datasources: [
        {
          id: 1,
          url: 'https://alert.nea.gov.ge/capfeed.php',
          urlIcons: '',
        },
      ],
      initialRegion: {
        latitude: 41.7,
        longitude: 44.8,
        latitudeDelta: 6,
        longitudeDelta: 6,
      },
      mapZoomEnabled: true,
      mapScrollEnabled: true,
      includeAreaInTitle: false,
    },
    updateInterval: 1,
  },
  settings: {
    languages: ['en'],
    showUnitSettings: true,
    units: {
      temperature: 'C',
      precipitation: 'mm',
      wind: 'm/s',
      pressure: 'hPa',
    },
    //excludeUnits: ['mph', 'bft', 'kn', 'mbar'],
    clockType: 24,
    themes: {
      light: true,
      dark: true,
    },
    verboseErrorMessages: false,
    markdown: {
      termsOfUse: false,
      aboutTheApplication: false,
      accessibility: true,
    }
  },
  announcements: {
    enabled: false,
  },
  socialMediaLinks: [
    {
      name: 'Twitter',
      icon: 'social-twitter',
      appUrl: 'twitter://user?screen_name=meteorologit',
      url: 'https://twitter.com/meteorologit',
    },
    {
      name: 'Instagram',
      icon: 'social-instagram',
      appUrl: 'instagram://user?username=ilmatieteenlaitos',
      url: 'https://www.instagram.com/ilmatieteenlaitos/',
    },
    {
      name: 'YouTube',
      icon: 'social-youtube',
      appUrl: 'youtube://ilmatieteenlaitos',
      url: 'https://www.youtube.com/user/ilmatieteenlaitos',
    },
  ],
  onboardingWizard: {
    enabled: true,
    termsOfUseChanged: false,
  },
  feedback: {
    enabled: true,
    email: 'mobiili@fmi.fi',
    subject: {
      fi: 'Ilmatieteen laitoksen sääsovelluksen palaute',
      sv: 'Respons på Meteorologiska institutets väderapplikation',
      en: 'Feedback on the Meteorological Institute weather app',
    },
  },
  analytics: {
    enabled: false,
  }
};

export default defaultConfig;
