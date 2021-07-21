import { Location } from '../settings/types';

export const SET_GEOLOCATION = 'SET_GEOLOCATION';
export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';

export interface Geolocation {
  latitude: number;
  longitude: number;
}

interface SetGeolocation {
  type: typeof SET_GEOLOCATION;
  geolocation: Geolocation;
}

interface SetCurrentLocation {
  type: typeof SET_CURRENT_LOCATION;
  location: Location;
}

export type GeneralActionTypes = SetGeolocation | SetCurrentLocation;

export interface GeneralState {
  geolocation?: Geolocation;
  currentLocation?: Location;
}
