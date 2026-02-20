export const UPDATE_CLOCK_TYPE = 'UPDATE_CLOCK_TYPE';
export const INIT_SETTINGS = 'INIT_SETTINGS';
export const UPDATE_UNITS = 'UPDATE_UNITS';
export const UPDATE_THEME = 'UPDATE_THEME';
export const UPDATE_MAP_LIBRARY = 'UPDATE_MAP_LIBRARY';

export type ClockType = 12 | 24;

interface UpdateClockType {
  type: typeof UPDATE_CLOCK_TYPE;
  clockType: ClockType;
}

export type UnitType = {
  unitId: number;
  unitAbb: string;
  unit: string;
  unitPrecision: number;
};
export interface UnitMap {
  [key: string]: UnitType;
}

interface InitSettings {
  type: typeof INIT_SETTINGS;
  units: UnitMap | undefined;
  theme: Theme;
  clockType: ClockType;
}

interface UpdateUnits {
  type: typeof UPDATE_UNITS;
  units: UnitMap;
}

interface UpdateTheme {
  type: typeof UPDATE_THEME;
  theme: Theme;
}

interface UpdateMapLibrary {
  type: typeof UPDATE_MAP_LIBRARY;
  library: MapLibrary;
}

export type Theme = 'light' | 'dark' | 'automatic';
export type MapLibrary = 'react-native-maps' | 'maplibre';

export type SettingsActionTypes =
  | InitSettings
  | UpdateUnits
  | UpdateTheme
  | UpdateClockType
  | UpdateMapLibrary;

export interface SettingsState {
  clockType?: ClockType;
  units: UnitMap | undefined;
  theme?: Theme;
  mapLibrary: MapLibrary;
}
