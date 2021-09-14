import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';
import SettingsReducer from './settings/reducer';
import ForecastReducer from './forecast/reducer';
import ObservationReducer from './observation/reducer';
import GeneralReducer from './general/reducer';
import MapReducer from './map/reducer';
import { PersistConfig } from './types';

const persistReducerConfig = (config: PersistConfig) => ({
  ...config,
  storage: AsyncStorage,
});

export default combineReducers({
  settings: SettingsReducer,
  forecast: ForecastReducer,
  observation: ObservationReducer,
  general: GeneralReducer,
  map: MapReducer,
});
