import { Location } from '../settings/types';

export const SET_GEOLOCATION = 'SET_GEOLOCATION';
export const SET_ACTIVE_LOCATION = 'SET_ACTIVE_LOCATION';

export interface Geolocation {
  latitude: number;
  longitude: number;
}

interface SetGeolocation {
  type: typeof SET_GEOLOCATION;
  geolocation: Geolocation;
}

interface SetActiveLocation {
  type: typeof SET_ACTIVE_LOCATION;
  location: Location | undefined;
}

export type GeneralActionTypes = SetGeolocation | SetActiveLocation;

export interface GeneralState {
  geolocation?: Geolocation;
  activeLocation?: Location | undefined;
}
