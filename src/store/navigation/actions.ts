import { Dispatch } from 'redux';

import {
  NavigationActionTypes,
  NavigationTab,
  SET_DID_LAUNCH_APP,
  SET_NAVIGATION_TAB,
} from './types';

export const setNavigationTab =
  (tab: NavigationTab) => (dispatch: Dispatch<NavigationActionTypes>) => {
    dispatch({ type: SET_NAVIGATION_TAB, tab });
  };

export const setDidLaunchApp =
  () => (dispatch: Dispatch<NavigationActionTypes>) => {
    dispatch({ type: SET_DID_LAUNCH_APP });
  };

export const setWeatherPanelStates = () => {};
