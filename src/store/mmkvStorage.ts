import { MMKV } from 'react-native-mmkv';
import type { Storage } from 'redux-persist';

const mmkv = new MMKV();

export const reduxMMKVStorage: Storage = {
  setItem: (key, value) => {
    mmkv.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const v = mmkv.getString(key);
    return Promise.resolve(v);
  },
  removeItem: (key) => {
    mmkv.delete(key);
    return Promise.resolve();
  },
};
