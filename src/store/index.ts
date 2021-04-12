import { combineReducers } from 'redux';
import SettingsReducer from './settings/reducer';
import ForecastReducer from './forecast/reducer';
import GeneralReducer from './general/reducer';
import MapReducer from './map/reducer';

export default combineReducers({
  settings: SettingsReducer,
  forecast: ForecastReducer,
  general: GeneralReducer,
  map: MapReducer,
});
