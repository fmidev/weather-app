import { ForecastState } from './forecast/types';
import { SettingsState } from './settings/types';

export interface State {
  settings: SettingsState;
  forecast: ForecastState;
}
