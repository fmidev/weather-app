import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

import SettingsReducer, { settingsPersist } from './settings/reducer';
import ForecastReducer, { forecastPersist } from './forecast/reducer';
import ObservationReducer, { observationPersist } from './observation/reducer';
import MapReducer, { mapPersist } from './map/reducer';
import LocationReducer, { locationPersist } from './location/reducer';
import NavigationReducer, { navigationPersist } from './navigation/reducer';
import WarningsReducer, { warningsPersist } from './warnings/reducer';
import AnnouncementsReducer, { announcementsPersist } from './announcements/reducer';
import MeteorologistReducer, { meteorologistPersist } from './meteorologist/reducer';
import NewsReducer, { newsPersist } from './news/reducer';

import { PersistConfig } from './types';
import { SharedReduxStorage } from '@store/SharedReduxStorage';
import { reduxMMKVStorage } from '@store/mmkvStorage';

const persistReducerConfig = (config: PersistConfig) => ({
  ...config,
  storage: AsyncStorage,
});

const sharedReducerConfig = (config: PersistConfig) => ({
  ...config,
  storage: SharedReduxStorage,
});

const mmkvReducerConfig = (config: PersistConfig) => ({
  ...config,
  storage: reduxMMKVStorage,
});

export default combineReducers({
  settings: persistReducer(
    persistReducerConfig(settingsPersist),
    SettingsReducer
  ),
  forecast: persistReducer(
    persistReducerConfig(forecastPersist),
    ForecastReducer
  ),
  observation: persistReducer(
    mmkvReducerConfig(observationPersist),
    ObservationReducer
  ),
  location: persistReducer(
    sharedReducerConfig(locationPersist),
    LocationReducer
  ),
  map: persistReducer(persistReducerConfig(mapPersist), MapReducer),
  navigation: persistReducer(
    persistReducerConfig(navigationPersist),
    NavigationReducer
  ),
  warnings: persistReducer(
    persistReducerConfig(warningsPersist),
    WarningsReducer
  ),
  announcements: persistReducer(
    persistReducerConfig(announcementsPersist),
    AnnouncementsReducer
  ),
  meteorologist: persistReducer(
    persistReducerConfig(meteorologistPersist),
    MeteorologistReducer
  ),
  news: persistReducer(
    mmkvReducerConfig(newsPersist),
    NewsReducer
  ),
});
