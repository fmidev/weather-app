import { ForecastState } from './forecast/types';
import { ObservationState } from './observation/types';
import { SettingsState } from './settings/types';
import { MapState } from './map/types';
import { LocationState } from './location/types';
import { NavigationState } from './navigation/types';
import { WarningsState } from './warnings/types';
import { AnnouncementsState } from './announcements/types';
import { MeteorologistState } from './meteorologist/types';
import { NewsState } from './news/types';

export interface State {
  settings: SettingsState;
  forecast: ForecastState;
  observation: ObservationState;
  map: MapState;
  location: LocationState;
  navigation: NavigationState;
  warnings: WarningsState;
  announcements: AnnouncementsState;
  meteorologist: MeteorologistState;
  news: NewsState;
}

export interface PersistConfig {
  key: string;
  whitelist: string[];
}