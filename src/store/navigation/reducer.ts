import { PersistConfig } from '@store/types';
import {
  NavigationState,
  NavigationActionTypes,
  SET_NAVIGATION_TAB,
} from './types';

const INITIAL_STATE: NavigationState = {
  tab: 'Map',
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

    default: {
      return state;
    }
  }
};

export const navigationPersist: PersistConfig = {
  key: 'navigation',
  whitelist: ['tab'],
};
