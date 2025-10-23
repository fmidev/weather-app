import { PersistConfig } from '@store/types';
import {
  NavigationState,
  NavigationActionTypes,
  SET_NAVIGATION_TAB,
  SET_DID_LAUNCH_APP,
} from './types';
import packageJSON from '../../../package.json';

const INITIAL_STATE: NavigationState = {
  tab: 'Weather',
  didLaunchApp: false,
  termsOfUseAccepted: false,
};

export default (
  state = INITIAL_STATE,
  action: NavigationActionTypes
): NavigationState => {
  switch (action.type) {
    case SET_NAVIGATION_TAB: {
      return {
        ...state,
        tab: action.tab,
      };
    }

    case SET_DID_LAUNCH_APP: {
      return {
        ...state,
        didLaunchApp: true,
        termsOfUseAccepted: packageJSON.version,
      };
    }

    default: {
      return state;
    }
  }
};

export const navigationPersist: PersistConfig = {
  key: 'navigation',
  whitelist: ['tab', 'didLaunchApp', 'termsOfUseAccepted'],
};
