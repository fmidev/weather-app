import { Dispatch } from 'redux';
import {
  SET_GEOLOCATION,
  SET_ACTIVE_LOCATION,
  Geolocation,
  GeneralActionTypes,
} from './types';
import { Location } from '../settings/types';

export const setGeolocation = (geolocation: Geolocation) => (
  dispatch: Dispatch<GeneralActionTypes>
) => {
  dispatch({ type: SET_GEOLOCATION, geolocation });
};

export const setActiveLocation = (location: Location | undefined) => (
  dispatch: Dispatch<GeneralActionTypes>
) => {
  dispatch({ type: SET_ACTIVE_LOCATION, location });
};
