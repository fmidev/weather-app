import { ImageURISource } from 'react-native';

export const images = {
  symbols: {
    '1': {
      day: require('./symbols/1.png'),
      night: require('./symbols/101.png'),
    },
    '2': {
      day: require('./symbols/2.png'),
      night: require('./symbols/102.png'),
    },
    '4': {
      day: require('./symbols/4.png'),
      night: require('./symbols/104.png'),
    },
    '6': {
      day: require('./symbols/6.png'),
      night: require('./symbols/106.png'),
    },
    '7': {
      day: require('./symbols/7.png'),
      night: require('./symbols/107.png'),
    },
    '9': {
      day: require('./symbols/9.png'),
      night: require('./symbols/109.png'),
    },
    '11': {
      day: require('./symbols/11.png'),
      night: require('./symbols/111.png'),
    },
    '14': {
      day: require('./symbols/14.png'),
      night: require('./symbols/114.png'),
    },
    '17': {
      day: require('./symbols/17.png'),
      night: require('./symbols/117.png'),
    },
    '21': {
      day: require('./symbols/21.png'),
      night: require('./symbols/121.png'),
    },
    '24': {
      day: require('./symbols/24.png'),
      night: require('./symbols/124.png'),
    },
    '27': {
      day: require('./symbols/27.png'),
      night: require('./symbols/127.png'),
    },
    '31': {
      day: require('./symbols/31.png'),
      night: require('./symbols/131.png'),
    },
    '32': {
      day: require('./symbols/32.png'),
      night: require('./symbols/132.png'),
    },
    '33': {
      day: require('./symbols/33.png'),
      night: require('./symbols/133.png'),
    },
    '34': {
      day: require('./symbols/34.png'),
      night: require('./symbols/134.png'),
    },
    '35': {
      day: require('./symbols/35.png'),
      night: require('./symbols/135.png'),
    },
    '36': {
      day: require('./symbols/36.png'),
      night: require('./symbols/136.png'),
    },
    '37': {
      day: require('./symbols/37.png'),
      night: require('./symbols/137.png'),
    },
    '38': {
      day: require('./symbols/38.png'),
      night: require('./symbols/138.png'),
      description: { en: 'moderate rain', fi: 'kohtalaista vesisadetta' },
    },
    '39': {
      day: require('./symbols/39.png'),
      night: require('./symbols/139.png'),
    },
    '41': {
      day: require('./symbols/41.png'),
      night: require('./symbols/141.png'),
    },
    '42': {
      day: require('./symbols/42.png'),
      night: require('./symbols/142.png'),
    },
    '43': {
      day: require('./symbols/43.png'),
      night: require('./symbols/143.png'),
    },
    '44': {
      day: require('./symbols/44.png'),
      night: require('./symbols/144.png'),
    },
    '45': {
      day: require('./symbols/45.png'),
      night: require('./symbols/145.png'),
    },
    '46': {
      day: require('./symbols/46.png'),
      night: require('./symbols/146.png'),
    },
    '47': {
      day: require('./symbols/47.png'),
      night: require('./symbols/147.png'),
    },
    '48': {
      day: require('./symbols/48.png'),
      night: require('./symbols/148.png'),
    },
    '49': {
      day: require('./symbols/49.png'),
      night: require('./symbols/149.png'),
    },
    '51': {
      day: require('./symbols/51.png'),
      night: require('./symbols/151.png'),
    },
    '52': {
      day: require('./symbols/52.png'),
      night: require('./symbols/152.png'),
    },
    '53': {
      day: require('./symbols/53.png'),
      night: require('./symbols/153.png'),
    },
    '54': {
      day: require('./symbols/54.png'),
      night: require('./symbols/154.png'),
    },
    '55': {
      day: require('./symbols/55.png'),
      night: require('./symbols/155.png'),
    },
    '56': {
      day: require('./symbols/56.png'),
      night: require('./symbols/156.png'),
    },
    '57': {
      day: require('./symbols/57.png'),
      night: require('./symbols/157.png'),
    },
    '58': {
      day: require('./symbols/58.png'),
      night: require('./symbols/158.png'),
    },
    '59': {
      day: require('./symbols/59.png'),
      night: require('./symbols/159.png'),
    },
    '61': {
      day: require('./symbols/61.png'),
      night: require('./symbols/161.png'),
    },
    '64': {
      day: require('./symbols/64.png'),
      night: require('./symbols/164.png'),
    },
    '67': {
      day: require('./symbols/67.png'),
      night: require('./symbols/167.png'),
    },
    '71': {
      day: require('./symbols/71.png'),
      night: require('./symbols/171.png'),
    },
    '74': {
      day: require('./symbols/74.png'),
      night: require('./symbols/174.png'),
    },
    '77': {
      day: require('./symbols/77.png'),
      night: require('./symbols/177.png'),
    },
  },
};

export type WeatherSymbol = {
  day: ImageURISource;
  night: ImageURISource;
  key: string;
};
