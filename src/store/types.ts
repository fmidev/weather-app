import { ForecastState } from './forecast/types';
import { SettingsState } from './settings/types';
import { GeneralState } from './general/types';

export interface State {
  settings: SettingsState;
  forecast: ForecastState;
  general: GeneralState;
}
