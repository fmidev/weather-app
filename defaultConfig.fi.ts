import { ConfigType } from '@config';

const defaultConfig: ConfigType = {
  dynamicConfig: {
    enabled: false,
    apiUrl:
      'https://fmi-weather-app-config-prod.s3.eu-north-1.amazonaws.com/config/config-animation-poc.json',
    interval: 1,
  },
  location: {
    default: {
      name: 'Helsinki',
      area: '',
      lat: 60.16952,
      lon: 24.93545,
      id: 658225,
      country: 'FI',
      timezone: 'Europe/Helsinki',
    },
    apiUrl:
      // 'https://data.fmi.fi/fmi-apikey/a75b8c99-3ae7-4f55-a129-3cd6d2053280/autocomplete', // DEV
      'https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/autocomplete', // PROD
    keyword: 'extended_names',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    baseMap: {
      url: 'https://fmi-protomaps.s3.eu-north-1.amazonaws.com/styles/',
      lightStyle: 'white_{lang}.json',
      darkStyle: 'dark_{lang}.json',
    },
    updateInterval: 5,
    sources: {
      smartmet:
       'https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c', // PROD
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
          en: 'Precipitation and lightnings 5min.',
          fi: 'Sade ja salamat 5min.',
          sv: 'Regn och blixt 5min.',
        },
        legend: {
          hasPrecipitationFin: true,
          hasLightning15: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:finland:precipitationObservations5min',
            type: 'observation',
            customParameters: {
              styles: { dark: 'Mobile_dark', light: 'Mobile_light' },
            },
          },
          {
            source: 'smartmet',
            layer: 'weatherapp:finland:precipitationForecast5min',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'Mobile_dark', light: 'Mobile_light' },
            },
          },
        ],
        times: {
          timeStep: 5,
          observation: 12,
          forecast: 12,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
        id: 2,
        type: 'WMS',
        name: {
          en: 'Precipitation and lightnings 15min.',
          fi: 'Sade ja salamat 15min.',
          sv: 'Regn och blixt 15min.',
        },
        legend: {
          hasPrecipitationFin: true,
          hasLightning15: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:finland:precipitationObservations2',
            type: 'observation',
            customParameters: {
              styles: { dark: 'Mobile_dark', light: 'Mobile_light' },
            },
          },
          {
            source: 'smartmet',
            layer: 'weatherapp:finland:precipitationForecast2',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'Mobile_dark', light: 'Mobile_light' },
            },
          },
        ],
        times: {
          timeStep: 15,
          observation: 12,
          forecast: 8,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
        id: 3,
        type: 'WMS',
        name: {
          en: 'Precipitation and lightnings 1h',
          fi: 'Sade ja salamat 1h',
          sv: 'Regn och blixt 1h',
        },
        legend: {
          hasPrecipitationScan: true,
          hasLightning60: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:scandinavia:precipitationObservations2',
            type: 'observation',
            customParameters: {
              styles: { dark: 'Mobile_dark', light: 'Mobile_light' },
            },
          },
          {
            source: 'smartmet',
            layer: 'weatherapp:scandinavia:precipitationForecast2',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'Mobile_dark', light: 'Mobile_light' },
            },
          },
        ],
        times: {
          timeStep: 60,
          observation: 8,
          forecast: 8,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
        id: 4,
        type: 'WMS',
        name: {
          en: 'Wind forecast 3h',
          fi: 'Tuuliennuste 3h',
          sv: 'Vindprognos 3h',
        },
        legend: {
          hasWindArrowsLong: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:scandinavia:windForecast2',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'default', light: 'default' },
            },
          },
        ],
        times: {
          timeStep: 180,
          forecast: 8,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
        id: 5,
        type: 'WMS',
        name: {
          en: 'Wind forecast 1h',
          fi: 'Tuuliennuste 1h',
          sv: 'Vindprognos 1h',
        },
        legend: {
          hasWindArrowsShort: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:scandinavia:windForecast2',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'default', light: 'default' },
            },
          },
        ],
        times: {
          timeStep: 60,
          forecast: 12,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
        id: 6,
        type: 'WMS',
        name: {
          en: 'Temperature forecast 3h',
          fi: 'Lämpötilaennuste 3h',
          sv: 'Temperaturprognos 3h',
        },
        legend: {
          hasTemperatureLong: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:scandinavia:temperatureForecast2',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'default', light: 'default' },
            },
          },
        ],
        times: {
          timeStep: 180,
          forecast: 8,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
        id: 7,
        type: 'WMS',
        name: {
          en: 'Temperature forecast 1h',
          fi: 'Lämpötilaennuste 1h',
          sv: 'Temperaturprognos 1h',
        },
        legend: {
          hasTemperatureShort: true,
        },
        sources: [
          {
            source: 'smartmet',
            layer: 'weatherapp:scandinavia:temperatureForecast2',
            type: 'forecast',
            customParameters: {
              styles: { dark: 'default', light: 'default' },
            },
          },
        ],
        times: {
          timeStep: 60,
          forecast: 12,
        },
        tileSize: {
          android: 256,
          ios: 1024,
        },
        tileFormat: 'png',
      },
      {
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
      }
    ],
  },
  weather: {
    layout: 'fmi',
    apiUrl:
      //'https://data.fmi.fi/fmi-apikey/a75b8c99-3ae7-4f55-a129-3cd6d2053280/timeseries', // DEV
      'https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries', // PROD
    useCardinalsForWindDirection: false,
    forecast: {
      updateInterval: 15,
      timePeriod: 'data',
      data: [
        {
          producer: 'default',
          parameters: [
            'temperature',
            'feelsLike',
            'dewPoint',
            'smartSymbol',
            'windDirection',
            'windSpeedMS',
            'pop',
            'hourlymaximumgust',
            'relativeHumidity',
            'pressure',
            'precipitation1h',
            'windCompass8',
            'totalCloudCover',
          ],
        },
        { producer: 'uv', parameters: ['uvCumulated'] },
      ],
      defaultParameters: [
        'smartSymbol',
        'temperature',
        'feelsLike',
        'windSpeedMSwindDirection',
        'precipitation1h',
        'dayLength',
      ],
      excludeDayDuration: false,
      excludePolarNightAndMidnightSun: false,
    },
    observation: {
      enabled: true,
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
      geoMagneticObservations: {
        enabled: true,
        producer: 'magnetic_disturbance_observations',
        countryCodes: ['FI', 'EE'],
      },
    },
    meteorologist: {
      url: 'https://www.ilmatieteenlaitos.fi/api/general/snapshot',
      updateInterval: 10,
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
          url: 'https://alert.smartmetospa.ideam.gov.co/capfeed.php?dir=hydrology,meteorology',
          urlIcons: '',
        },
      ],
      initialRegion: {
        latitude: 6,
        longitude: -74.08175,
        latitudeDelta: 20,
        longitudeDelta: 20,
      },
      mapZoomEnabled: true,
      mapScrollEnabled: true,
      includeAreaInTitle: false,
    },
    updateInterval: 2,
    webViewUrl:
      'https://cdn.fmi.fi/javascript/smartmet-alert-client/weather-app-4',
    apiUrl: {
      FI: 'https://weather-app-warnings-backend-prod.out.ocp.fmi.fi/v1/warnings',
    },
  },
  news: {
    enabled: true,
    apiUrl: {
      fi: 'https://www.ilmatieteenlaitos.fi/api/news?tags=filterTagResearch,filterTagWeather'
    },
    numberOfNews: 4,
    updateInterval: 15,
    outdated: 0,
  },
  settings: {
    languages: ['en', 'fi', 'sv'],
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
      aboutTheApplication: true,
      accessibility: true,
    }
  },
  announcements: {
    enabled: true,
    updateInterval: 1,
    api: {
      fi: 'https://www.ilmatieteenlaitos.fi/api/general/mobileannouncements',
      en: 'https://en.ilmatieteenlaitos.fi/api/general/mobileannouncements',
      sv: 'https://sv.ilmatieteenlaitos.fi/api/general/mobileannouncements',
    },
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
    enabled: true,
    siteId: {
      fi: 14,
      sv: 15,
      en: 16
    },
    url: 'https://matomo-dev.out.ock.fmi.fi/matomo.php'
  }
};

export default defaultConfig;
