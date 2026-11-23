import { PersistConfig } from '@store/types';
import type { PersistConfig as ReduxPersistConfig } from 'redux-persist';
import { getDefaultUnits } from '@utils/units';
import defaultConfig from '../../../defaultConfig';
import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsState,
  SettingsActionTypes,
  UPDATE_CLOCK_TYPE,
  UPDATE_FORECAST_BACKGROUND_IMAGES,
  SET_IS_RUNNING_ON_MAC,
} from './types';

const SESSION_ID_MAX = 10_000_000;

export const generateSessionId = () =>
  Math.floor(Math.random() * SESSION_ID_MAX) + 1;

const INITIAL_STATE: SettingsState = {
  units: getDefaultUnits(),
  theme: undefined,
  clockType: undefined,
  forecastBackgroundImages: defaultConfig.weather.backgroundImagesEnabled ?? true,
  sessionId: generateSessionId(),
  isRunningOnMac: false,
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

    case SET_IS_RUNNING_ON_MAC: {
      return {
        ...state,
        isRunningOnMac: action.isRunningOnMac,
      };
    }

    case UPDATE_FORECAST_BACKGROUND_IMAGES: {
      return {
        ...state,
        forecastBackgroundImages: action.enabled,
      };
    }

    default: {
      return state;
    }
  }
};

export const settingsPersist: PersistConfig &
  Pick<ReduxPersistConfig<SettingsState>, 'migrate'> = {
  key: 'settings',
  whitelist: [
    'theme',
    'clockType',
    'units',
    'forecastBackgroundImages',
  ],
  migrate: async (state) => {
    if (!state) return state;

    // Removing a key from the whitelist alone does not prevent its rehydration.
    const settings = { ...state } as typeof state & { mapLibrary?: unknown };
    delete settings.mapLibrary;
    return settings;
  },
};
