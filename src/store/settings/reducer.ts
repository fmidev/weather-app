import { PersistConfig } from '@store/types';
import { getDefaultUnits } from '@utils/units';
import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsState,
  SettingsActionTypes,
  UPDATE_CLOCK_TYPE,
} from './types';

const INITIAL_STATE: SettingsState = {
  units: getDefaultUnits(),
  theme: undefined,
  clockType: undefined,
};

export default (
  // eslint-disable-next-line @typescript-eslint/default-param-last
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

    case UPDATE_CLOCK_TYPE: {
      return {
        ...state,
        clockType: action.clockType,
      };
    }

    default: {
      return state;
    }
  }
};

export const settingsPersist: PersistConfig = {
  key: 'settings',
  whitelist: ['theme', 'clockType', 'units'],
};
