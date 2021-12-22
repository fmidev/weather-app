import { Dispatch } from 'redux';

import {
  NavigationActionTypes,
  NavigationTab,
  SET_NAVIGATION_TAB,
} from './types';

export const setNavigationTab =
  (tab: NavigationTab) => (dispatch: Dispatch<NavigationActionTypes>) => {
    dispatch({ type: SET_NAVIGATION_TAB, tab });
  };

export const setWeatherPanelStates = () => {};
