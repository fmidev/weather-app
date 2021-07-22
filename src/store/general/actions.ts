import { Dispatch } from 'redux';
import {
  SET_GEOLOCATION,
  SET_CURRENT_LOCATION,
  Geolocation,
  GeneralActionTypes,
} from './types';
import { Location } from '../settings/types';

export const setGeolocation = (geolocation: Geolocation) => (
  dispatch: Dispatch<GeneralActionTypes>
) => {
  dispatch({ type: SET_GEOLOCATION, geolocation });
};

export const setCurrentLocation = (
  location: Location,
  isGeolocation?: boolean
) => (dispatch: Dispatch<GeneralActionTypes>) => {
  dispatch({ type: SET_CURRENT_LOCATION, location, isGeolocation });
};
