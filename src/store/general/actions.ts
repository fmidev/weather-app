import { Dispatch } from 'redux';
import { SET_GEOLOCATION, Geolocation, GeneralActionTypes } from './types';

export const setGeolocation = (geolocation: Geolocation) => (
  dispatch: Dispatch<GeneralActionTypes>
) => {
  dispatch({ type: SET_GEOLOCATION, geolocation });
};
