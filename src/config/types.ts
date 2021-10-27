import { Location } from '@store/location/types';

interface Layer {
  id: string | number;
  name: { [lang: string]: string };
  legend: string;
  sources: {
    source: string;
    layer: string;
    type: 'observation' | 'forecast';
  }[];

  times: { [timeStep: string]: { forecast?: number; observation?: number } };
}

interface Observation {
  numberOfStations: number;
  producer: string;
  timePeriod: number;
  parameters: string[];
}

interface ObservationEnabled extends Observation {
  enabled: true;
}

interface ObservationDisabled extends Partial<Observation> {
  enabled: false;
}

interface Warnings {
  apiUrl: string;
  webViewUrl?: string;
}

interface WarningsEnabled extends Warnings {
  enabled: true;
}

interface WarningsDisabled extends Partial<Warnings> {
  enabled: false;
}

interface DynamicConfig {
  readonly apiUrl: string;
  interval: number;
}

interface DynamicConfigEnabled extends DynamicConfig {
  enabled: true;
}

interface DynamicConfigDisabled extends Partial<DynamicConfig> {
  enabled: false;
}

export interface ConfigType {
  dynamicConfig: DynamicConfigEnabled | DynamicConfigDisabled;
  location: {
    default: Location;
    apiUrl: string;
    keyword: string;
    maxRecent: number;
    maxFavorite: number;
  };
  map: {
    latitudeDelta: number;
    sources: { [name: string]: string };
    layers: Layer[];
  };
  weather: {
    apiUrl: string;
    forecast: {
      timePeriod: number | 'data';
      producer: string;
      parameters: string[];
    };
    observation: ObservationEnabled | ObservationDisabled;
  };
  warnings: WarningsEnabled | WarningsDisabled;
  settings: {
    languages: string[];
    units: {
      [type: string]: string[];
    };
  };
}
