import { ImageURISource } from 'react-native';

export const images = {
  symbols: {
    '1': {
      day: require('./symbols/1.png'),
      night: require('./symbols/101.png'),
      description: {
        en: 'clear',
        fi: 'selkeää',
      },
    },
    '2': {
      day: require('./symbols/2.png'),
      night: require('./symbols/102.png'),
      description: { en: 'mostly clear', fi: 'enimmäkseen selkeää' },
    },
    '4': {
      day: require('./symbols/4.png'),
      night: require('./symbols/104.png'),
      description: { en: 'partly cloudy', fi: 'puolipilvistä' },
    },
    '6': {
      day: require('./symbols/6.png'),
      night: require('./symbols/106.png'),
      description: { en: 'mostly cloudy', fi: 'enimmäkseen pilvistä' },
    },
    '7': {
      day: require('./symbols/7.png'),
      night: require('./symbols/107.png'),
      description: { en: 'overcast', fi: 'pilvistä' },
    },
    '9': {
      day: require('./symbols/9.png'),
      night: require('./symbols/109.png'),
      description: { en: 'fog', fi: 'sumua' },
    },
    '11': {
      day: require('./symbols/11.png'),
      night: require('./symbols/111.png'),
      description: { en: 'drizzle', fi: 'tihkusadetta' },
    },
    '14': {
      day: require('./symbols/14.png'),
      night: require('./symbols/114.png'),
      description: { en: 'freezing drizzle', fi: 'jäätävää tihkua' },
    },
    '17': {
      day: require('./symbols/17.png'),
      night: require('./symbols/117.png'),
      description: { en: 'freezing rain', fi: 'jäätävää sadetta' },
    },
    '21': {
      day: require('./symbols/21.png'),
      night: require('./symbols/121.png'),
      description: { en: 'isolated showers', fi: 'yksittäisiä sadekuuroja' },
    },
    '24': {
      day: require('./symbols/24.png'),
      night: require('./symbols/124.png'),
      description: { en: 'scattered showers', fi: 'paikoin sadekuuroja' },
    },
    '27': {
      day: require('./symbols/27.png'),
      night: require('./symbols/127.png'),
      description: { en: 'showers', fi: 'sadekuuroja' },
    },
    '31': {
      day: require('./symbols/31.png'),
      night: require('./symbols/131.png'),
      description: {
        en: 'partly cloudy and periods of light rain',
        fi: 'puolipilvistä ja ajoittain heikkoa vesisadetta',
      },
    },
    '32': {
      day: require('./symbols/32.png'),
      night: require('./symbols/132.png'),
      description: {
        en: 'partly cloudy and periods of moderate rain',
        fi: 'puolipilvistä ja ajoittain kohtalaista vesisadetta',
      },
    },
    '33': {
      day: require('./symbols/33.png'),
      night: require('./symbols/133.png'),
      description: {
        en: 'partly cloudy and periods of heavy rain',
        fi: 'puolipilvistä ja ajoittain voimakasta vesisadetta',
      },
    },
    '34': {
      day: require('./symbols/34.png'),
      night: require('./symbols/134.png'),
      description: {
        en: 'mostly cloudy and periods of light rain',
        fi: 'enimmäkseen pilvistä ja ajoittain heikkoa vesisadetta',
      },
    },
    '35': {
      day: require('./symbols/35.png'),
      night: require('./symbols/135.png'),
      description: {
        en: 'mostly cloudy and periods of moderate rain',
        fi: 'enimmäkseen pilvistä ja ajoittain kohtalaista vesisadetta',
      },
    },
    '36': {
      day: require('./symbols/36.png'),
      night: require('./symbols/136.png'),
      description: {
        en: 'mostly cloudy and periods of heavy rain',
        fi: 'enimmäkseen pilvistä ja ajoittain voimakasta vesisadetta',
      },
    },
    '37': {
      day: require('./symbols/37.png'),
      night: require('./symbols/137.png'),
      description: { en: 'light rain', fi: 'heikkoa vesisadetta' },
    },
    '38': {
      day: require('./symbols/38.png'),
      night: require('./symbols/138.png'),
      description: { en: 'moderate rain', fi: 'kohtalaista vesisadetta' },
    },
    '39': {
      day: require('./symbols/39.png'),
      night: require('./symbols/139.png'),
      description: { en: 'heavy rain', fi: 'voimakasta vesisadetta' },
    },
    '41': {
      day: require('./symbols/41.png'),
      night: require('./symbols/141.png'),
      description: {
        en: 'isolated light sleet showers',
        fi: 'puolipilvistä ja ajoittain heikkoa räntäsadetta tai räntäkuuroja',
      },
    },
    '42': {
      day: require('./symbols/42.png'),
      night: require('./symbols/142.png'),
      description: {
        en: 'isolated moderate sleet showers',
        fi:
          'puolipilvistä ja ajoittain kohtalaista räntäsadetta tai räntäkuuroja',
      },
    },
    '43': {
      day: require('./symbols/43.png'),
      night: require('./symbols/143.png'),
      description: {
        en: 'isolated heavy sleet showers',
        fi:
          'puolipilvistä ja ajoittain voimakasta räntäsadetta tai räntäkuuroja',
      },
    },
    '44': {
      day: require('./symbols/44.png'),
      night: require('./symbols/144.png'),
      description: {
        en: 'scattered light sleet showers',
        fi:
          'enimmäkseen pilvistä ja ajoittain heikkoa räntäsadetta tai räntäkuuroja',
      },
    },
    '45': {
      day: require('./symbols/45.png'),
      night: require('./symbols/145.png'),
      description: {
        en: 'scattered moderate sleet showers',
        fi:
          'enimmäkseen pilvistä ja ajoittain kohtalaista räntäsadetta tai räntäkuuroja',
      },
    },
    '46': {
      day: require('./symbols/46.png'),
      night: require('./symbols/146.png'),
      description: {
        en: 'scattered heavy sleet showers',
        fi:
          'enimmäkseen pilvistä ja ajoittain voimakasta räntäsadetta tai räntäkuuroja',
      },
    },
    '47': {
      day: require('./symbols/47.png'),
      night: require('./symbols/147.png'),
      description: { en: 'light sleet', fi: 'heikkoa räntäsadetta' },
    },
    '48': {
      day: require('./symbols/48.png'),
      night: require('./symbols/148.png'),
      description: { en: 'moderate sleet', fi: 'kohtalaista räntäsadetta' },
    },
    '49': {
      day: require('./symbols/49.png'),
      night: require('./symbols/149.png'),
      description: { en: 'heavy sleet', fi: 'voimakasta räntäsadetta' },
    },
    '51': {
      day: require('./symbols/51.png'),
      night: require('./symbols/151.png'),
      description: {
        en: 'isolated light snow showers',
        fi: 'puolipilvistä ja ajoittain heikkoa lumisadetta tai lumikuuroja',
      },
    },
    '52': {
      day: require('./symbols/52.png'),
      night: require('./symbols/152.png'),
      description: {
        en: 'isolated moderate snow showers',
        fi:
          'puolipilvistä ja ajoittain kohtalaista lumisadetta tai lumikuuroja',
      },
    },
    '53': {
      day: require('./symbols/53.png'),
      night: require('./symbols/153.png'),
      description: {
        en: 'isolated heavy snow showers',
        fi: 'puolipilvistä ja ajoittain voimakasta lumisadetta tai lumikuuroja',
      },
    },
    '54': {
      day: require('./symbols/54.png'),
      night: require('./symbols/154.png'),
      description: {
        en: 'scattered light snow showers',
        fi:
          'enimmäkseen pilvistä ja ajoittain heikkoa lumisadetta tai lumikuuroja',
      },
    },
    '55': {
      day: require('./symbols/55.png'),
      night: require('./symbols/155.png'),
      description: {
        en: 'scattered moderate snow showers',
        fi:
          'enimmäkseen pilvistä ja ajoittain kohtalaista lumisadetta tai lumikuuroja',
      },
    },
    '56': {
      day: require('./symbols/56.png'),
      night: require('./symbols/156.png'),
      description: {
        en: 'scattered heavy snow showers',
        fi:
          'enimmäkseen pilvistä ja ajoittain voimakasta lumisadetta tai lumikuuroja',
      },
    },
    '57': {
      day: require('./symbols/57.png'),
      night: require('./symbols/157.png'),
      description: { en: 'light snowfall', fi: 'heikkoa lumisadetta' },
    },
    '58': {
      day: require('./symbols/58.png'),
      night: require('./symbols/158.png'),
      description: { en: 'moderate snowfall', fi: 'kohtalaista lumisadetta' },
    },
    '59': {
      day: require('./symbols/59.png'),
      night: require('./symbols/159.png'),
      description: { en: 'heavy snowfall', fi: 'runsasta lumisadetta' },
    },
    '61': {
      day: require('./symbols/61.png'),
      night: require('./symbols/161.png'),
      description: {
        en: 'isolated hail showers',
        fi: 'yksittäisiä raekuuroja',
      },
    },
    '64': {
      day: require('./symbols/64.png'),
      night: require('./symbols/164.png'),
      description: { en: 'scattered hail showers', fi: 'paikoin raekuuroja' },
    },
    '67': {
      day: require('./symbols/67.png'),
      night: require('./symbols/167.png'),
      description: { en: 'hail showers', fi: 'reakuuroja' },
    },
    '71': {
      day: require('./symbols/71.png'),
      night: require('./symbols/171.png'),
      description: {
        en: 'isolated thundershowers',
        fi: 'yksittäisiä ukkoskuuroja',
      },
    },
    '74': {
      day: require('./symbols/74.png'),
      night: require('./symbols/174.png'),
      description: {
        en: 'scattered thundershowers',
        fi: 'paikoin ukkoskuuroja',
      },
    },
    '77': {
      day: require('./symbols/77.png'),
      night: require('./symbols/177.png'),
      description: { en: 'thundershowers', fi: 'ukkoskuuroja' },
    },
  },
};

export type WeatherSymbol = {
  day: ImageURISource;
  night: ImageURISource;
  description: {
    en: string;
    fi: string;
  };
};
