export const INIT_SETTINGS = 'INIT_SETTINGS';
export const UPDATE_UNITS = 'UPDATE_UNITS';
export const UPDATE_THEME = 'UPDATE_THEME';

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
}

interface UpdateUnits {
  type: typeof UPDATE_UNITS;
  units: UnitMap;
}

interface UpdateTheme {
  type: typeof UPDATE_THEME;
  theme: Theme;
}

export type Theme = 'light' | 'dark' | 'automatic';

export type SettingsActionTypes = InitSettings | UpdateUnits | UpdateTheme;

export interface SettingsState {
  units: UnitMap | undefined;
  theme: Theme;
}
