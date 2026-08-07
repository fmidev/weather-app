import type { ConfigType } from '@config';

const defaultConfig: ConfigType = {
  dynamicConfig: {
    enabled: false,
  },
  location: {
    source: 'smartmet',
    default: {
      name: 'Helsinki',
      area: '',
      lat: 60.16952,
      lon: 24.93545,
      id: 658225,
      country: 'FI',
      timezone: 'Europe/Helsinki',
    },
    apiUrl: 'https://test.fmi.fi/autocomplete',
    keyword: 'some_keyword',
    maxRecent: 5,
    maxFavorite: 10,
  },
  map: {
    updateInterval: 5,
    sources: {
      smartmet: 'https://test.fmi.fi',
      geoserver: 'https://testwms.fmi.fi',
    },
    baseMap: {
      url: 'https://test.fmi.fi/styles/',
      lightStyle: 'white_{lang}.json',
      darkStyle: 'dark_{lang}.json',
    },
  layers: [
      {
        "id": 1,
        "type": "WMS",
        "name": {
          "en": "Precipitation and lightnings 5min.",
          "fi": "Sade ja salamat 5min.",
          "sv": "Regn och blixt 5min."
        },
        "legend": {
          "hasPrecipitationFin": true,
          "hasLightning15": true
        },
        "sources": [
          {
            "source": "smartmet",
            "layer": "weatherapp:finland:precipitationObservations5min",
            "type": "observation",
            "customParameters": {
              "styles": { "dark": "Mobile_dark", "light": "Mobile_light" }
            }
          },
          {
            "source": "smartmet",
            "layer": "weatherapp:finland:precipitationForecast5min",
            "type": "forecast",
            "customParameters": {
              "styles": { "dark": "Mobile_dark", "light": "Mobile_light" }
            }
          }
        ],
        "times": {
          "timeStep": 5,
          "observation": 12,
          "forecast": 12,
          "animationSpeed": 20
        },
        "tileSize": {
          "android": 256,
          "ios": 1024
        },
        "tileFormat": "webp"
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
        "tileFormat": "webp"
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
        "tileFormat": "webp"
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
        "tileFormat": "webp"
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
        "tileFormat": "webp"
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
        "tileFormat": "webp"
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
          "ios": 1024
        },
        "tileFormat": "webp"
      }
    ]
  },
  weather: {
    apiUrl: 'https://test.fmi.fi/timeseries',
    layout: 'vertical',
    backgroundImagesEnabled: true,
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
        'uvCumulated',
      ],
      excludeDayDuration: false,
      excludePolarNightAndMidnightSun: false,
    },
    observation: {
      enabled: true,
      updateInterval: 5,
      numberOfStations: 10,
      producer: { FI: 'observations_fmi', default: 'foreign' },
      identifier: 'fmisid',
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
      url: 'https://test.fmi.fi/snapshot',
      updateInterval: 10,
    },
  },
  warnings: {
    enabled: true,
    useCapView: false,
    updateInterval: 2,
    webViewUrl:
      'https://test.fmi.fi/weather-app-4',
    apiUrl: {
      FI: 'https://test.fmi.fi/warnings',
    },
  },
  news: {
    enabled: true,
    apiUrl: {
      fi: 'https://test.fmi.fi/news?tags=filterTagResearch,filterTagWeather',
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
    dateTime: {
      default: {
        date: 'D.M.',
        dateYear: 'D.M.YYYY',
        longDate: 'Udddd, D.M.',
        time: 'HH:mm',
        dateTime: 'D.M. HH:mm',
        longDateTime: 'D.M.YYYY HH:mm',
        weekdayAbbreviation: 'Udd',
        weekday: 'Udddd',
        weekdayAndDate: 'dddd D.M.',
        weekdayAbbreviationAndDate: 'Udd D.M.',
      },
      locales: {
        en: {
          date: 'D MMM',
          dateTime: 'D MMM HH:mm',
          weekdayAbbreviation: 'Uddd',
          weekdayAndDate: 'Udddd D MMM',
          weekdayAbbreviationAndDate: 'Uddd D MMM',
        },
      }
    },
    themes: {
      light: true,
      dark: true,
    },
    markdown: {
      termsOfUse: true,
      aboutTheApplication: true,
      accessibility: true,
    }
  },
  announcements: {
    enabled: true,
    updateInterval: 1,
    api: {
      fi: 'https://www.test.fmi.fi/mobileannouncements',
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
    email: 'mobiili@test.fmi.fi',
    subject: {
      fi: 'Ilmatieteen laitoksen sääsovelluksen palaute',
      sv: 'Respons på Meteorologiska institutets väderapplikation',
      en: 'Feedback on the Meteorological Institute weather app',
    },
    faqUrl: {
      fi: 'https://www.ilmatieteenlaitos.fi/kysymyksia_mobiilisovelluksesta',
      sv: 'https://sv.ilmatieteenlaitos.fi/fr%C3%A5gor-om-mobilapplikationen',
      en: 'https://en.ilmatieteenlaitos.fi/mobile-application-questions'
    }
  },
  analytics: {
    enabled: true,
    siteId: {
      fi: 14,
      sv: 15,
      en: 16
    },
    url: 'https://test.fmi.fi/matomo.php'
  }
};

export default defaultConfig;
