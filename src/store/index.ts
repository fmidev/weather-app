import { combineReducers } from 'redux';
import SettingsReducer from './settings/reducer';
import ForecastReducer from './forecast/reducer';

export default combineReducers({
  settings: SettingsReducer,
  forecast: ForecastReducer,
});
