import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsState,
  SettingsActionTypes,
  INIT_SETTINGS,
} from './types';

const INITIAL_STATE: SettingsState = {
  units: undefined,
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
        units: action.units,
      };
    }

    case UPDATE_THEME: {
      return {
        ...state,
        theme: action.theme,
      };
    }

    case INIT_SETTINGS: {
      return {
        ...state,
        units: action.units,
        theme: action.theme,
      };
    }

    default: {
      return state;
    }
  }
};
