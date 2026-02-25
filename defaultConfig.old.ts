import { ConfigType } from '@config';

const defaultConfig: ConfigType = {
  dynamicConfig: {
    enabled: false,
    apiUrl: 'https://fmi-weather-app-config-prod.s3.eu-north-1.amazonaws.com/config/config-v6_0_7.json',
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
    apiUrl: 'https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/autocomplete',
    keyword: 'extended_names',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    updateInterval: 5,
    sources: {
      smartmet:
        'https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c',
      geoserver:
        'https://wms.fmi.fi/fmi-apikey/dcdf302a-bb42-49bc-ab5e-819c55a387a5/geoserver',
    },
    "layers": [
      {
        "id": 1,
        "type": "WMS",
        "name": {
          "en": "Precipitation and lightnings 15min.",
          "fi": "Sade ja salamat 15min.",
          "sv": "Regn och blixt 15min."
        },
        "legend": {
          "hasPrecipitationFin": true,
          "hasLightning15": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:finland:precipitationObservations2",
            "type": "observation",
            "customParameters": {
              "styles": { "dark": "Mobile_dark", "light": "Mobile_light" }
            }
          },
          {
            "source": "smartmet",
            "layer": "weatherapp:finland:precipitationForecast2",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "Mobile_dark", "light": "Mobile_light" }
            }
          }
        ],
        "times": {
          "timeStep": 15,
          "observation": 12,
          "forecast": 8
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "png"
      },
      {
        "id": 2,
        "type": "WMS",
        "name": {
          "en": "Precipitation and lightnings 1h",
          "fi": "Sade ja salamat 1h",
          "sv": "Regn och blixt 1h"
        },
        "legend": {
          "hasPrecipitationScan": true,
          "hasLightning60": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:scandinavia:precipitationObservations2",
            "type": "observation",
            "customParameters": {
              "styles": { "dark": "Mobile_dark", "light": "Mobile_light" }
            }
          },
          {
            "source": "smartmet",
            "layer": "weatherapp:scandinavia:precipitationForecast2",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "Mobile_dark", "light": "Mobile_light" }
            }
          }
        ],
        "times": {
          "timeStep": 60,
          "observation": 8,
          "forecast": 8
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "png"
      },
      {
        "id": 3,
        "type": "WMS",
        "name": {
          "en": "Wind forecast 3h",
          "fi": "Tuuliennuste 3h",
          "sv": "Vindprognos 3h"
        },
        "legend": {
          "hasWindArrowsLong": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:scandinavia:windForecast2",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "default", "light": "default" }
            }
          }
        ],
        "times": {
          "timeStep": 180,
          "forecast": 8
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "png"
      },
      {
        "id": 4,
        "type": "WMS",
        "name": {
          "en": "Wind forecast 1h",
          "fi": "Tuuliennuste 1h",
          "sv": "Vindprognos 1h"
        },
        "legend": {
          "hasWindArrowsShort": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:scandinavia:windForecast2",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "default", "light": "default" }
            }
          }
        ],
        "times": {
          "timeStep": 60,
          "forecast": 12
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "png"
      },
      {
        "id": 5,
        "type": "WMS",
        "name": {
          "en": "Temperature forecast 3h",
          "fi": "Lämpötilaennuste 3h",
          "sv": "Temperaturprognos 3h"
        },
        "legend": {
          "hasTemperatureLong": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:scandinavia:temperatureForecast2",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "default", "light": "default" }
            }
          }
        ],
        "times": {
          "timeStep": 180,
          "forecast": 8
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "png"
      },
      {
        "id": 6,
        "type": "WMS",
        "name": {
          "en": "Temperature forecast 1h",
          "fi": "Lämpötilaennuste 1h",
          "sv": "Temperaturprognos 1h"
        },
        "legend": {
          "hasTemperatureShort": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:scandinavia:temperatureForecast2",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "default", "light": "default" }
            }
          }
        ],
        "times": {
          "timeStep": 60,
          "forecast": 12
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "png"
      },
      {
        "id": 7,
        "type": "Timeseries",
        "name": {
          "en": "Weather forecast on map",
          "fi": "Sääennuste kartalla",
          "sv": "Vädersymbolen på kartan"
        },
        "sources": [
          {
            "source": "smartmet",
            "type": "forecast",
            "parameters": [
              "smartSymbol",
              "temperature",
              "windSpeedMS",
              "windDirection"
            ],
            "keyword": ["weather_app"]
          }
        ],
        "times": {
          "timeStep": 60,
          "forecast": 8
        },
        "tileSize": {
          "android": 256,
          "ios": 256
        },
        "tileFormat": "png"
      },
      {
        id: 8,
        type: 'WMS',
        name: {
          en: 'Precipitation and lightnings 5min. GS',
          fi: 'Sade ja salamat 5min.',
          sv: 'Regn och blixt 5min.',
        },
        sources: [
          {
            source: 'geoserver',
            layer: 'Radar:suomi_rr_eureffin',
            type: 'observation',
          },
          {
            source: 'geoserver',
            layer: 'Radar:radar_fmippn_nowcast_deterministic_rate',
            type: 'forecast',
          },
        ],
        times: {
          timeStep: 5,
          observation: 20,
          forecast: 20,
        },
      },
    ],
  },
  weather: {
    apiUrl: 'https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries',
    layout: 'fmi',
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
            'humidity',
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
      updateInterval: 5,
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
    updateInterval: 2,
    webViewUrl:
      'https://cdn.fmi.fi/javascript/testi_pulakka/smartmet-alert-client-mobile-test',
    apiUrl: {
      FI: 'https://weather-app-warnings-backend-prod.out.ocp.fmi.fi/v1/warnings',
    },
  },
  news: {
    enabled: true,
    apiUrl: {
      //fi: 'https://www.ilmatieteenlaitos.fi/api/news?tags=filterTagResearch,filterTagWeather',
      fi: 'https://dev.ilmatieteenlaitos.fi/api/news?tags=filterTagResearch,filterTagWeather',
    },
    numberOfNews: 4,
    updateInterval: 15,
    outdated: 0,
  },
  settings: {
    languages: ['fi', 'sv', 'en'],
    units: {
      temperature: 'C',
      precipitation: 'mm',
      wind: 'm/s',
      pressure: 'hPa',
    },
    showUnitSettings: true,
    clockType: 24,
    themes: {
      light: true,
      dark: true,
      //blue: true,
    },
  },
  announcements: {
    enabled: true,
    updateInterval: 1,
    api: {
      fi: 'https://ilmatieteenlaitos.fi/api/general/mobileannouncements',
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
    termsOfUseChanged: true,
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
