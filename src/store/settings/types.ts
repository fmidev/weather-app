export const INIT_SETTINGS = 'INIT_SETTINGS';
export const UPDATE_UNITS = 'UPDATE_UNITS';
export const UPDATE_THEME = 'UPDATE_THEME';

export type Units = {
  temperature: 'C' | 'F';
  precipitation: 'mm' | 'in';
  wind: 'm/s' | 'km/h' | 'mph' | 'bft' | 'kn';
  pressure: 'hPa' | 'inHg' | 'mmHg' | 'mbar';
};

export type ValueOf<T> = T[keyof T];

interface InitSettings {
  type: typeof INIT_SETTINGS;
  units: Units;
  theme: Theme;
}

interface UpdateUnits {
  type: typeof UPDATE_UNITS;
  param: keyof Units;
  unit: ValueOf<Units>;
}

interface UpdateTheme {
  type: typeof UPDATE_THEME;
  theme: Theme;
}

export type Theme = 'light' | 'dark' | 'automatic';

export type SettingsActionTypes = InitSettings | UpdateUnits | UpdateTheme;

export interface SettingsState {
  units: Partial<Units> | undefined;
  theme: Theme;
}
