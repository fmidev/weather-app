import { ForecastState } from './forecast/types';
import { ObservationState } from './observation/types';
import { SettingsState } from './settings/types';
import { GeneralState } from './general/types';
import { MapState } from './map/types';

export interface State {
  settings: SettingsState;
  forecast: ForecastState;
  observation: ObservationState;
  general: GeneralState;
  map: MapState;
}

export interface PersistConfig {
  key: string;
  whitelist: string[];
}
