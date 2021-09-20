import { PersistConfig } from '@store/types';
import { getDefaultUnits } from '@utils/units';
import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsState,
  SettingsActionTypes,
} from './types';

const INITIAL_STATE: SettingsState = {
  units: getDefaultUnits(),
  theme: 'automatic',
};

export default (
  state = INITIAL_STATE,
  action: SettingsActionTypes
): SettingsState => {
  switch (action.type) {
    case UPDATE_UNITS: {
      return {
        ...state,
        units: { ...state.units, ...action.units },
      };
    }

    case UPDATE_THEME: {
      return {
        ...state,
        theme: action.theme,
      };
    }

    default: {
      return state;
    }
  }
};

export const settingsPersist: PersistConfig = {
  key: 'settings',
  whitelist: ['theme'],
};
