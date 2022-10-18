import React from 'react';
import { SvgProps } from 'react-native-svg';

import s1 from './symbols/1.svg';
import s2 from './symbols/2.svg';
import s4 from './symbols/4.svg';
import s6 from './symbols/6.svg';
import s7 from './symbols/7.svg';
import s9 from './symbols/9.svg';
import s11 from './symbols/11.svg';
import s24 from './symbols/24.svg';
import s27 from './symbols/27.svg';
import s31 from './symbols/31.svg';
import s32 from './symbols/32.svg';
import s33 from './symbols/33.svg';
import s34 from './symbols/34.svg';
import s35 from './symbols/35.svg';
import s36 from './symbols/36.svg';
import s37 from './symbols/37.svg';
import s38 from './symbols/38.svg';
import s39 from './symbols/39.svg';
import s61 from './symbols/61.svg';
import s71 from './symbols/71.svg';
import s74 from './symbols/74.svg';
import s77 from './symbols/77.svg';
import s101 from './symbols/101.svg';
import s102 from './symbols/102.svg';
import s104 from './symbols/104.svg';
import s106 from './symbols/106.svg';
import s124 from './symbols/124.svg';
import s131 from './symbols/131.svg';
import s132 from './symbols/132.svg';
import s133 from './symbols/133.svg';
import s134 from './symbols/134.svg';
import s135 from './symbols/135.svg';
import s136 from './symbols/136.svg';
import s161 from './symbols/161.svg';
import s171 from './symbols/171.svg';
import s174 from './symbols/174.svg';

export const symbols: WeatherSymbol = {
  '1': {
    day: s1,
    night: s101,
  },
  '2': {
    day: s2,
    night: s102,
  },
  '4': {
    day: s4,
    night: s104,
  },
  '6': {
    day: s6,
    night: s106,
  },
  '7': {
    day: s7,
    night: s7,
  },
  '9': {
    day: s9,
    night: s9,
  },
  '11': {
    day: s11,
    night: s11,
  },
  '24': {
    day: s24,
    night: s124,
  },
  '27': {
    day: s27,
    night: s27,
  },
  '31': {
    day: s31,
    night: s131,
  },
  '32': {
    day: s32,
    night: s132,
  },
  '33': {
    day: s33,
    night: s133,
  },
  '34': {
    day: s34,
    night: s134,
  },
  '35': {
    day: s35,
    night: s135,
  },
  '36': {
    day: s36,
    night: s136,
  },
  '37': {
    day: s37,
    night: s37,
  },
  '38': {
    day: s38,
    night: s38,
  },
  '39': {
    day: s39,
    night: s39,
  },
  '61': {
    day: s61,
    night: s161,
  },
  '71': {
    day: s71,
    night: s171,
  },
  '74': {
    day: s74,
    night: s174,
  },
  '77': {
    day: s77,
    night: s77,
  },
};

export type WeatherSymbol = {
  [key: string]: {
    day: React.FC<SvgProps>;
    night: React.FC<SvgProps>;
  };
};

export const weatherSymbolKeyParser = (key: string) => {
  let parsedKey = key;
  if (key.length === 3) {
    parsedKey = key.slice(1, 3);
    if (parsedKey[0] === '0') {
      parsedKey = parsedKey.slice(1, 2);
    }
  }
  return parsedKey;
};

export const weatherSymbolGetter = (key: string) => {
  const parsedKey = weatherSymbolKeyParser(key);

  // TODO: fix
  const toReturn =
    key !== parsedKey ? symbols[parsedKey]?.night : symbols[parsedKey]?.day;
  if (toReturn) {
    return toReturn;
  }
  return null;
};
