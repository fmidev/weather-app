export const SET_GEOLOCATION = 'SET_GEOLOCATION';

export interface Geolocation {
  latitude: number;
  longitude: number;
}

interface SetGeolocation {
  type: typeof SET_GEOLOCATION;
  geolocation: Geolocation;
}

export type GeneralActionTypes = SetGeolocation;

export interface GeneralState {
  geolocation?: Geolocation;
}
