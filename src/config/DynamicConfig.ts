import axiosClient from '@utils/axiosClient';
import { ConfigType } from './types';

class DynamicConfig {
  private config!: ConfigType;

  private apiUrl: string | undefined;

  private timeout: number;

  private updating: boolean;

  private updated: number;

  constructor() {
    this.apiUrl = undefined;
    this.updating = false;
    this.updated = 0;
    this.timeout = 5000;
  }

  public setDefaultConfig(defaultConfig: ConfigType) {
    this.config = defaultConfig;
    if (defaultConfig.dynamicConfig?.enabled) {
      let apiUrl = defaultConfig.dynamicConfig.apiUrl;
      // add cache buster to the url
      const cacheBuster = this.generateCachebuster();
      apiUrl = `${apiUrl}?cacheBuster=${cacheBuster}`;

      this.setApiUrl(apiUrl);
    }
  }

  private setApiUrl(ulr: string | undefined) {
    if (ulr) {
      this.apiUrl = ulr;
    }
  }

  public setApiTimeout(milliseconds: number) {
    this.timeout = milliseconds;
  }

  public setUpdated(time: number) {
    this.updated = time;
  }

  public getUpdated() {
    return this.updated;
  }

  public getUpdatingStatus() {
    return this.updating;
  }

  public get<K extends keyof ConfigType>(category: K): ConfigType[K] {
    return this.config[category];
  }

  public getAll() {
    return this.config;
  }

  private generateCachebuster() {
    let lastUpdated = this.updated;

    // first load doesn't have updated time
    if (lastUpdated === 0) {
      lastUpdated = Date.now();
    }

    let interval = this.config?.dynamicConfig?.interval; // in minutes, mandatory value in config.
    if (interval) {
      // convert to milliseconds
      interval = interval * 60000;
    } else {
      // should never come here, but just in case...
      interval = 300000; // 5 mins
    }

    return lastUpdated + interval;
  }

  public async update() {
    if (!this.apiUrl) {
      return;
    }

    this.updating = true;

    try {
      const { data } = await axiosClient({
        url: this.apiUrl,
        timeout: this.timeout,
      });
      if (data) {
        this.config = DynamicConfig.mergeObject(this.config, data);
      }
    } catch (error) {
      console.log(error);
    }

    // set updated time
    this.setUpdated(Date.now());

    this.updating = false;
  }

  static mergeObject(target: any, ...sources: any[]): any {
    if (!sources.length) {
      return target;
    }
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(target[key])) {
          if (isObject(source[key])) {
            if (target[key]) {
              DynamicConfig.mergeObject(target[key], source[key]);
            }
          }
        } else if (isArray(target[key])) {
          if (isArray(source[key])) {
            Object.assign(target, {
              [key]: DynamicConfig.mergeArrays(target[key], source[key]),
            });
          }
        } else if (typeof target[key] === typeof source[key]) {
          Object.assign(target, { [key]: source[key] });
        } else if (typeof target[key] === 'undefined') {
          Object.assign(target, { [key]: source[key] });
        }
      });
    }
    return DynamicConfig.mergeObject(target, ...sources);
  }

  static mergeArrays(target: any[], source: any[]) {
    const map = new Map();
    const mapKeys = ['id', 'name', 'layer'];
    const mapKeyTypes = ['string', 'number'];

    const key = Object.keys(target[0] || {}).find(
      (k) => mapKeys.includes(k) && mapKeyTypes.includes(typeof target[0][k])
    );

    [...target, ...source].forEach((item) => {
      if (!isObject(item)) {
        map.set({}, item);
      } else if (!key) {
        DynamicConfig.mergeObject(target, source).forEach((element: {}) => {
          map.set({}, element);
        });
      } else if (item[key]) {
        if (!map.has(item[key])) {
          map.set(item[key], item);
        } else {
          map.set(
            item[key],
            DynamicConfig.mergeObject({ ...map.get(item[key]) }, item)
          );
        }
      }
    });

    return [...new Set(map.values())];
  }
}

const isObject = (item: any): Boolean => {
  const type = typeof item;
  return (
    item != null && (type === 'object' || type === 'function') && !isArray(item)
  );
};

const isArray = (item: any): Boolean => Array.isArray(item);

const Config = new DynamicConfig();

export { Config };
export default DynamicConfig;
